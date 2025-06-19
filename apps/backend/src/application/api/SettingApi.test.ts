import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import SettingApi from './SettingApi';
import { settingsService } from '../../config/settings';

// Mock Express Router
vi.mock('express', () => ({
  Router: vi.fn().mockReturnValue({
    get: vi.fn().mockReturnThis(),
    post: vi.fn().mockReturnThis(),
  }),
}));

// Mock settings service
vi.mock('../../config/settings', () => ({
  settingsService: {
    get: vi.fn().mockReturnValue({
      frontend: { enabled: true },
      mqtt: { base_topic: 'rfxcom2mqtt' },
      rfxcom: { usbport: '/dev/ttyUSB0' },
      homeassistant: { discovery: true },
      healthcheck: { enabled: false },
    }),
    apply: vi.fn(),
  },
}));

describe('SettingApi', () => {
  let settingApi: SettingApi;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockRouter: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mocks
    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    // Create SettingApi instance
    settingApi = new SettingApi();

    // Get the mock router
    mockRouter = require('express').Router();
  });

  describe('constructor', () => {
    it('should initialize and set up routes', async () => {
      // Arrange
      const express = await import('express');
      const mockRouter = vi.mocked(express.Router)();

      // Assert
      expect(express.Router).toHaveBeenCalled();
      expect(mockRouter.get).toHaveBeenCalledWith('/', expect.any(Function));
      expect(mockRouter.post).toHaveBeenCalledWith('/', expect.any(Function));
    });
  });

  describe('GET /', () => {
    it('should return settings', async () => {
      // Arrange
      const express = await import('express');
      const mockRouter = vi.mocked(express.Router)();
      const getHandler = vi.mocked(mockRouter.get).mock.calls[0][1];
      const mockSettings = {
        frontend: { enabled: true },
        mqtt: { base_topic: 'rfxcom2mqtt' },
        rfxcom: { usbport: '/dev/ttyUSB0' },
        homeassistant: { discovery: true },
        healthcheck: { enabled: false },
      };
      vi.mocked(settingsService.get).mockReturnValue(mockSettings);

      // Act
      getHandler(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(settingsService.get).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(mockSettings);
    });
  });

  describe('POST /', () => {
    it('should apply settings and return updated settings', async () => {
      // Arrange
      const express = await import('express');
      const mockRouter = vi.mocked(express.Router)();
      const postHandler = vi.mocked(mockRouter.post).mock.calls[0][1];
      const newSettings = {
        frontend: { enabled: false },
        mqtt: { base_topic: 'custom/topic' },
      };
      mockRequest.body = newSettings;

      const updatedSettings = {
        frontend: { enabled: false },
        mqtt: { base_topic: 'custom/topic' },
        rfxcom: { usbport: '/dev/ttyUSB0' },
        homeassistant: { discovery: true },
        healthcheck: { enabled: false },
      };
      vi.mocked(settingsService.get).mockReturnValue(updatedSettings);

      // Act
      postHandler(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(settingsService.apply).toHaveBeenCalledWith(newSettings);
      expect(settingsService.get).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedSettings);
    });

    it('should handle empty request body', async () => {
      // Arrange
      const express = await import('express');
      const mockRouter = vi.mocked(express.Router)();
      const postHandler = vi.mocked(mockRouter.post).mock.calls[0][1];
      mockRequest.body = {};

      const settings = {
        frontend: { enabled: true },
        mqtt: { base_topic: 'rfxcom2mqtt' },
        rfxcom: { usbport: '/dev/ttyUSB0' },
        homeassistant: { discovery: true },
        healthcheck: { enabled: false },
      };
      vi.mocked(settingsService.get).mockReturnValue(settings);

      // Act
      postHandler(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(settingsService.apply).toHaveBeenCalledWith({});
      expect(settingsService.get).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(settings);
    });
  });
});
