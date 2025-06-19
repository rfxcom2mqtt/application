import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import BridgeApi from './BridgeApi';
import { BridgeInfo, Action } from '../../core/models';

// Mock Express Router
vi.mock('express', () => ({
  Router: vi.fn().mockReturnValue({
    get: vi.fn().mockReturnThis(),
    post: vi.fn().mockReturnThis(),
  }),
}));

describe('BridgeApi', () => {
  let bridgeApi: BridgeApi;
  let mockBridgeInfo: BridgeInfo;
  let mockActionCallback: ReturnType<typeof vi.fn>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup mocks
    mockBridgeInfo = {
      version: '1.2.1',
      coordinator: {
        receiverType: 'Test',
        firmwareVersion: 123,
      },
      logLevel: 'info',
    } as BridgeInfo;

    mockActionCallback = vi.fn();

    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    // Create BridgeApi instance
    bridgeApi = new BridgeApi(mockBridgeInfo, mockActionCallback);
  });

  describe('constructor', () => {
    it('should initialize with the provided bridge info and set up routes', async () => {
      // Arrange
      const express = await import('express');
      const mockRouter = vi.mocked(express.Router)();

      // Assert
      expect(express.Router).toHaveBeenCalled();
      expect(mockRouter.get).toHaveBeenCalledWith('/info', expect.any(Function));
      expect(mockRouter.post).toHaveBeenCalledWith('/action', expect.any(Function));
    });
  });

  describe('GET /info', () => {
    it('should return bridge info', async () => {
      // Arrange
      const express = await import('express');
      const mockRouter = vi.mocked(express.Router)();
      const infoHandler = vi.mocked(mockRouter.get).mock.calls[0][1];

      // Act
      infoHandler(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(mockBridgeInfo);
    });
  });

  describe('POST /action', () => {
    it('should call action callback with bridge action', async () => {
      // Arrange
      const express = await import('express');
      const mockRouter = vi.mocked(express.Router)();
      const actionHandler = vi.mocked(mockRouter.post).mock.calls[0][1];
      mockRequest.body = { action: 'restart' };

      // Act
      actionHandler(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockActionCallback).toHaveBeenCalledWith(new Action('bridge', 'restart'));
      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({});
    });

    it('should handle missing action in request body', async () => {
      // Arrange
      const express = await import('express');
      const mockRouter = vi.mocked(express.Router)();
      const actionHandler = vi.mocked(mockRouter.post).mock.calls[0][1];
      mockRequest.body = {};

      // Act
      actionHandler(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockActionCallback).toHaveBeenCalledWith(new Action('bridge', undefined));
      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({});
    });
  });
});
