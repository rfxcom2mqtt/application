import { ConfigurationError } from "../../utils/errorHandling";
import { logger } from "../../utils/logger";
import { LogLevel, SettingMqtt, SettingOAuth2 } from ".";


/**
 * Validates MQTT configuration
 */
export function validateMqttConfig(config: Partial<SettingMqtt>): SettingMqtt {
  const errors: string[] = [];

  if (!config.server) {
    errors.push('MQTT server is required');
  }

  if (!config.base_topic) {
    errors.push('MQTT base_topic is required');
  }

  if (config.port && (config.port < 1 || config.port > 65535)) {
    errors.push('MQTT port must be between 1 and 65535');
  }

  if (config.qos !== undefined && ![0, 1, 2].includes(config.qos)) {
    errors.push('MQTT QoS must be 0, 1, or 2');
  }

  if (config.version !== undefined && ![3, 4, 5].includes(config.version)) {
    errors.push('MQTT version must be 3, 4, or 5');
  }

  if (errors.length > 0) {
    throw new ConfigurationError(`Invalid MQTT configuration: ${errors.join(', ')}`, {
      errors,
      config,
    });
  }

  return {
    base_topic: config.base_topic!,
    include_device_information: config.include_device_information!,
    retain: config.retain || false,
    qos: config.qos || 0,
    version: config.version,
    username: config.username,
    password: config.password,
    port: config.port || 1883,
    server: config.server!,
    key: config.key,
    ca: config.ca,
    cert: config.cert,
    keepalive: config.keepalive,
    client_id: config.client_id,
    reject_unauthorized: config.reject_unauthorized,
  };
}

/**
 * Validates log level
 */
export function validateLogLevel(level: string): LogLevel {
  const validLevels: LogLevel[] = ['error', 'warn', 'info', 'debug'];

  if (!validLevels.includes(level as LogLevel)) {
    throw new ConfigurationError(
      `Invalid log level: ${level}. Must be one of: ${validLevels.join(', ')}`,
      { level, validLevels }
    );
  }

  return level as LogLevel;
}

/**
 * Validates cron expression (basic validation)
 */
export function validateCronExpression(cron: string): boolean {
  // Basic cron validation - should have 5 or 6 parts
  const parts = cron.trim().split(/\s+/);

  if (parts.length < 5 || parts.length > 6) {
    throw new ConfigurationError(`Invalid cron expression: ${cron}. Must have 5 or 6 parts`, {
      cron,
      parts: parts.length,
    });
  }

  return true;
}

/**
 * Validates port number
 */
export function validatePort(port: number, name: string = 'Port'): number {
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new ConfigurationError(`${name} must be an integer between 1 and 65535, got: ${port}`, {
      port,
      name,
    });
  }

  return port;
}

/**
 * Validates file path exists (for SSL certificates)
 */
export function validateFilePath(path: string, description: string): string {
  const fs = require('fs');

  try {
    if (!fs.existsSync(path)) {
      throw new ConfigurationError(`${description} file not found: ${path}`, {
        path,
        description,
      });
    }

    const stats = fs.statSync(path);
    if (!stats.isFile()) {
      throw new ConfigurationError(`${description} path is not a file: ${path}`, {
        path,
        description,
      });
    }

    return path;
  } catch (error) {
    if (error instanceof ConfigurationError) {
      throw error;
    }

    throw new ConfigurationError(`Error accessing ${description} file: ${path}`, {
      path,
      description,
      originalError: error,
    });
  }
}

/**
 * Validates OAuth2 configuration
 */
export function validateOAuth2Config(config: Partial<SettingOAuth2>): SettingOAuth2 {
  const errors: string[] = [];

  if (!config.provider) {
    errors.push("OAuth2 provider is required");
  }

  if (!config.clientId) {
    errors.push("OAuth2 clientId is required");
  }

  if (!config.clientSecret) {
    errors.push("OAuth2 clientSecret is required");
  }

  if (!config.authorizationURL) {
    errors.push("OAuth2 authorizationURL is required");
  }

  if (!config.tokenURL) {
    errors.push("OAuth2 tokenURL is required");
  }

  if (!config.callbackURL) {
    errors.push("OAuth2 callbackURL is required");
  }

  if (!config.sessionSecret) {
    errors.push("OAuth2 sessionSecret is required");
  }

  // Validate URLs
  const urlFields = ['authorizationURL', 'tokenURL', 'userInfoURL', 'callbackURL'];
  urlFields.forEach(field => {
    const url = config[field as keyof SettingOAuth2] as string;
    if (url && !isValidURL(url)) {
      errors.push(`OAuth2 ${field} must be a valid URL`);
    }
  });

  if (errors.length > 0) {
    throw new ConfigurationError(
      `Invalid OAuth2 configuration: ${errors.join(", ")}`,
      { errors, config },
    );
  }

  return {
    enabled: config.enabled || false,
    provider: config.provider!,
    clientId: config.clientId!,
    clientSecret: config.clientSecret!,
    authorizationURL: config.authorizationURL!,
    tokenURL: config.tokenURL!,
    userInfoURL: config.userInfoURL,
    scope: config.scope || ['openid', 'profile', 'email'],
    callbackURL: config.callbackURL!,
    sessionSecret: config.sessionSecret!,
    allowedUsers: config.allowedUsers,
    allowedDomains: config.allowedDomains,
  };
}

/**
 * Validates if a string is a valid URL
 */
function isValidURL(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Validates complete application configuration
 */
export function validateApplicationConfig(config: any): any {
  const validatedConfig: any = {};

  try {
    // Validate MQTT configuration
    if (config.mqtt) {
      validatedConfig.mqtt = validateMqttConfig(config.mqtt);
      logger.debug('MQTT configuration validated successfully');
    }

    // Validate log level
    if (config.loglevel) {
      validatedConfig.loglevel = validateLogLevel(config.loglevel);
      logger.debug(`Log level validated: ${config.loglevel}`);
    }

    // Validate healthcheck configuration
    if (config.healthcheck) {
      if (config.healthcheck.enabled && config.healthcheck.cron) {
        validateCronExpression(config.healthcheck.cron);
      }
      validatedConfig.healthcheck = config.healthcheck;
      logger.debug('Healthcheck configuration validated successfully');
    }

    // Validate frontend configuration
    if (config.frontend) {
      if (config.frontend.enabled && config.frontend.port) {
        validatePort(config.frontend.port, 'Frontend port');
      }
      
      // Validate OAuth2 configuration if enabled
      if (config.frontend.oauth2?.enabled) {
        validatedConfig.frontend = {
          ...config.frontend,
          oauth2: validateOAuth2Config(config.frontend.oauth2)
        };
        logger.debug("OAuth2 configuration validated successfully");
      } else {
        validatedConfig.frontend = config.frontend;
      }
      
      logger.debug("Frontend configuration validated successfully");
    }

    // Validate SSL certificate paths if provided
    if (config.mqtt?.ca) {
      validateFilePath(config.mqtt.ca, 'CA certificate');
    }
    if (config.mqtt?.key) {
      validateFilePath(config.mqtt.key, 'SSL key');
    }
    if (config.mqtt?.cert) {
      validateFilePath(config.mqtt.cert, 'SSL certificate');
    }

    logger.info('Application configuration validated successfully');
    return validatedConfig;
  } catch (error) {
    logger.error(
      `Configuration validation failed: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
}

/**
 * Sanitizes configuration for logging (removes sensitive data)
 */
export function sanitizeConfigForLogging(config: any): any {
  const sanitized = JSON.parse(JSON.stringify(config));

  // Remove sensitive MQTT fields
  if (sanitized.mqtt?.password) {
    sanitized.mqtt.password = '***';
  }
  if (sanitized.mqtt?.username) {
    sanitized.mqtt.username = '***';
  }

  // Remove sensitive frontend fields
  if (sanitized.frontend?.authToken) {
    sanitized.frontend.authToken = "***";
  }

  // Remove sensitive OAuth2 fields
  if (sanitized.frontend?.oauth2) {
    if (sanitized.frontend.oauth2.clientSecret) {
      sanitized.frontend.oauth2.clientSecret = "***";
    }
    if (sanitized.frontend.oauth2.sessionSecret) {
      sanitized.frontend.oauth2.sessionSecret = "***";
    }
  }

  return sanitized;
}
