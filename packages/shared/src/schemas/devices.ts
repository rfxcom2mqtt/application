/**
 * Zod validation schemas for device-related data
 */

import { z } from 'zod';

export const DeviceEntitySchema = z.object({
  manufacturer: z.string(),
  via_device: z.string(),
  identifiers: z.array(z.string()),
  id: z.string().optional(),
  name: z.string(),
  originalName: z.string().optional(),
});

export const DeviceSensorSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  property: z.string(),
  type: z.string(),
  unit_of_measurement: z.string().optional(),
  icon: z.string().optional(),
});

export const DeviceBinarySensorSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  property: z.string(),
  type: z.string(),
  value_on: z.boolean(),
  value_off: z.boolean(),
});

export const DeviceSwitchSchema = z.object({
  id: z.string(),
  name: z.string(),
  originalName: z.string().optional(),
  unit: z.union([z.number(), z.string()]).optional(),
  value_on: z.string(),
  value_off: z.string(),
  description: z.string(),
  property: z.string(),
  type: z.string(),
  group: z.boolean().optional(),
});

export const DeviceCoverSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  property: z.string(),
  positionProperty: z.string().optional(),
  type: z.string(),
  unit_of_measurement: z.string().optional(),
  icon: z.string().optional(),
});

export const DeviceSelectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  property: z.string(),
  type: z.string(),
  options: z.array(z.string()),
});

export const DeviceStateSchema = DeviceEntitySchema.extend({
  type: z.string(),
  subtype: z.number(),
  subTypeValue: z.string(),
  entities: z.array(z.string()),
  sensors: z.record(z.string(), DeviceSensorSchema),
  binarysensors: z.record(z.string(), DeviceBinarySensorSchema),
  selects: z.record(z.string(), DeviceSelectSchema),
  covers: z.record(z.string(), DeviceCoverSchema),
  switchs: z.record(z.string(), DeviceSwitchSchema),
});

export const RfxcomInfoSchema = z.object({
  receiverTypeCode: z.number(),
  receiverType: z.string(),
  hardwareVersion: z.string(),
  firmwareVersion: z.number(),
  firmwareType: z.string(),
  enabledProtocols: z.array(z.string()),
});

export const BridgeInfoSchema = z.object({
  coordinator: RfxcomInfoSchema,
  version: z.string(),
  logLevel: z.string(),
});

export const DeviceBridgeSchema = z.object({
  model: z.string(),
  name: z.string(),
  manufacturer: z.string(),
  identifiers: z.array(z.string()),
  hw_version: z.string(),
  sw_version: z.string(),
});

export const EntityStateSchema = z.object({
  id: z.string(),
  type: z.string(),
  subtype: z.string(),
});

export const RfxcomEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  subtype: z.string().optional(),
  unitCode: z.number().optional(),
  command: z.string().optional(),
  level: z.number().optional(),
  rssi: z.number().optional(),
  batteryLevel: z.number().optional(),
  group: z.boolean().optional(),
  data: z.any().optional(),
  timestamp: z.number().optional(),
});

export const DeviceCommandSchema = z.object({
  deviceType: z.string(),
  entityName: z.string(),
  command: z.string(),
  value: z.any().optional(),
});

// Note: Types are exported from ./types/devices.ts to avoid duplication
// Use z.infer<typeof SchemaName> when you need the inferred type locally
