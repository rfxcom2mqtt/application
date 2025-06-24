// Re-export types and classes from the shared package
export * from '@rfxcom2mqtt/shared';

// Import specific types for use in interfaces
import type {
  DeviceSensor,
  DeviceBinarySensor,
  DeviceSelect,
  DeviceCover,
  DeviceSwitch,
} from '@rfxcom2mqtt/shared';

// Keep any frontend-specific types here if needed
export interface DeviceInfo {
  manufacturer: string;
  via_device: string;
  identifiers: string[];
  name: string;
  originalName?: string;
  id: string;
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
