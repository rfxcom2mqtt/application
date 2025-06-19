import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Rfxcom, getRfxcomInstance } from '.';
import * as RfxcomModule from './Rfxcom';

// Mock the Rfxcom module
vi.mock('./Rfxcom', async () => {
  const originalModule = await vi.importActual('./Rfxcom');
  return {
    __esModule: true,
    ...originalModule,
    default: vi.fn(),
    getRfxcomInstance: vi.fn(),
  };
});

describe('RFXCOM Index', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should re-export Rfxcom class', () => {
    // Assert
    expect(Rfxcom).toBe(RfxcomModule.default);
  });

  it('should re-export getRfxcomInstance function', () => {
    // Arrange
    const mockInstance = { test: 'instance' };
    vi.mocked(RfxcomModule.getRfxcomInstance).mockReturnValue(mockInstance);

    // Act
    const result = getRfxcomInstance();

    // Assert
    expect(getRfxcomInstance).toBe(RfxcomModule.getRfxcomInstance);
    expect(RfxcomModule.getRfxcomInstance).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockInstance);
  });
});
