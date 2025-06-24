import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let mockAppService: AppService;

  beforeEach(() => {
    // Create a mock service
    mockAppService = {
      getHello: vi.fn().mockReturnValue('RFXCOM2MQTT NestJS Backend is running!'),
      getHealth: vi.fn().mockReturnValue({
        status: 'ok',
        timestamp: '2023-01-01T00:00:00.000Z',
        service: 'rfxcom2mqtt-nestjs',
        version: '1.0.0',
      }),
    } as any;

    // Create controller with mocked service
    appController = new AppController(mockAppService);
  });

  describe('getHello', () => {
    it('should return "RFXCOM2MQTT NestJS Backend is running!"', () => {
      const result = appController.getHello();
      expect(result).toBe('RFXCOM2MQTT NestJS Backend is running!');
      expect(mockAppService.getHello).toHaveBeenCalled();
    });
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const health = appController.getHealth();
      expect(health).toHaveProperty('status', 'ok');
      expect(health).toHaveProperty('service', 'rfxcom2mqtt-nestjs');
      expect(health).toHaveProperty('version', '1.0.0');
      expect(health).toHaveProperty('timestamp');
      expect(mockAppService.getHealth).toHaveBeenCalled();
    });
  });
});

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  describe('getHello', () => {
    it('should return "RFXCOM2MQTT NestJS Backend is running!"', () => {
      expect(service.getHello()).toBe('RFXCOM2MQTT NestJS Backend is running!');
    });
  });

  describe('getHealth', () => {
    it('should return health status object', () => {
      const health = service.getHealth();
      expect(health).toHaveProperty('status', 'ok');
      expect(health).toHaveProperty('service', 'rfxcom2mqtt-nestjs');
      expect(health).toHaveProperty('version', '1.0.0');
      expect(health).toHaveProperty('timestamp');
    });
  });
});
