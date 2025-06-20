import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Router } from 'express';
import expressStaticGzip from 'express-static-gzip';
import fs from 'fs';
import path from 'path';
import Frontend from './Frontend';
import { loggerFactory } from '../utils/logger';
import { ProxyConfig } from '../utils/utils';

// Mock dependencies
vi.mock('fs', () => ({
  default: {
    writeFileSync: vi.fn(),
    readdir: vi.fn(),
  },
  writeFileSync: vi.fn(),
  readdir: vi.fn(),
}));

vi.mock('path', () => ({
  default: {
    join: vi.fn().mockImplementation((...args) => args.join('/')),
  },
  join: vi.fn().mockImplementation((...args) => args.join('/')),
}));

vi.mock('express', () => ({
  Router: vi.fn().mockReturnValue({
    use: vi.fn(),
  }),
}));

vi.mock('express-static-gzip', () => ({
  default: vi.fn().mockReturnValue('mock-express-static-gzip'),
}));

vi.mock('serve-static', () => ({
  default: vi.fn().mockReturnValue('mock-serve-static'),
}));

vi.mock('@rfxcom2mqtt/frontend', () => ({
  default: {
    setConfig: vi.fn(),
    getPath: vi.fn().mockReturnValue('/mock/frontend/path'),
  },
  setConfig: vi.fn(),
  getPath: vi.fn().mockReturnValue('/mock/frontend/path'),
}));

vi.mock('../utils/utils', () => ({
  ProxyConfig: {
    getBasePath: vi.fn().mockReturnValue('/api'),
    getSocketNamespace: vi.fn().mockReturnValue('/socket'),
  },
}));

vi.mock('../utils/logger', () => ({
  loggerFactory: {
    getLogger: vi.fn().mockReturnValue({
      info: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }),
  },
}));

describe('Frontend', () => {
  let frontend: Frontend;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    vi.clearAllMocks();
    originalEnv = process.env;
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should initialize with production frontend when PROFILE is not development', () => {
      // Arrange
      delete process.env.PROFILE;

      // Act
      frontend = new Frontend();

      // Assert
      expect(Router).toHaveBeenCalled();
      expect(expressStaticGzip).toHaveBeenCalledWith('/mock/frontend/path', expect.any(Object));
      expect(frontend.router.use).toHaveBeenCalledWith('mock-express-static-gzip');
      expect(frontend.pathStatic).toBe('/mock/frontend/path');
    });

    it('should initialize with development frontend when PROFILE is development', () => {
      // Arrange
      process.env.PROFILE = 'development';
      vi.mocked(path.join).mockImplementation((...args) => args.join('/'));

      // Act
      frontend = new Frontend();

      // Assert
      expect(Router).toHaveBeenCalled();
      expect(path.join).toHaveBeenCalledWith(expect.any(String), '../../../frontend/dist/');
      expect(fs.writeFileSync).toHaveBeenCalledWith(expect.any(String), expect.any(String), 'utf8');
      expect(frontend.router.use).toHaveBeenCalledWith('mock-serve-static');
      // The pathStatic should be the joined path from __dirname and buildPath
      expect(typeof frontend.pathStatic).toBe('string');
    });
  });

  describe('getFrontEndConfig', () => {
    it('should return the correct frontend config', () => {
      // Arrange
      frontend = new Frontend();
      vi.mocked(ProxyConfig.getBasePath).mockReturnValue('/api');
      vi.mocked(ProxyConfig.getSocketNamespace).mockReturnValue('/socket');

      // Act
      const config = frontend.getFrontEndConfig();

      // Assert
      expect(config).toBe(
        "window.config = { basePath: '/api', publicPath: '', wsNamespace: '/socket',};"
      );
    });

    it('should include API_PUBLIC_URL when set', () => {
      // Arrange
      process.env.API_PUBLIC_URL = 'https://example.com';
      frontend = new Frontend();

      // Act
      const config = frontend.getFrontEndConfig();

      // Assert
      expect(config).toBe(
        "window.config = { basePath: '/api', publicPath: 'https://example.com', wsNamespace: '/socket',};"
      );
    });
  });

  describe('listPublicFiles', () => {
    it('should log files in the directory', () => {
      // Arrange
      frontend = new Frontend();
      const mockFiles = ['index.html', 'main.js', 'styles.css'];
      vi.mocked(fs.readdir).mockImplementation((path, callback) => {
        callback(null, mockFiles);
      });
      const logger = loggerFactory.getLogger('API');

      // Act
      frontend.listPublicFiles('/test/path');

      // Assert
      expect(fs.readdir).toHaveBeenCalledWith('/test/path', expect.any(Function));
      expect(logger.debug).toHaveBeenCalledTimes(3);
      expect(logger.debug).toHaveBeenCalledWith('index.html');
      expect(logger.debug).toHaveBeenCalledWith('main.js');
      expect(logger.debug).toHaveBeenCalledWith('styles.css');
    });

    it('should handle errors when reading directory', () => {
      // Arrange
      frontend = new Frontend();
      const mockError = new Error('Failed to read directory');
      vi.mocked(fs.readdir).mockImplementation((path, callback) => {
        callback(mockError, null);
      });
      const logger = loggerFactory.getLogger('API');

      // Act
      frontend.listPublicFiles('/test/path');

      // Assert
      expect(fs.readdir).toHaveBeenCalledWith('/test/path', expect.any(Function));
      expect(logger.info).toHaveBeenCalledWith('Unable to scan directory: ' + mockError);
    });
  });

  describe('getPath', () => {
    it('should return the static path', () => {
      // Arrange
      frontend = new Frontend();
      frontend.pathStatic = '/test/static/path';

      // Act
      const result = frontend.getPath();

      // Assert
      expect(result).toBe('/test/static/path');
    });
  });
});
