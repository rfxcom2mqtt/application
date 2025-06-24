import { vi, describe, it, expect, beforeEach } from 'vitest';
import Controller from '../core/Controller';
import { getMqttInstance } from '../adapters/mqtt';
import { getRfxcomInstance } from '../adapters/rfxcom';
import { settingsService } from '../config/settings';
import { Lighting2Event } from '../core/models/rfxcom';
import { MockMqtt } from '../adapters/mqtt/MockMqtt';
import MockRfxcom from '../adapters/rfxcom/Mock';

// Mock the adapter modules
vi.mock('../adapters/mqtt', () => ({
  getMqttInstance: vi.fn(),
}));

vi.mock('../adapters/rfxcom', () => ({
  getRfxcomInstance: vi.fn(),
}));

// Mock the settings service
vi.mock('../config/settings', () => ({
  settingsService: {
    read: vi.fn(),
    get: vi.fn(),
  },
}));

// We're not mocking the logger to use the real implementation in e2e tests

// Mock utils module
vi.mock('../utils/utils', () => ({
  __esModule: true,
  default: {
    getRfxcom2MQTTVersion: vi.fn().mockReturnValue('1.2.1'),
  },
  getRfxcom2MQTTVersion: vi.fn().mockReturnValue('1.2.1'),
}));

// Only mock the external dependencies that we can't control in tests
vi.mock('node-cron');
vi.mock('../application');

// Mock the frontend package to avoid ES module issues
vi.mock('@rfxcom2mqtt/frontend', () => ({
  __esModule: true,
  default: {
    setConfig: vi.fn(),
  },
}));

describe('RFXCOM to MQTT End-to-End Flow', () => {
  let controller: Controller;
  let exitCallback: any;
  let mqttClient: MockMqtt;
  let rfxcomInstance: MockRfxcom;
  let statusHandler: any;
  let protocolEventHandler: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup test settings
    const testSettings = {
      frontend: {
        enabled: true,
        authToken: '',
        host: 'localhost',
        port: 8080,
        sslCert: '',
        sslKey: '',
      },
      prometheus: {
        enabled: false,
        port: 9090,
        host: 'localhost',
        path: '/metrics',
      },
      mqtt: {
        base_topic: 'rfxcom2mqtt',
        server: 'mock', // Use mock server to trigger MockMqtt
        port: 1883,
        retain: true,
        qos: 0 as const,
        include_device_information: true,
      },
      rfxcom: {
        usbport: 'mock', // Use mock port to trigger MockRfxcom
        debug: true,
        receive: ['lighting2', 'tempHumBaro1'],
        transmit: {
          repeat: 1,
          lighting1: [],
          lighting2: ['lighting2'],
          lighting3: [],
          lighting4: [],
        },
      },
      homeassistant: {
        discovery: true,
        discovery_topic: 'homeassistant',
        discovery_device: 'rfxcom2mqtt',
      },
      healthcheck: { enabled: false, cron: '* * * * *' },
      cacheState: { enable: false, saveInterval: 1 },
      loglevel: 'info' as const,
      devices: [],
    };

    // Configure the settings service mock
    vi.mocked(settingsService.read).mockReturnValue(testSettings);
    vi.mocked(settingsService.get).mockReturnValue(testSettings);

    // Create real instances of MockMqtt and MockRfxcom
    mqttClient = new MockMqtt();
    rfxcomInstance = new MockRfxcom();

    // Spy on the methods we need to track
    vi.spyOn(mqttClient, 'connect').mockImplementation(() => Promise.resolve());
    vi.spyOn(mqttClient, 'disconnect');
    vi.spyOn(mqttClient, 'addListener');
    vi.spyOn(mqttClient, 'publish').mockImplementation((topic, payload, callback) => callback());
    vi.spyOn(mqttClient, 'publishState');
    vi.spyOn(mqttClient, 'isConnected').mockReturnValue(true);

    vi.spyOn(rfxcomInstance, 'initialise').mockImplementation(() => Promise.resolve());
    vi.spyOn(rfxcomInstance, 'stop');
    vi.spyOn(rfxcomInstance, 'getStatus').mockImplementation(callback => callback('online'));
    vi.spyOn(rfxcomInstance, 'onStatus').mockImplementation(callback => {
      statusHandler = callback;
    });
    vi.spyOn(rfxcomInstance, 'onDisconnect');
    vi.spyOn(rfxcomInstance, 'subscribeProtocolsEvent').mockImplementation(callback => {
      protocolEventHandler = callback;
    });
    vi.spyOn(rfxcomInstance, 'onCommand');

    // Override the factory functions to return our instances
    (getMqttInstance as any).mockReturnValue(mqttClient);
    (getRfxcomInstance as any).mockReturnValue(rfxcomInstance);

    exitCallback = vi.fn();
    controller = new Controller(exitCallback);
  });

  describe('End-to-End Flow Tests', () => {
    it('should start all components and establish connections', async () => {
      // Act
      await controller.start();

      // Assert
      expect(rfxcomInstance.initialise).toHaveBeenCalled();
      expect(mqttClient.connect).toHaveBeenCalled();
      expect(rfxcomInstance.subscribeProtocolsEvent).toHaveBeenCalled();
      expect(rfxcomInstance.onStatus).toHaveBeenCalled();
      expect(rfxcomInstance.onDisconnect).toHaveBeenCalled();
    });

    it('should process RFXCOM events and publish them to MQTT', async () => {
      // Arrange
      await controller.start();

      // Verify handlers were registered
      expect(statusHandler).toBeDefined();
      expect(protocolEventHandler).toBeDefined();

      // Create a mock RFXCOM event
      const mockEvent: Lighting2Event = {
        id: '0x123ABC',
        seqnbr: 1,
        subtype: 0,
        unitCode: '1',
        commandNumber: 0,
        command: 'On',
        level: 15,
        rssi: 8,
        type: 'lighting2',
        deviceName: 'AC',
        group: false,
        subTypeValue: 'AC',
      };

      // Act - Simulate receiving an event from RFXCOM
      protocolEventHandler('lighting2', mockEvent);

      // Assert - Check if the event was published to MQTT
      // Find the call that contains the device ID and unit code
      const devicePublishCall = (mqttClient.publish as any).mock.calls.find(
        (call: any[]) =>
          typeof call[0] === 'string' &&
          call[0].includes('devices') &&
          call[0].includes('0x123ABC/1')
      );
      expect(devicePublishCall).toBeDefined();

      // Verify the payload contains the correct data
      if (devicePublishCall) {
        const payload = JSON.parse(devicePublishCall[1] as string);

        expect(payload).toMatchObject({
          id: '0x123ABC',
          type: 'lighting2',
          command: 'On',
          level: 15,
          unitCode: '1',
        });
      }
    });

    it('should process MQTT commands and send them to RFXCOM', async () => {
      // Arrange
      await controller.start();

      // Get the MQTT listeners that were registered
      // First listener is Discovery, second is Controller
      expect(mqttClient.addListener).toHaveBeenCalled();

      // Create a mock MQTT message
      const mqttMessage = {
        topic: 'rfxcom2mqtt/command/lighting2/0x123ABC/1',
        message: JSON.stringify({
          subtype: 'AC',
          deviceFunction: 'switchOn',
        }),
      };

      // Act - Simulate receiving a command from MQTT
      controller.onMQTTMessage(mqttMessage);

      // Assert - Check if the command was sent to RFXCOM
      expect(rfxcomInstance.onCommand).toHaveBeenCalledWith(
        'lighting2',
        '0x123ABC/1',
        expect.any(String),
        undefined
      );
    });

    it('should handle bridge status updates', async () => {
      // Arrange
      await controller.start();

      expect(statusHandler).toBeDefined();

      // Create a mock status update
      const mockStatus = {
        receiverTypeCode: 83,
        receiverType: 'RFXtrx433',
        hardwareVersion: '1.0',
        firmwareVersion: 242,
        firmwareType: 'Ext',
        enabledProtocols: ['LIGHTING2', 'OREGON'],
      };

      // Act - Simulate receiving a status update from RFXCOM
      statusHandler(mockStatus);

      // Assert - Check if the status was published to MQTT
      // Find the call that contains bridge/info
      const bridgeInfoCall = (mqttClient.publish as any).mock.calls.find(
        (call: any[]) => typeof call[0] === 'string' && call[0].includes('bridge/info')
      );
      expect(bridgeInfoCall).toBeDefined();

      // Verify the payload contains the correct data
      if (bridgeInfoCall) {
        const payload = JSON.parse(bridgeInfoCall[1] as string);

        expect(payload).toMatchObject({
          coordinator: mockStatus,
          version: '1.2.1',
        });
      }
    });

    it('should gracefully stop all components', async () => {
      // Arrange
      await controller.start();

      // Act
      await controller.stop();

      // Assert
      expect(mqttClient.disconnect).toHaveBeenCalled();
      expect(rfxcomInstance.stop).toHaveBeenCalled();
      expect(exitCallback).toHaveBeenCalledWith(0, false);
    });
  });
});
