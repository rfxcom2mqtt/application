import { vi } from 'vitest';
import { getMqttInstance } from './';
import { MockMqtt } from './MockMqtt';
import Mqtt from './Mqtt';
import { settingsService } from '../../config/settings';

// Mock the settings service
vi.mock('../../config/settings', () => ({
  settingsService: {
    get: vi.fn(),
  },
}));

// Mock the Mqtt and MockMqtt classes
vi.mock('./Mqtt');
vi.mock('./MockMqtt');

describe('MQTT Index', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return MockMqtt instance when server is set to "mock"', () => {
    // Arrange
    (settingsService.get as any).mockReturnValue({
      mqtt: { server: 'mock' },
    });

    // Act
    const result = getMqttInstance();

    // Assert
    expect(MockMqtt).toHaveBeenCalledTimes(1);
    expect(Mqtt).not.toHaveBeenCalled();
    expect(result).toBeInstanceOf(MockMqtt);
  });

  it('should return Mqtt instance when server is not "mock"', () => {
    // Arrange
    (settingsService.get as any).mockReturnValue({
      mqtt: { server: 'localhost' },
    });

    // Act
    const result = getMqttInstance();

    // Assert
    expect(Mqtt).toHaveBeenCalledTimes(1);
    expect(MockMqtt).not.toHaveBeenCalled();
    expect(result).toBeInstanceOf(Mqtt);
  });
});
