import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Router, Request, Response, NextFunction } from 'express';
import Discovery from '../../adapters/discovery';
import Api from '.';
import BridgeApi from './BridgeApi';
import DeviceApi from './DeviceApi';
import SettingApi from './SettingApi';
import { BridgeInfo } from '../../core/models';
import { DeviceStore } from '../../core/store/state';
import StateStore from '../../core/store/state';

// Mock the dependencies
vi.mock('express', () => ({
  Router: vi.fn(() => ({
    use: vi.fn(),
  })),
}));

vi.mock('./DeviceApi', () => ({
  default: vi.fn().mockImplementation(() => ({
    router: 'deviceApiRouter',
  })),
}));

vi.mock('./BridgeApi', () => ({
  default: vi.fn().mockImplementation(() => ({
    router: 'bridgeApiRouter',
  })),
}));

vi.mock('./SettingApi', () => ({
  default: vi.fn().mockImplementation(() => ({
    router: 'settingApiRouter',
  })),
}));

vi.mock('../../utils/logger', () => ({
  loggerFactory: {
    getLogger: vi.fn(() => ({
      info: vi.fn(),
      debug: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    })),
  },
}));

describe('API Index', () => {
  let api: Api;
  let mockDevices: DeviceStore;
  let mockState: StateStore;
  let mockDiscovery: Discovery;
  let mockBridgeInfo: BridgeInfo;
  let mockActionCallback: any;
  let mockRouter: any;
  let mockUseCallback: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockDevices = {} as DeviceStore;
    mockState = {} as StateStore;
    mockDiscovery = {} as Discovery;
    mockBridgeInfo = {} as BridgeInfo;
    mockActionCallback = vi.fn();
    mockUseCallback = vi.fn();
    mockRouter = {
      use: mockUseCallback,
    };

    (Router as any).mockReturnValue(mockRouter);

    api = new Api(mockDevices, mockState, mockDiscovery, mockBridgeInfo, mockActionCallback);
  });

  it('should create router and set up middleware', () => {
    // Assert
    expect(Router).toHaveBeenCalledTimes(1);
    expect(mockRouter.use).toHaveBeenCalledWith('*', expect.any(Function));
  });

  it('should initialize SettingApi and set up routes', () => {
    // Assert
    expect(SettingApi).toHaveBeenCalledTimes(1);
    expect(mockRouter.use).toHaveBeenCalledWith('/settings', 'settingApiRouter');
  });

  it('should initialize DeviceApi and set up routes', () => {
    // Assert
    expect(DeviceApi).toHaveBeenCalledTimes(1);
    expect(DeviceApi).toHaveBeenCalledWith(
      mockDevices,
      mockState,
      mockDiscovery,
      mockActionCallback
    );
    expect(mockRouter.use).toHaveBeenCalledWith('/devices', 'deviceApiRouter');
  });

  it('should initialize BridgeApi and set up routes', () => {
    // Assert
    expect(BridgeApi).toHaveBeenCalledTimes(1);
    expect(BridgeApi).toHaveBeenCalledWith(mockBridgeInfo, mockActionCallback);
    expect(mockRouter.use).toHaveBeenCalledWith('/bridge', 'bridgeApiRouter');
  });

  it('should log API requests in onApiRequest middleware', () => {
    // Arrange
    const mockReq = {
      method: 'get',
      originalUrl: '/api/test',
      body: { test: 'data' },
    } as unknown as Request;
    const mockRes = {} as Response;
    const mockNext = vi.fn() as NextFunction;

    // Find the middleware callback
    const middlewareCallback = mockUseCallback.mock.calls.find(call => call[0] === '*')[1];

    // Act
    middlewareCallback(mockReq, mockRes, mockNext);

    // Assert
    expect(mockNext).toHaveBeenCalledTimes(1);
  });
});
