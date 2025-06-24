import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from './settings.service';
import { SettingsService as CoreSettingsService } from '../../../core/settings/settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let mockConfigService: any;
  let mockCoreSettingsService: any;

  beforeEach(async () => {
    // Create mock services
    mockConfigService = {
      get: vi.fn().mockReturnValue({}),
    };

    mockCoreSettingsService = {
      get: vi.fn().mockReturnValue({}),
      updateSettings: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: CoreSettingsService,
          useValue: mockCoreSettingsService,
        },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSettings', () => {
    it('should merge core settings with config service settings', async () => {
      const mockCoreSettings = {
        frontend: { enabled: true, port: 8080 },
        mqtt: { server: 'mqtt://localhost:1883' },
        loglevel: 'info',
        devices: [],
      };

      const mockConfigSettings = {
        frontend: { host: '0.0.0.0' },
        mqtt: { username: 'test' },
      };

      mockCoreSettingsService.get.mockReturnValue(mockCoreSettings);
      mockConfigService.get.mockImplementation((key, defaultValue) => {
        return mockConfigSettings[key] || defaultValue || {};
      });

      const result = await service.getSettings();

      expect(result).toEqual({
        frontend: { host: '0.0.0.0', enabled: true, port: 8080 },
        mqtt: { username: 'test', server: 'mqtt://localhost:1883' },
        rfxcom: {},
        homeassistant: {},
        prometheus: {},
        healthcheck: {},
        loglevel: 'info',
        devices: [],
      });
    });
  });

  describe('updateSettings', () => {
    it('should validate and update settings successfully', async () => {
      const mockCurrentSettings = {
        loglevel: 'info',
        prometheus: { enabled: false },
      };

      const newSettings = {
        prometheus: { enabled: 'true', port: '9090' },
        loglevel: 'debug',
      };

      mockCoreSettingsService.get.mockReturnValue(mockCurrentSettings);
      mockCoreSettingsService.updateSettings.mockResolvedValue(undefined);

      await service.updateSettings(newSettings);

      expect(mockCoreSettingsService.updateSettings).toHaveBeenCalledWith({
        loglevel: 'debug',
        prometheus: { enabled: true, port: 9090 },
      });
    });

    it('should convert string boolean values to actual booleans', async () => {
      const mockCurrentSettings = {};
      const newSettings = {
        prometheus: { enabled: 'true' },
        rfxcom: { debug: 'false' },
        homeassistant: { discovery: 'true' },
      };

      mockCoreSettingsService.get.mockReturnValue(mockCurrentSettings);
      mockCoreSettingsService.updateSettings.mockResolvedValue(undefined);

      await service.updateSettings(newSettings);

      const expectedSettings = {
        prometheus: { enabled: true },
        rfxcom: { debug: false },
        homeassistant: { discovery: true },
      };

      expect(mockCoreSettingsService.updateSettings).toHaveBeenCalledWith(expectedSettings);
    });

    it('should convert string numeric values to numbers', async () => {
      const mockCurrentSettings = {};
      const newSettings = {
        prometheus: { port: '9090' },
        frontend: { port: '8080' },
        mqtt: { keepalive: '60' },
      };

      mockCoreSettingsService.get.mockReturnValue(mockCurrentSettings);
      mockCoreSettingsService.updateSettings.mockResolvedValue(undefined);

      await service.updateSettings(newSettings);

      const expectedSettings = {
        prometheus: { port: 9090 },
        frontend: { port: 8080 },
        mqtt: { keepalive: 60 },
      };

      expect(mockCoreSettingsService.updateSettings).toHaveBeenCalledWith(expectedSettings);
    });

    it('should throw error for invalid settings structure', async () => {
      await expect(service.updateSettings(null)).rejects.toThrow('Settings must be an object');
      await expect(service.updateSettings('invalid')).rejects.toThrow('Settings must be an object');
    });

    it('should throw error for invalid log level', async () => {
      const newSettings = { loglevel: 'invalid' };
      mockCoreSettingsService.get.mockReturnValue({});

      await expect(service.updateSettings(newSettings)).rejects.toThrow(
        'Log level must be one of: error, warn, info, debug, verbose'
      );
    });

    it('should throw error for invalid prometheus port', async () => {
      const newSettings = { prometheus: { port: 'invalid' } };
      mockCoreSettingsService.get.mockReturnValue({});

      await expect(service.updateSettings(newSettings)).rejects.toThrow(
        'Prometheus port must be a valid number'
      );
    });
  });

  describe('resetSettings', () => {
    it('should reset settings to defaults', async () => {
      mockCoreSettingsService.updateSettings.mockResolvedValue(undefined);

      await service.resetSettings();

      expect(mockCoreSettingsService.updateSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          loglevel: 'info',
          prometheus: expect.objectContaining({ enabled: false }),
          frontend: expect.objectContaining({ enabled: true }),
        })
      );
    });
  });

  describe('getSettingsSchema', () => {
    it('should return settings schema', async () => {
      const schema = await service.getSettingsSchema();

      expect(schema).toHaveProperty('frontend');
      expect(schema).toHaveProperty('mqtt');
      expect(schema).toHaveProperty('rfxcom');
      expect(schema).toHaveProperty('homeassistant');
      expect(schema).toHaveProperty('prometheus');
      expect(schema).toHaveProperty('loglevel');
      expect(schema).toHaveProperty('devices');

      expect(schema.prometheus.properties.enabled.type).toBe('boolean');
      expect(schema.prometheus.properties.port.type).toBe('number');
      expect(schema.loglevel.enum).toContain('info');
    });
  });
});
