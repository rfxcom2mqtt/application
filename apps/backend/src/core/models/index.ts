// Re-export shared models with proper names for constructors
export {
  ActionClass as Action,
  DeviceEntityClass as DeviceEntity,
  DeviceSensorClass as DeviceSensor,
  DeviceBinarySensorClass as DeviceBinarySensor,
  DeviceSwitchClass as DeviceSwitch,
  DeviceCoverClass as DeviceCover,
  DeviceSelectClass as DeviceSelect,
  DeviceStateClass as DeviceState,
  RfxcomInfoClass as RfxcomInfo,
  BridgeInfoClass as BridgeInfo,
  DeviceBridgeClass as DeviceBridge,
  EntityStateClass as EntityState,
  DeviceStateStore,
  RFXCOM2MQTT_PREFIX,
  DEVICE_TYPES,
  BRIDGE_ACTIONS,
  LOG_LEVELS,
  MQTT_QOS_LEVELS,
} from '@rfxcom2mqtt/shared';

// Re-export shared types
export type {
  ApiResponse,
  PaginatedResponse,
  FilterOptions,
  WsMessage,
  DeviceCommand,
} from '@rfxcom2mqtt/shared';

// Backend-specific interfaces and types
export interface KeyValue {
  [s: string]: any;
}

// Re-export RFXCOM models (backend-specific event interfaces)
export * from './rfxcom';

// Re-export MQTT models (backend-specific Topic class and MQTTMessage interface)
export * from './mqtt';
