import request from '../utils/request';
import { DeviceInfo, KeyValue, DeviceSwitch } from '../models/shared';

/**
 * Type definition for device collection
 */
export type DeviceCollection = { [s: string | number]: DeviceInfo };

/**
 * API client for device-related operations
 */
export class DeviceApi {
  /**
   * Base endpoint for device operations
   */
  private readonly baseEndpoint = '/api/devices';

  /**
   * Get all devices
   *
   * @returns {Promise<DeviceCollection>} Promise resolving to a collection of devices
   */
  getDevices(): Promise<DeviceCollection> {
    return request<DeviceCollection>(this.baseEndpoint, {
      method: 'GET',
    });
  }

  /**
   * Get a specific device by ID
   *
   * @param {string} deviceId - The device ID
   * @returns {Promise<DeviceInfo>} Promise resolving to device information
   * @throws {Error} If the device ID is invalid or the device is not found
   */
  getDevice(deviceId: string): Promise<DeviceInfo> {
    if (!deviceId) {
      return Promise.reject(new Error('Device ID cannot be empty'));
    }

    return request<DeviceInfo>(`${this.baseEndpoint}/${deviceId}`, {
      method: 'GET',
    });
  }

  /**
   * Update a device's name
   *
   * @param {string} deviceId - The device ID
   * @param {string} name - The new name for the device
   * @returns {Promise<any>} Promise resolving when the name is updated
   * @throws {Error} If the device ID or name is invalid
   */
  updateDeviceName(deviceId: string, name: string): Promise<any> {
    if (!deviceId) {
      return Promise.reject(new Error('Device ID cannot be empty'));
    }

    if (!name || name.trim() === '') {
      return Promise.reject(new Error('Device name cannot be empty'));
    }

    return request(`${this.baseEndpoint}/${deviceId}/rename`, {
      method: 'POST',
      data: { name },
    });
  }

  /**
   * Update a sensor's name
   *
   * @param {string} deviceId - The device ID
   * @param {string} entityId - The sensor entity ID
   * @param {string} name - The new name for the sensor
   * @returns {Promise<any>} Promise resolving when the name is updated
   * @throws {Error} If any parameter is invalid
   */
  updateSensorName(deviceId: string, entityId: string, name: string): Promise<any> {
    if (!deviceId || !entityId) {
      return Promise.reject(new Error('Device ID and entity ID cannot be empty'));
    }

    if (!name || name.trim() === '') {
      return Promise.reject(new Error('Sensor name cannot be empty'));
    }

    return request(`${this.baseEndpoint}/${deviceId}/sensor/${entityId}/rename`, {
      method: 'POST',
      data: { name },
    });
  }

  /**
   * Update a switch's name
   *
   * @param {string} deviceId - The device ID
   * @param {DeviceSwitch} entity - The switch entity
   * @param {string} name - The new name for the switch
   * @returns {Promise<any>} Promise resolving when the name is updated
   * @throws {Error} If any parameter is invalid
   */
  updateSwitchName(deviceId: string, entity: DeviceSwitch, name: string): Promise<any> {
    if (!deviceId || !entity || !entity.id) {
      return Promise.reject(new Error('Device ID and switch entity cannot be empty'));
    }

    if (!name || name.trim() === '') {
      return Promise.reject(new Error('Switch name cannot be empty'));
    }

    const unitCode = entity.unit ? parseInt(entity.unit) : undefined;

    return request(`${this.baseEndpoint}/${deviceId}/switch/${entity.id}/rename`, {
      method: 'POST',
      data: { name, unitCode },
    });
  }

  /**
   * Get the state of a device
   *
   * @param {string} deviceId - The device ID
   * @returns {Promise<KeyValue[]>} Promise resolving to the device state
   * @throws {Error} If the device ID is invalid or the device is not found
   */
  getDeviceState(deviceId: string): Promise<KeyValue[]> {
    if (!deviceId) {
      return Promise.reject(new Error('Device ID cannot be empty'));
    }

    return request<KeyValue[]>(`${this.baseEndpoint}/${deviceId}/state`, {
      method: 'GET',
    });
  }

  /**
   * Send an action to a device
   *
   * @param {string} deviceId - The device ID
   * @param {string} entityId - The entity ID
   * @param {string} action - The action to send
   * @returns {Promise<any>} Promise resolving when the action is sent
   * @throws {Error} If any parameter is invalid
   */
  deviceAction(deviceId: string, entityId: string, action: string): Promise<any> {
    if (!deviceId || !entityId) {
      return Promise.reject(new Error('Device ID and entity ID cannot be empty'));
    }

    if (!action) {
      return Promise.reject(new Error('Action cannot be empty'));
    }

    return request(`${this.baseEndpoint}/${deviceId}/action`, {
      method: 'POST',
      data: { action, entityId },
    });
  }
}

// Create and export a singleton instance
const deviceApi = new DeviceApi();
export default deviceApi;
