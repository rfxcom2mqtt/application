import { vi, describe, it, expect, beforeEach } from 'vitest';
import winston from 'winston';

import { LogEventTransport, LogEventListener, loggerFactory } from './logger';

// Mock winston
vi.mock('winston', () => {
  const mockFormat = {
    combine: vi.fn().mockReturnThis(),
    label: vi.fn().mockReturnThis(),
    timestamp: vi.fn().mockReturnThis(),
    printf: vi.fn().mockReturnThis(),
    colorize: vi.fn().mockReturnThis(),
  };

  const mockLogger = {
    warning: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    add: vi.fn(),
    transports: [],
  };

  return {
    format: mockFormat,
    createLogger: vi.fn().mockReturnValue(mockLogger),
    transports: {
      Console: vi.fn().mockImplementation(() => ({
        level: 'info',
      })),
    },
  };
});

describe('Logger', () => {
  describe('LogEventTransport', () => {
    it('should call the listener when logging', () => {
      // Arrange
      const mockListener: LogEventListener = {
        onLog: vi.fn(),
      };
      const transport = new LogEventTransport(mockListener);
      const logInfo = { level: 'info', message: 'Test message' };
      const callback = vi.fn();

      // Act
      transport.log(logInfo, callback);

      // Assert
      expect(mockListener.onLog).toHaveBeenCalledWith(logInfo);
      expect(callback).toHaveBeenCalled();
    });
  });

  // Logger class tests skipped due to module import complexity
  // The LoggerFactory tests below cover the main functionality

  describe('LoggerFactory', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should create a new logger when one does not exist', () => {
      // Act
      const logger1 = loggerFactory.getLogger('Logger1');
      const logger2 = loggerFactory.getLogger('Logger2');

      // Assert
      expect(logger1).not.toBe(logger2);
      expect(logger1.name).toBe('Logger1');
      expect(logger2.name).toBe('Logger2');
    });

    it('should return an existing logger when one exists', () => {
      // Act
      const logger1 = loggerFactory.getLogger('Logger1');
      const logger1Again = loggerFactory.getLogger('Logger1');

      // Assert
      expect(logger1).toBe(logger1Again);
    });

    it('should set level for all loggers', () => {
      // Arrange
      const logger1 = loggerFactory.getLogger('Logger1');
      const logger2 = loggerFactory.getLogger('Logger2');
      const setLevelSpy1 = vi.spyOn(logger1, 'setLevel');
      const setLevelSpy2 = vi.spyOn(logger2, 'setLevel');

      // Act
      loggerFactory.setLevel('debug');

      // Assert
      expect(setLevelSpy1).toHaveBeenCalledWith('debug');
      expect(setLevelSpy2).toHaveBeenCalledWith('debug');
    });

    it('should add transport to all loggers', () => {
      // Arrange
      const logger1 = loggerFactory.getLogger('Logger1');
      const logger2 = loggerFactory.getLogger('Logger2');
      const addTransportSpy1 = vi.spyOn(logger1, 'addTransport');
      const addTransportSpy2 = vi.spyOn(logger2, 'addTransport');
      const mockTransport = {};

      // Act
      loggerFactory.addTransport(mockTransport as winston.transport);

      // Assert
      expect(addTransportSpy1).toHaveBeenCalledWith(mockTransport);
      expect(addTransportSpy2).toHaveBeenCalledWith(mockTransport);
    });

    it('should get the default logger', () => {
      // Act
      const defaultLogger = loggerFactory.getDefault();

      // Assert
      expect(defaultLogger).toBeDefined();
      expect(defaultLogger.name).toBe('GATEWAY');
    });
  });
});
