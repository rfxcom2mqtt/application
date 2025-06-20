/**
 * Zod validation schemas for settings and configuration
 */

import { z } from 'zod';

export const UnitsSchema = z.object({
  unitCode: z.string(),
  name: z.string(),
  friendlyName: z.string(),
});

export const SettingDeviceSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  type: z.string().optional(),
  subtype: z.string().optional(),
  units: z.array(UnitsSchema).optional(),
  options: z.array(z.string()).optional(),
  repetitions: z.number().optional(),
});

export const SettingFrontendSchema = z.object({
  enabled: z.boolean(),
  host: z.string(),
  port: z.number().min(1).max(65535),
  sslCert: z.string(),
  sslKey: z.string(),
});

export const SettingMqttSchema = z.object({
  base_topic: z.string(),
  include_device_information: z.boolean(),
  retain: z.boolean(),
  qos: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  version: z.union([z.literal(3), z.literal(4), z.literal(5)]).optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  port: z.string().optional(),
  server: z.string(),
  key: z.string().optional(),
  ca: z.string().optional(),
  cert: z.string().optional(),
  keepalive: z.number().optional(),
  client_id: z.string().optional(),
  reject_unauthorized: z.boolean().optional(),
});

export const SettingHassSchema = z.object({
  discovery: z.boolean(),
  discovery_topic: z.string(),
  discovery_device: z.string(),
});

export const SettingRfxcomTransmitSchema = z.object({
  repeat: z.number().min(1).max(10),
  lighting1: z.array(z.string()),
  lighting2: z.array(z.string()),
  lighting3: z.array(z.string()),
  lighting4: z.array(z.string()),
});

export const SettingRfxcomSchema = z.object({
  usbport: z.string(),
  debug: z.boolean(),
  transmit: SettingRfxcomTransmitSchema,
  receive: z.array(z.string()),
});

export const CacheStateSchema = z.object({
  enable: z.boolean(),
  saveInterval: z.number().min(1000), // Minimum 1 second
});

export const HealthcheckSchema = z.object({
  enabled: z.boolean(),
  cron: z.string(), // Could add more specific cron validation
});

export const SettingsSchema = z.object({
  mock: z.boolean(),
  loglevel: z.enum(['error', 'warn', 'info', 'debug']),
  cacheState: CacheStateSchema,
  healthcheck: HealthcheckSchema,
  homeassistant: SettingHassSchema,
  devices: z.array(SettingDeviceSchema),
  mqtt: SettingMqttSchema,
  rfxcom: SettingRfxcomSchema,
  frontend: SettingFrontendSchema,
});

// Note: Types are exported from ./types/settings.ts to avoid duplication
// Use z.infer<typeof SchemaName> when you need the inferred type locally
