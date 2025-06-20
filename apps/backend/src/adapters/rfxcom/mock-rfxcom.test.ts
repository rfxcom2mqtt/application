import { vi, describe, it, expect, beforeEach } from 'vitest';
import MockRfxcom from './Mock';
import { settingsService } from '../../config/settings';
import { RfxcomInfo } from '../../core/models';

// Mock the settings service
vi.mock('../../config/settings', () => ({
  settingsService: {
    get: vi.fn().mockReturnValue({
      rfxcom: {
        usbport: 'mock',
        debug: true,
        receive: ['lighting2', 'tempHumBaro1'],
      },
    }),
  },
}));

// Mock the logger
vi.mock('../../utils/logger', () => ({
  loggerFactory: {
    getLogger: vi.fn().mockReturnValue({
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }),
  },
}));

// Mock rfxcom library
vi.mock('rfxcom', () => {
  const mockRfxCom = vi.fn().mockImplementation(() => ({
    initialise: vi.fn(),
    close: vi.fn(),
    on: vi.fn(),
    removeAllListeners: vi.fn(),
  }));

  return {
    default: {
      RfxCom: mockRfxCom,
      packetNames: {
        lighting2: 'lighting2',
        tempHumBaro1: 'tempHumBaro1',
      },
      lighting2: {
        AC: 0,
      },
      tempHumBaro1: {
        WS1: 1,
      },
    },
    RfxCom: mockRfxCom,
    packetNames: {
      lighting2: 'lighting2',
      tempHumBaro1: 'tempHumBaro1',
    },
    lighting2: {
      AC: 0,
    },
    tempHumBaro1: {
      WS1: 1,
    },
  };
});

describe('MockRfxcom', () => {
  let mockRfxcom: MockRfxcom;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRfxcom = new MockRfxcom();
  });

  describe('initialise', () => {
    it('should resolve immediately', async () => {
      await expect(mockRfxcom.initialise()).resolves.toBeUndefined();
    });
  });

  describe('getStatus', () => {
    it('should call the callback with "online"', () => {
      // Arrange
      const callback = vi.fn();

      // Act
      mockRfxcom.getStatus(callback);

      // Assert
      expect(callback).toHaveBeenCalledWith('online');
    });
  });

  describe('onStatus', () => {
    it('should call the callback with mock RfxcomInfo', () => {
      // Arrange
      const callback = vi.fn();

      // Act
      mockRfxcom.onStatus(callback);

      // Assert
      expect(callback).toHaveBeenCalledWith(expect.any(RfxcomInfo));
      const info = callback.mock.calls[0][0] as RfxcomInfo;
      expect(info.receiverType).toBe('Mock');
      expect(info.hardwareVersion).toBe('1.2');
      expect(info.firmwareVersion).toBe(242);
      expect(info.enabledProtocols).toContain('LIGHTING4');
    });
  });

  describe('onCommand', () => {
    it('should log the command without errors', () => {
      // Act & Assert - should not throw
      expect(() => {
        mockRfxcom.onCommand('lighting2', '0x123456', '{"command": "On"}');
      }).not.toThrow();
    });
  });

  describe('onDisconnect', () => {
    it('should call the callback with an empty object', () => {
      // Arrange
      const callback = vi.fn();

      // Act
      mockRfxcom.onDisconnect(callback);

      // Assert
      expect(callback).toHaveBeenCalledWith({});
    });
  });

  describe('subscribeProtocolsEvent', () => {
    it('should call the callback with mock events', () => {
      // Arrange
      const callback = vi.fn();

      // Act
      mockRfxcom.subscribeProtocolsEvent(callback);

      // Assert
      expect(callback).toHaveBeenCalled();
      // The mock has multiple predefined events
      expect(callback.mock.calls.length).toBeGreaterThan(1);
    });
  });

  describe('isGroup', () => {
    it('should return true for lighting2 group commands', () => {
      // Arrange
      const event = {
        type: 'lighting2',
        commandNumber: 3,
      };

      // Act & Assert
      expect(mockRfxcom.isGroup(event as any)).toBe(true);
    });

    it('should return false for non-group commands', () => {
      // Arrange
      const event = {
        type: 'lighting2',
        commandNumber: 1,
      };

      // Act & Assert
      expect(mockRfxcom.isGroup(event as any)).toBe(false);
    });
  });

  describe('getSubType', () => {
    it('should return the correct subtype name', () => {
      // Act & Assert
      expect(mockRfxcom.getSubType('lighting2', '0')).toBe('AC');
    });

    it('should return empty string for unknown type', () => {
      // Act & Assert
      expect(mockRfxcom.getSubType('unknown', '0')).toBe('');
    });
  });

  describe('stop', () => {
    it('should not throw errors', () => {
      // Act & Assert
      expect(() => {
        mockRfxcom.stop();
      }).not.toThrow();
    });
  });

  describe('sendCommand', () => {
    it('should log the command without errors', () => {
      // Act & Assert
      expect(() => {
        mockRfxcom.sendCommand('lighting2', '0', 'On', '0x123456');
      }).not.toThrow();
    });
  });
});
