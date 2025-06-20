import { vi, describe, it, expect, beforeEach } from 'vitest';
import Discovery from '../adapters/discovery';
import { getMqttInstance } from '../adapters/mqtt';
import { getRfxcomInstance } from '../adapters/rfxcom';
import Server from '../application';
import { settingsService } from '../config/settings';
import { BRIDGE_ACTIONS } from '../constants';
import Controller from './Controller';
import { BridgeInfo, Action } from './models';

// Create mock instances
const mockMqttInstance = {
  connect: vi.fn().mockResolvedValue(undefined),
  disconnect: vi.fn().mockResolvedValue(undefined),
  addListener: vi.fn(),
  publish: vi.fn(),
  publishState: vi.fn(),
  topics: {
    base: 'rfxcom2mqtt',
    devices: 'rfxcom2mqtt/devices',
    info: 'rfxcom2mqtt/bridge/info',
  },
};

const mockRfxcomInstance = {
  initialise: vi.fn().mockResolvedValue(undefined),
  stop: vi.fn().mockResolvedValue(undefined),
  getStatus: vi.fn().mockImplementation(callback => callback('online')),
  onStatus: vi.fn(),
  onDisconnect: vi.fn(),
  subscribeProtocolsEvent: vi.fn(),
  onCommand: vi.fn(),
};

const mockServerInstance = {
  start: vi.fn(),
  stop: vi.fn().mockResolvedValue(undefined),
  enableApi: vi.fn(),
};

const mockDiscoveryInstance = {
  start: vi.fn().mockResolvedValue(undefined),
  stop: vi.fn().mockResolvedValue(undefined),
  publishDiscoveryToMQTT: vi.fn(),
  onMQTTMessage: vi.fn(),
};

// Mock dependencies
vi.mock('../adapters/mqtt', () => ({
  getMqttInstance: vi.fn(() => mockMqttInstance),
}));

vi.mock('../adapters/rfxcom', () => ({
  getRfxcomInstance: vi.fn(() => mockRfxcomInstance),
}));

vi.mock('../adapters/discovery', () => ({
  __esModule: true,
  default: vi.fn(() => mockDiscoveryInstance),
}));

vi.mock('../application', () => ({
  __esModule: true,
  default: vi.fn(() => mockServerInstance),
}));

vi.mock('@rfxcom2mqtt/frontend', () => ({
  __esModule: true,
  default: {
    setConfig: vi.fn(),
    getPath: vi.fn().mockReturnValue('/path/to/frontend'),
  },
}));

vi.mock('../application/Frontend', () => ({
  __esModule: true,
  default: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    stop: vi.fn(),
  })),
}));

vi.mock('../config/settings', () => ({
  settingsService: {
    read: vi.fn().mockReturnValue({
      frontend: { enabled: true },
      mqtt: { base_topic: 'rfxcom2mqtt' },
      rfxcom: { usbport: '/dev/ttyUSB0' },
      homeassistant: { discovery: true },
      healthcheck: { enabled: false },
    }),
    get: vi.fn().mockReturnValue({
      frontend: { enabled: true },
      mqtt: { base_topic: 'rfxcom2mqtt' },
      rfxcom: { usbport: '/dev/ttyUSB0' },
      homeassistant: { discovery: true },
      healthcheck: { enabled: false },
      devices: [],
    }),
  },
}));

vi.mock('../utils/utils', () => ({
  getRfxcom2MQTTVersion: vi.fn().mockReturnValue('1.2.1'),
  ProxyConfig: {
    getPublicPath: vi.fn().mockReturnValue('/api'),
    getBasePath: vi.fn().mockReturnValue('/api'),
    getSocketPath: vi.fn().mockReturnValue('/api/socket.io'),
    getSocketNamespace: vi.fn().mockReturnValue(''),
  },
}));

vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  loggerFactory: {
    getLogger: vi.fn().mockReturnValue({
      info: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }),
  },
}));

vi.mock('node-cron', () => ({
  schedule: vi.fn(),
}));

describe('Controller', () => {
  let controller: Controller;
  let exitCallback: any;

  beforeEach(() => {
    vi.clearAllMocks();
    exitCallback = vi.fn();
    controller = new Controller(exitCallback);
  });

  describe('constructor', () => {
    it('should initialize components', () => {
      // Assert
      expect(settingsService.read).toHaveBeenCalled();
      expect(getMqttInstance).toHaveBeenCalled();
      expect(getRfxcomInstance).toHaveBeenCalled();
      expect(Discovery).toHaveBeenCalled();
      expect(Server).toHaveBeenCalled();
    });
  });

  describe('start', () => {
    it('should start all components', async () => {
      // Act
      await controller.start();

      // Assert
      expect(mockServerInstance.start).toHaveBeenCalled();
      expect(mockRfxcomInstance.initialise).toHaveBeenCalled();
      expect(mockRfxcomInstance.subscribeProtocolsEvent).toHaveBeenCalled();
      expect(mockRfxcomInstance.onStatus).toHaveBeenCalled();
      expect(mockRfxcomInstance.onDisconnect).toHaveBeenCalled();
      expect(mockMqttInstance.connect).toHaveBeenCalled();
    });

    it('should handle RFXCOM initialization error', async () => {
      // Arrange
      const error = new Error('RFXCOM initialization failed');
      mockRfxcomInstance.initialise.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(controller.start()).rejects.toThrow();
    });

    it('should handle MQTT connection error', async () => {
      // Arrange
      const error = new Error('MQTT connection failed');
      mockMqttInstance.connect.mockRejectedValueOnce(error);

      // Act
      await controller.start();

      // Assert
      expect(mockRfxcomInstance.stop).toHaveBeenCalled();
      expect(exitCallback).toHaveBeenCalledWith(1, false);
    });
  });

  describe('stop', () => {
    it('should stop all components', async () => {
      // Act
      await controller.stop();

      // Assert
      expect(exitCallback).toHaveBeenCalled();
    });

    it('should handle errors during shutdown', async () => {
      // Arrange
      const error = new Error('Shutdown error');
      mockMqttInstance.disconnect.mockRejectedValueOnce(error);

      // Act
      await controller.stop();

      // Assert
      expect(exitCallback).toHaveBeenCalledWith(1, false);
    });

    it('should pass restart flag to exit callback', async () => {
      // Arrange
      mockMqttInstance.disconnect.mockResolvedValueOnce(undefined);

      // Act
      await controller.stop(true);

      // Assert
      expect(exitCallback).toHaveBeenCalledWith(expect.any(Number), true);
    });
  });

  describe('runAction', () => {
    it('should run bridge action', async () => {
      // Arrange
      const action = new Action('bridge', BRIDGE_ACTIONS.RESTART);
      const restartSpy = vi
        .spyOn(controller as any, 'restartBridge')
        .mockResolvedValueOnce(undefined);

      // Act
      await controller.runAction(action);

      // Assert
      expect(restartSpy).toHaveBeenCalled();
    });

    it('should run device action', async () => {
      // Arrange
      const action = new Action('device', 'switchOn', 'device1', 'entity1');
      const runDeviceActionSpy = vi
        .spyOn(controller as any, 'runDeviceAction')
        .mockResolvedValueOnce(undefined);

      // Act
      await controller.runAction(action);

      // Assert
      expect(runDeviceActionSpy).toHaveBeenCalledWith('device1', 'entity1', 'switchOn');
    });

    it('should handle unknown action type', async () => {
      // Arrange
      const action = { type: 'unknown', action: 'test' } as any;

      // Act
      await controller.runAction(action);

      // No assertion needed, just checking it doesn't throw
    });
  });

  describe('onMQTTMessage', () => {
    it('should handle command messages', () => {
      // Arrange
      const data = {
        topic: 'rfxcom2mqtt/command/lighting2/0x123456/1',
        message: '{"command":"on"}',
      };

      // Act
      controller.onMQTTMessage(data);

      // Assert
      expect(mockRfxcomInstance.onCommand).toHaveBeenCalledWith(
        'lighting2',
        '0x123456/1',
        '{"command":"on"}',
        undefined
      );
    });

    it('should handle invalid topic structure', () => {
      // Arrange
      const data = {
        topic: 'invalid/topic',
        message: '{"command":"on"}',
      };

      // Act
      controller.onMQTTMessage(data);

      // Assert
      expect(mockRfxcomInstance.onCommand).not.toHaveBeenCalled();
    });
  });

  describe('subscribeTopic', () => {
    it('should return the correct topics', () => {
      // Act
      const topics = controller.subscribeTopic();

      // Assert
      expect(topics).toEqual(['rfxcom2mqtt/command/#']);
    });
  });
});
