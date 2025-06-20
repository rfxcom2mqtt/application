import { vi, describe, it, expect, beforeEach, afterAll } from 'vitest';

// Mock require function to return our mock package.json
const mockRequire = vi.fn();
mockRequire.mockImplementation((path: string) => {
  if (path.includes('package.json')) {
    return { version: '1.2.1' };
  }
  return vi.importActual(path);
});

// Replace global require with our mock
global.require = mockRequire;

import { ProxyConfig, getRfxcom2MQTTVersion } from './utils';

describe('Utils', () => {
  describe('getRfxcom2MQTTVersion', () => {
    it('should return the version from package.json', () => {
      // Act
      const version = getRfxcom2MQTTVersion();

      // Assert
      expect(version).toBe('1.0.0');
    });
  });

  describe('ProxyConfig', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      // Reset process.env before each test
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      // Restore original process.env after all tests
      process.env = originalEnv;
    });

    describe('getPublicPath', () => {
      it('should return API_BASE_PATH when set', () => {
        // Arrange
        process.env.API_BASE_PATH = '/api';

        // Act
        const result = ProxyConfig.getPublicPath();

        // Assert
        expect(result).toBe('/api');
      });

      it('should return empty string when API_BASE_PATH is not set', () => {
        // Arrange
        delete process.env.API_BASE_PATH;

        // Act
        const result = ProxyConfig.getPublicPath();

        // Assert
        expect(result).toBe('');
      });
    });

    describe('getBasePath', () => {
      it('should return API_BASE_PATH when set', () => {
        // Arrange
        process.env.API_BASE_PATH = '/api';

        // Act
        const result = ProxyConfig.getBasePath();

        // Assert
        expect(result).toBe('/api');
      });

      it('should return empty string when API_BASE_PATH is not set', () => {
        // Arrange
        delete process.env.API_BASE_PATH;

        // Act
        const result = ProxyConfig.getBasePath();

        // Assert
        expect(result).toBe('');
      });
    });

    describe('getSocketPath', () => {
      it('should return API_BASE_PATH + "/socket.io" when API_BASE_PATH is set', () => {
        // Arrange
        process.env.API_BASE_PATH = '/api';

        // Act
        const result = ProxyConfig.getSocketPath();

        // Assert
        expect(result).toBe('/api/socket.io');
      });

      it('should return "/socket.io" when API_BASE_PATH is not set', () => {
        // Arrange
        delete process.env.API_BASE_PATH;

        // Act
        const result = ProxyConfig.getSocketPath();

        // Assert
        expect(result).toBe('/socket.io');
      });
    });

    describe('getSocketNamespace', () => {
      it('should return WS_NAMESPACE when set', () => {
        // Arrange
        process.env.WS_NAMESPACE = '/ws';

        // Act
        const result = ProxyConfig.getSocketNamespace();

        // Assert
        expect(result).toBe('/ws');
      });

      it('should return empty string when WS_NAMESPACE is not set', () => {
        // Arrange
        delete process.env.WS_NAMESPACE;

        // Act
        const result = ProxyConfig.getSocketNamespace();

        // Assert
        expect(result).toBe('');
      });
    });
  });
});
