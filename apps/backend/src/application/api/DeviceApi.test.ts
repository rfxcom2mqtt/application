import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import Discovery from '../../adapters/discovery';
import DeviceApi from './DeviceApi';
import { settingsService } from '../../config/settings';
import { Action, DeviceStateStore } from '../../core/models';
import StateStore, { DeviceStore } from '../../core/store/state';
import { loggerFactory } from '../../utils/logger';

// Create mock router instance
const mockRouter = {
  get: vi.fn().mockReturnThis(),
  post: vi.fn().mockReturnThis(),
};

// Mock Express Router
vi.mock('express', () => ({
  Router: vi.fn(() => mockRouter),
}));

// Mock Discovery
vi.mock('../../adapters/discovery', () => ({
  __esModule: true,
  default: vi.fn().mockImplementation(() => ({
    publishDiscoveryDeviceToMqtt: vi.fn(),
  })),
}));

// Mock settings service
vi.mock('../../config/settings', () => ({
  settingsService: {
    get: vi.fn().mockReturnValue({
      homeassistant: {
        discovery_device: 'rfxcom2mqtt',
      },
    }),
    applyDeviceOverride: vi.fn(),
  },
}));

// Mock DeviceStateStore
vi.mock('../../core/models', () => ({
  DeviceStateStore: vi.fn().mockImplementation(state => ({
    state,
    overrideDeviceInfo: vi.fn(),
    getSensors: vi.fn().mockReturnValue([
      { id: 'sensor1', type: 'temperature' },
      { id: 'sensor2', type: 'humidity' },
    ]),
  })),
  Action: vi.fn().mockImplementation((type, action, deviceId, entityId) => ({
    type,
    action,
    deviceId,
    entityId,
  })),
}));

// Mock lookup
vi.mock('../../adapters/discovery/Homeassistant', () => ({
  lookup: {
    temperature: { name: 'Temperature', icon: 'thermometer' },
    humidity: { name: 'Humidity', icon: 'water-percent' },
  },
}));

// Mock logger
vi.mock('../../utils/logger', () => ({
  loggerFactory: {
    getLogger: vi.fn().mockReturnValue({
      info: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }),
  },
}));

describe('DeviceApi', () => {
  let deviceApi: DeviceApi;
  let mockDevicesStore: DeviceStore;
  let mockState: StateStore;
  let mockDiscovery: Discovery;
  let mockActionCallback: any;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mocks
    mockDevicesStore = {
      getAll: vi.fn().mockReturnValue([
        { id: 'device1', name: 'Device 1' },
        { id: 'device2', name: 'Device 2' },
      ]),
      get: vi.fn().mockReturnValue({ id: 'device1', name: 'Device 1' }),
      set: vi.fn(),
    } as unknown as DeviceStore;

    mockState = {
      getByDeviceId: vi.fn().mockReturnValue([
        { id: 'state1', value: 'on' },
        { id: 'state2', value: 'off' },
      ]),
    } as unknown as StateStore;

    // Create mock objects for Discovery constructor
    const mockMqtt = {
      topics: { base: 'rfxcom2mqtt' },
    } as any;

    const mockRfxcom = {} as any;

    mockDiscovery = new Discovery(mockMqtt, mockRfxcom, mockState, mockDevicesStore);

    mockActionCallback = vi.fn();

    mockRequest = {
      params: {},
      body: {},
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    // Create DeviceApi instance
    deviceApi = new DeviceApi(mockDevicesStore, mockState, mockDiscovery, mockActionCallback);
  });

  describe('constructor', () => {
    it('should initialize and set up routes', () => {
      // Assert - just check that the routes were set up
      expect(mockRouter.get).toHaveBeenCalledWith('/', expect.any(Function));
      expect(mockRouter.get).toHaveBeenCalledWith('/:id', expect.any(Function));
      expect(mockRouter.post).toHaveBeenCalledWith('/:id/rename', expect.any(Function));
      expect(mockRouter.get).toHaveBeenCalledWith('/:id/state', expect.any(Function));
      expect(mockRouter.post).toHaveBeenCalledWith('/:id/action', expect.any(Function));
      expect(mockRouter.post).toHaveBeenCalledWith(
        '/:id/switch/:itemId/rename',
        expect.any(Function)
      );
    });
  });

  describe('GET /', () => {
    it('should return all devices with overridden info', () => {
      // Arrange
      const getAllHandler = mockRouter.get.mock.calls.find(call => call[0] === '/')[1];

      // Act
      getAllHandler(mockRequest, mockResponse);

      // Assert
      expect(mockDevicesStore.getAll).toHaveBeenCalled();
      expect(DeviceStateStore).toHaveBeenCalledTimes(2);
      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith([
        { id: 'device1', name: 'Device 1' },
        { id: 'device2', name: 'Device 2' },
      ]);
    });
  });

  describe('GET /:id', () => {
    it('should return device info with sensors', () => {
      // Arrange
      const getDeviceHandler = mockRouter.get.mock.calls.find(call => call[0] === '/:id')[1];
      mockRequest.params = { id: 'device1' };

      // Act
      getDeviceHandler(mockRequest, mockResponse);

      // Assert
      expect(mockDevicesStore.get).toHaveBeenCalledWith('device1');
      expect(DeviceStateStore).toHaveBeenCalledWith({
        id: 'device1',
        name: 'Device 1',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        id: 'device1',
        name: 'Device 1',
      });
    });
  });

  describe('POST /:id/rename', () => {
    it('should rename device and update discovery', () => {
      // Arrange
      const renameHandler = mockRouter.post.mock.calls.find(call => call[0] === '/:id/rename')[1];
      mockRequest.params = { id: 'device1' };
      mockRequest.body = { name: 'New Device Name' };

      // Act
      renameHandler(mockRequest, mockResponse);

      // Assert
      expect(settingsService.applyDeviceOverride).toHaveBeenCalledWith({
        id: 'device1',
        name: 'New Device Name',
      });
      expect(mockDevicesStore.get).toHaveBeenCalledWith('device1');
      expect(mockDevicesStore.set).toHaveBeenCalledWith('device1', {
        id: 'device1',
        name: 'Device 1',
      });
      expect(mockDiscovery.publishDiscoveryDeviceToMqtt).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({});
    });
  });

  describe('GET /:id/state', () => {
    it('should return device state', () => {
      // Arrange
      const getStateHandler = mockRouter.get.mock.calls.find(call => call[0] === '/:id/state')[1];
      mockRequest.params = { id: 'device1' };

      // Act
      getStateHandler(mockRequest, mockResponse);

      // Assert
      expect(mockState.getByDeviceId).toHaveBeenCalledWith('device1');
      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith([
        { id: 'state1', value: 'on' },
        { id: 'state2', value: 'off' },
      ]);
    });
  });

  describe('POST /:id/action', () => {
    it('should execute device action', () => {
      // Arrange
      const actionHandler = mockRouter.post.mock.calls.find(call => call[0] === '/:id/action')[1];
      mockRequest.params = { id: 'device1' };
      mockRequest.body = { action: 'toggle', entityId: 'switch1' };

      // Act
      actionHandler(mockRequest, mockResponse);

      // Assert
      expect(mockActionCallback).toHaveBeenCalledWith(
        new Action('device', 'toggle', 'device1', 'switch1')
      );
      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({});
    });
  });

  describe('POST /:id/switch/:itemId/rename', () => {
    it('should rename device sensor', () => {
      // Arrange
      const renameSensorHandler = mockRouter.post.mock.calls.find(
        call => call[0] === '/:id/switch/:itemId/rename'
      )[1];
      mockRequest.params = { id: 'device1', itemId: 'sensor1' };
      mockRequest.body = { name: 'New Sensor Name', unitCode: '1' };

      // Act
      renameSensorHandler(mockRequest, mockResponse);

      // Assert
      expect(settingsService.applyDeviceOverride).toHaveBeenCalledWith({
        id: 'device1',
        units: [{ unitCode: 1, name: 'New Sensor Name' }],
      });
      expect(mockDevicesStore.get).toHaveBeenCalledWith('device1');
      expect(mockDevicesStore.set).toHaveBeenCalledWith('device1', {
        id: 'device1',
        name: 'Device 1',
      });
      expect(mockDiscovery.publishDiscoveryDeviceToMqtt).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({});
    });
  });
});
