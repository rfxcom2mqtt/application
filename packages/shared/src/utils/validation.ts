/**
 * Validation utilities using Zod schemas
 */

import { z } from 'zod';
import { SettingsSchema } from '../schemas/settings';
import { DeviceStateSchema, RfxcomEventSchema, DeviceCommandSchema } from '../schemas/devices';
import { ActionSchema, MQTTMessageSchema } from '../schemas/common';

export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: z.ZodError
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates settings configuration
 */
export function validateSettings(data: unknown) {
  try {
    return SettingsSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Settings validation failed', error);
    }
    throw error;
  }
}

/**
 * Validates device state data
 */
export function validateDeviceState(data: unknown) {
  try {
    return DeviceStateSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Device state validation failed', error);
    }
    throw error;
  }
}

/**
 * Validates RFXCOM event data
 */
export function validateRfxcomEvent(data: unknown) {
  try {
    return RfxcomEventSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('RFXCOM event validation failed', error);
    }
    throw error;
  }
}

/**
 * Validates device command data
 */
export function validateDeviceCommand(data: unknown) {
  try {
    return DeviceCommandSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Device command validation failed', error);
    }
    throw error;
  }
}

/**
 * Validates action data
 */
export function validateAction(data: unknown) {
  try {
    return ActionSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Action validation failed', error);
    }
    throw error;
  }
}

/**
 * Validates MQTT message data
 */
export function validateMQTTMessage(data: unknown) {
  try {
    return MQTTMessageSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('MQTT message validation failed', error);
    }
    throw error;
  }
}

/**
 * Safe validation that returns a result object instead of throwing
 */
export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  error?: z.ZodError;
} {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}

/**
 * Formats validation errors for user-friendly display
 */
export function formatValidationErrors(error: z.ZodError): string[] {
  return error.errors.map(err => {
    const path = err.path.length > 0 ? err.path.join('.') : 'root';
    return `${path}: ${err.message}`;
  });
}

/**
 * Partial validation for updates (allows partial objects)
 */
export function validatePartialSettings(data: unknown) {
  try {
    return SettingsSchema.partial().parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Partial settings validation failed', error);
    }
    throw error;
  }
}

/**
 * Validates an array of items using a schema
 */
export function validateArray<T>(schema: z.ZodSchema<T>, data: unknown[]): T[] {
  try {
    return z.array(schema).parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Array validation failed', error);
    }
    throw error;
  }
}
