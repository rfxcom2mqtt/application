/**
 * Zod validation schemas for common types
 */

import { z } from 'zod';

export const KeyValueSchema = z.record(z.string(), z.any());

export const WsMessageSchema = z.object({
  id: z.string(),
  level: z.string(),
  label: z.string(),
  value: z.string(),
  time: z.number(),
});

export const ActionSchema = z.object({
  type: z.string(),
  action: z.string(),
  deviceId: z.string().optional(),
  entityId: z.string().optional(),
});

export const MQTTMessageSchema = z.object({
  topic: z.string(),
  message: z.string(),
});

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const PaginatedResponseSchema = z.object({
  data: z.array(z.any()),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export const FilterOptionsSchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Note: Types are exported from ./types/common.ts to avoid duplication
// Use z.infer<typeof SchemaName> when you need the inferred type locally
