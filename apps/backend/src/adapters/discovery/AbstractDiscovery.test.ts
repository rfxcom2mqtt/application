import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import AbstractDiscovery from './AbstractDiscovery';
import { settingsService } from '../../config/settings';
import utils from '../../utils/utils';

// Mock dependencies
vi.mock('../../config/settings', () => ({
  settingsService: {
    get: vi.fn().mockReturnValue({
      homeassistant: {
        discovery_topic: 'homeassistant',
      },
    }),
  },
}));

vi.mock('../../utils/utils', () => ({
  default: {
    getRfxcom2MQTTVersion: vi.fn().mockReturnValue('1.2.1'),
  },
  getRfxcom2MQTTVersion: vi.fn().mockReturnValue('1.2.1'),
}));

describe('AbstractDiscovery', () => {
  let discovery: AbstractDiscovery;
  let mockMqtt: any;
  let mockRfxtrx: any;

  beforeEach(() => {
    // Create mock MQTT client
    mockMqtt = {
      publish: vi.fn((topic, payload, callback, options, prefix) => {
        if (typeof callback === 'function') callback(null);
      }),
      topics: {
        base: 'rfxcom2mqtt',
        will: 'bridge/status',
        devices: 'devices',
      },
    };

    // Create mock RFXCOM interface
    mockRfxtrx = {
      // Add any required methods for testing
    };

    // Create instance of AbstractDiscovery
    discovery = new AbstractDiscovery(mockMqtt, mockRfxtrx);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with the correct properties', () => {
      // Assert
      expect(discovery.getMqtt()).toBe(mockMqtt);
      expect(discovery.getRfxtrx()).toBe(mockRfxtrx);
      expect(discovery.getTopicWill()).toBe('rfxcom2mqtt/bridge/status');
      expect(discovery.getTopicDevice()).toBe('rfxcom2mqtt/devices');
      expect(discovery.getBaseTopic()).toBe('rfxcom2mqtt');
      expect(discovery.getDiscoveryOrigin()).toEqual({
        name: 'Rfxcom2MQTT',
        sw: '',
        url: 'https://rfxcom2mqtt.github.io/rfxcom2mqtt/',
      });
    });
  });

  describe('start', () => {
    it('should set the software version in discoveryOrigin', async () => {
      // Act
      await discovery.start();

      // Assert
      expect(utils.getRfxcom2MQTTVersion).toHaveBeenCalled();
      expect(discovery.getDiscoveryOrigin().sw).toBe('1.2.1');
    });
  });

  describe('stop', () => {
    it('should not throw an error', async () => {
      // Act & Assert
      await expect(discovery.stop()).resolves.not.toThrow();
    });
  });

  describe('publishDiscovery', () => {
    it('should publish to the correct topic with retain and qos options', () => {
      // Arrange
      const topic = 'test/topic';
      const payload = { test: 'value' };

      // Act
      discovery.publishDiscovery(topic, payload);

      // Assert
      expect(mockMqtt.publish).toHaveBeenCalledWith(
        topic,
        payload,
        expect.any(Function),
        { retain: true, qos: 1 },
        'homeassistant'
      );
    });

    it('should use the discovery topic from settings', () => {
      // Arrange
      const customDiscoveryTopic = 'custom_discovery';
      vi.mocked(settingsService.get).mockReturnValueOnce({
        homeassistant: {
          discovery_topic: customDiscoveryTopic,
        },
      });

      // Act
      discovery.publishDiscovery('test/topic', {});

      // Assert
      expect(mockMqtt.publish).toHaveBeenCalledWith(
        'test/topic',
        {},
        expect.any(Function),
        { retain: true, qos: 1 },
        customDiscoveryTopic
      );
    });

    it('should handle errors in the callback', () => {
      // Arrange
      mockMqtt.publish = vi.fn((topic, payload, callback) => {
        if (typeof callback === 'function') callback(new Error('Test error'));
      });

      // Act & Assert - should not throw
      expect(() => {
        discovery.publishDiscovery('test/topic', {});
      }).not.toThrow();
    });
  });
});
