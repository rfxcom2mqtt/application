/**
 * Main entry point for the shared package
 * Exports all types, schemas, models, and utilities
 */

// Export types from interfaces (prefer interfaces over schemas for types)
export * from './types/common';
export * from './types/settings';
export * from './types/devices';

// Export schemas for validation
export * from './schemas/common';
export * from './schemas/settings';
export * from './schemas/devices';

// Export model classes
export {
  Action as ActionClass,
  DeviceEntity as DeviceEntityClass,
  DeviceSensor as DeviceSensorClass,
  DeviceBinarySensor as DeviceBinarySensorClass,
  DeviceSwitch as DeviceSwitchClass,
  DeviceCover as DeviceCoverClass,
  DeviceSelect as DeviceSelectClass,
  DeviceState as DeviceStateClass,
  RfxcomInfo as RfxcomInfoClass,
  BridgeInfo as BridgeInfoClass,
  DeviceBridge as DeviceBridgeClass,
  EntityState as EntityStateClass,
} from './models';

// Export DeviceStateStore
export { DeviceStateStore } from './models/DeviceStateStore';

// Export utilities
export * from './utils/validation';

// Constants
export const RFXCOM2MQTT_PREFIX = 'rfxcom2mqtt_';

export const DEVICE_TYPES = {
  LIGHTING1: 'lighting1',
  LIGHTING2: 'lighting2',
  LIGHTING3: 'lighting3',
  LIGHTING4: 'lighting4',
  LIGHTING5: 'lighting5',
  LIGHTING6: 'lighting6',
  CHIME: 'chime',
  FAN: 'fan',
  CURTAIN: 'curtain',
  BLINDS: 'blinds',
  RFY: 'rfy',
  SECURITY1: 'security1',
  CAMERA1: 'camera1',
  REMOTE: 'remote',
  THERMOSTAT1: 'thermostat1',
  THERMOSTAT2: 'thermostat2',
  THERMOSTAT3: 'thermostat3',
  TEMP: 'temp',
  HUMIDITY: 'humidity',
  TEMPHUMIDITY: 'temphumidity',
  BAROMETRIC: 'barometric',
  TEMPHUMIDITYBARO: 'temphumiditybaro',
  RAIN: 'rain',
  WIND: 'wind',
  UV: 'uv',
  DATETIME: 'datetime',
  CURRENT: 'current',
  ENERGY: 'energy',
  CURRENTENERGY: 'currentenergy',
  POWER: 'power',
  WEIGHT: 'weight',
  GAS: 'gas',
  WATER: 'water',
  RFXSENSOR: 'rfxsensor',
  RFXMETER: 'rfxmeter',
  FS20: 'fs20',
} as const;

export const BRIDGE_ACTIONS = {
  RESTART: 'restart',
  STOP: 'stop',
  RESET_DEVICES: 'reset_devices',
  RESET_STATE: 'reset_state',
} as const;

export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
} as const;

export const MQTT_QOS_LEVELS = {
  AT_MOST_ONCE: 0,
  AT_LEAST_ONCE: 1,
  EXACTLY_ONCE: 2,
} as const;
