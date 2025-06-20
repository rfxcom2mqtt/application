/**
 * Device-related types and interfaces
 */

export interface DeviceEntity {
  manufacturer: string;
  via_device: string;
  identifiers: string[];
  id?: string;
  name: string;
  originalName?: string;
}

export interface DeviceSensor {
  id: string;
  name: string;
  description: string;
  property: string;
  type: string;
  unit_of_measurement: string;
  icon: string;
}

export interface DeviceBinarySensor {
  id: string;
  name: string;
  description: string;
  property: string;
  type: string;
  value_on: boolean;
  value_off: boolean;
}

export interface DeviceSwitch {
  id: string;
  name: string;
  originalName: string;
  unit: number;
  value_on: string;
  value_off: string;
  description: string;
  property: string;
  type: string;
  group: boolean;
}

export interface DeviceCover {
  id: string;
  name: string;
  description: string;
  property: string;
  positionProperty: string;
  type: string;
  unit_of_measurement: string;
  icon: string;
}

export interface DeviceSelect {
  id: string;
  name: string;
  description: string;
  property: string;
  type: string;
  options: string[];
}

export interface DeviceState extends DeviceEntity {
  type: string;
  subtype: number;
  subTypeValue: string;
  entities: string[];
  sensors: { [s: string]: DeviceSensor };
  binarysensors: { [s: string]: DeviceBinarySensor };
  selects: { [s: string]: DeviceSelect };
  covers: { [s: string]: DeviceCover };
  switchs: { [s: string]: DeviceSwitch };
}

export interface RfxcomInfo {
  receiverTypeCode: number;
  receiverType: string;
  hardwareVersion: string;
  firmwareVersion: number;
  firmwareType: string;
  enabledProtocols: string[];
}

export interface BridgeInfo {
  coordinator: RfxcomInfo;
  version: string;
  logLevel: string;
}

export interface DeviceBridge {
  model: string;
  name: string;
  manufacturer: string;
  identifiers: string[];
  hw_version: string;
  sw_version: string;
}

export interface EntityState {
  id: string;
  type: string;
  subtype: string;
}

// RFXCOM Event types
export interface RfxcomEvent {
  id: string;
  type: string;
  subtype?: string;
  unitCode?: number;
  command?: string;
  level?: number;
  rssi?: number;
  batteryLevel?: number;
  group?: boolean;
  data?: any;
  timestamp?: number;
}

// Device command types
export interface DeviceCommand {
  deviceType: string;
  entityName: string;
  command: string;
  value?: any;
}
