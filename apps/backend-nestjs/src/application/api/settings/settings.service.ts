import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { logger } from '../../../utils/logger';
import { SettingsService as CoreSettingsService } from '../../../core/settings/settings.service';
import { MqttService } from '../../../infrastructure/mqtt/mqtt.service';
import * as yaml from 'js-yaml';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class SettingsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly coreSettingsService: CoreSettingsService,
    private readonly mqttService: MqttService
  ) {}

  async getSettings(): Promise<any> {
    // Get settings from core settings service which handles file-based configuration
    const coreSettings = this.coreSettingsService.get();

    // Merge with config service settings (environment variables, etc.)
    return {
      frontend: {
        ...this.configService.get('frontend', {}),
        ...coreSettings.frontend,
      },
      mqtt: {
        ...this.configService.get('mqtt', {}),
        ...coreSettings.mqtt,
      },
      rfxcom: {
        ...this.configService.get('rfxcom', {}),
        ...coreSettings.rfxcom,
      },
      homeassistant: {
        ...this.configService.get('homeassistant', {}),
        ...coreSettings.homeassistant,
      },
      prometheus: {
        ...this.configService.get('prometheus', {}),
        ...coreSettings.prometheus,
      },
      healthcheck: {
        ...this.configService.get('healthcheck', {}),
        ...coreSettings.healthcheck,
      },
      loglevel: coreSettings.loglevel || this.configService.get('loglevel', 'info'),
      devices: coreSettings.devices || this.configService.get('devices', []),
    };
  }

  async updateSettings(settings: any): Promise<void> {
    logger.info('Updating application settings');

    try {
      // Validate settings structure
      this.validateSettings(settings);

      // Get current settings
      const currentSettings = this.coreSettingsService.get();

      // Check if MQTT settings have changed
      const mqttSettingsChanged = this.hasMqttSettingsChanged(
        currentSettings.mqtt || {},
        settings.mqtt || {}
      );

      // Merge new settings with current settings
      const updatedSettings = {
        ...currentSettings,
        ...settings,
      };

      // Update core settings service
      await this.coreSettingsService.updateSettings(updatedSettings);

      // Also persist to YAML config file if it exists
      await this.persistToConfigFile(updatedSettings);

      // Restart MQTT service if MQTT settings changed
      if (mqttSettingsChanged) {
        logger.info('MQTT settings changed, restarting MQTT service');
        try {
          await this.mqttService.restart();
          logger.info('MQTT service restarted successfully after settings change');
        } catch (error: any) {
          logger.warn(`Failed to restart MQTT service after settings change: ${error.message}`);
          // Don't throw error here as settings were updated successfully
        }
      }

      logger.info('Settings updated successfully');
      logger.debug(`Updated settings: ${JSON.stringify(updatedSettings, null, 2)}`);
    } catch (error: any) {
      logger.error(`Failed to update settings: ${error.message}`);
      throw new Error(`Failed to update settings: ${error.message}`);
    }
  }
  /**
   * Checks if MQTT settings have changed between current and new settings
   */
  private hasMqttSettingsChanged(currentMqtt: any, newMqtt: any): boolean {
    if (!newMqtt || Object.keys(newMqtt).length === 0) {
      return false; // No MQTT settings in the update
    }

    // List of MQTT settings that require a restart when changed
    const mqttRestartFields = [
      'server',
      'port',
      'username',
      'password',
      'client_id',
      'base_topic',
      'keepalive',
      'clean',
      'ca',
      'key',
      'cert',
      'version',
    ];

    // Check if any restart-requiring field has changed
    for (const field of mqttRestartFields) {
      if (newMqtt[field] !== undefined && currentMqtt[field] !== newMqtt[field]) {
        logger.debug(
          `MQTT setting '${field}' changed from '${currentMqtt[field]}' to '${newMqtt[field]}'`
        );
        return true;
      }
    }

    return false;
  }

  private validateSettings(settings: any): void {
    // Basic validation of settings structure
    if (typeof settings !== 'object' || settings === null) {
      throw new Error('Settings must be an object');
    }

    // Validate MQTT settings if provided
    if (settings.mqtt) {
      if (settings.mqtt.server && typeof settings.mqtt.server !== 'string') {
        throw new Error('MQTT server must be a string');
      }
      if (settings.mqtt.base_topic && typeof settings.mqtt.base_topic !== 'string') {
        throw new Error('MQTT base_topic must be a string');
      }
      if (settings.mqtt.keepalive !== undefined) {
        if (typeof settings.mqtt.keepalive === 'string') {
          const keepaliveNum = parseInt(settings.mqtt.keepalive, 10);
          if (isNaN(keepaliveNum)) {
            throw new Error('MQTT keepalive must be a valid number');
          }
          settings.mqtt.keepalive = keepaliveNum;
        } else if (typeof settings.mqtt.keepalive !== 'number') {
          throw new Error('MQTT keepalive must be a number');
        }
      }
      if (settings.mqtt.clean !== undefined) {
        if (typeof settings.mqtt.clean === 'string') {
          settings.mqtt.clean = settings.mqtt.clean === 'true';
        } else if (typeof settings.mqtt.clean !== 'boolean') {
          throw new Error('MQTT clean must be a boolean');
        }
      }
    }

    // Validate RFXCOM settings if provided
    if (settings.rfxcom) {
      if (settings.rfxcom.port && typeof settings.rfxcom.port !== 'string') {
        throw new Error('RFXCOM port must be a string');
      }
      if (settings.rfxcom.debug !== undefined) {
        if (typeof settings.rfxcom.debug === 'string') {
          settings.rfxcom.debug = settings.rfxcom.debug === 'true';
        } else if (typeof settings.rfxcom.debug !== 'boolean') {
          throw new Error('RFXCOM debug must be a boolean');
        }
      }
    }

    // Validate Home Assistant settings if provided
    if (settings.homeassistant) {
      if (settings.homeassistant.discovery !== undefined) {
        if (typeof settings.homeassistant.discovery === 'string') {
          settings.homeassistant.discovery = settings.homeassistant.discovery === 'true';
        } else if (typeof settings.homeassistant.discovery !== 'boolean') {
          throw new Error('Home Assistant discovery must be a boolean');
        }
      }
      if (
        settings.homeassistant.discovery_prefix &&
        typeof settings.homeassistant.discovery_prefix !== 'string'
      ) {
        throw new Error('Home Assistant discovery_prefix must be a string');
      }
    }

    // Validate frontend settings if provided
    if (settings.frontend) {
      if (settings.frontend.port !== undefined) {
        if (typeof settings.frontend.port === 'string') {
          const portNum = parseInt(settings.frontend.port, 10);
          if (isNaN(portNum)) {
            throw new Error('Frontend port must be a valid number');
          }
          settings.frontend.port = portNum;
        } else if (typeof settings.frontend.port !== 'number') {
          throw new Error('Frontend port must be a number');
        }
      }
      if (settings.frontend.host && typeof settings.frontend.host !== 'string') {
        throw new Error('Frontend host must be a string');
      }
      if (settings.frontend.enabled !== undefined) {
        if (typeof settings.frontend.enabled === 'string') {
          settings.frontend.enabled = settings.frontend.enabled === 'true';
        } else if (typeof settings.frontend.enabled !== 'boolean') {
          throw new Error('Frontend enabled must be a boolean');
        }
      }
    }

    // Validate Prometheus settings if provided
    if (settings.prometheus) {
      if (settings.prometheus.enabled !== undefined) {
        // Convert string values to boolean if needed
        if (typeof settings.prometheus.enabled === 'string') {
          settings.prometheus.enabled = settings.prometheus.enabled === 'true';
        } else if (typeof settings.prometheus.enabled !== 'boolean') {
          throw new Error('Prometheus enabled must be a boolean');
        }
      }
      if (settings.prometheus.port !== undefined) {
        // Convert string values to number if needed
        if (typeof settings.prometheus.port === 'string') {
          const portNum = parseInt(settings.prometheus.port, 10);
          if (isNaN(portNum)) {
            throw new Error('Prometheus port must be a valid number');
          }
          settings.prometheus.port = portNum;
        } else if (typeof settings.prometheus.port !== 'number') {
          throw new Error('Prometheus port must be a number');
        }
      }
    }

    // Validate log level if provided
    if (settings.loglevel) {
      const validLevels = ['error', 'warn', 'info', 'debug', 'verbose'];
      if (!validLevels.includes(settings.loglevel)) {
        throw new Error(`Log level must be one of: ${validLevels.join(', ')}`);
      }
    }

    // Validate devices if provided
    if (settings.devices && !Array.isArray(settings.devices)) {
      throw new Error('Devices must be an array');
    }
  }

  private async persistToConfigFile(settings: any): Promise<void> {
    try {
      const configPath = join(process.cwd(), 'config', 'config.yml');

      // Only persist if config file exists (don't create new one)
      if (existsSync(configPath)) {
        const yamlContent = yaml.dump(settings, {
          indent: 2,
          lineWidth: 120,
          noRefs: true,
        });

        writeFileSync(configPath, yamlContent, 'utf8');
        logger.debug(`Settings persisted to config file: ${configPath}`);
      } else {
        logger.debug('Config file does not exist, skipping file persistence');
      }
    } catch (error: any) {
      logger.warn(`Failed to persist settings to config file: ${error.message}`);
      // Don't throw error here as core settings are already updated
    }
  }

  async resetSettings(): Promise<void> {
    logger.info('Resetting settings to defaults');

    try {
      // Get default settings and update core settings service
      const defaultSettings = this.getDefaultSettings();
      await this.coreSettingsService.updateSettings(defaultSettings);

      // Also persist to YAML config file if it exists
      await this.persistToConfigFile(defaultSettings);

      logger.info('Settings reset to defaults successfully');
    } catch (error: any) {
      logger.error(`Failed to reset settings: ${error.message}`);
      throw new Error(`Failed to reset settings: ${error.message}`);
    }
  }

  private getDefaultSettings(): any {
    return {
      loglevel: 'info',
      cacheState: {
        enable: true,
        saveInterval: 1,
      },
      healthcheck: {
        enabled: true,
        cron: '0 */5 * * * *',
      },
      homeassistant: {
        discovery: false,
        discovery_topic: 'homeassistant',
        discovery_device: 'rfxcom2mqtt',
      },
      devices: [],
      mqtt: {
        base_topic: 'rfxcom2mqtt',
        include_device_information: false,
        qos: 0,
        retain: true,
        server: 'mqtt://localhost:1883',
        port: 1883,
        client_id: 'rfxcom2mqtt',
        keepalive: 60,
        clean: false,
        reconnectPeriod: 1000,
        connectTimeout: 30000,
      },
      rfxcom: {
        usbport: '/dev/ttyUSB0',
        debug: false,
        transmit: {
          repeat: 1,
          lighting1: [],
          lighting2: [],
          lighting3: [],
          lighting4: [],
        },
        receive: [
          'temperaturehumidity1',
          'homeconfort',
          'lighting1',
          'lighting2',
          'lighting3',
          'lighting4',
          'remote',
          'security1',
        ],
      },
      frontend: {
        enabled: true,
        authToken: '',
        host: '0.0.0.0',
        port: 8080,
        sslCert: '',
        sslKey: '',
      },
      prometheus: {
        enabled: false,
        port: 9090,
        host: '0.0.0.0',
        path: '/metrics',
      },
    };
  }

  async getSettingsSchema(): Promise<any> {
    // Return a schema describing the available settings
    return {
      frontend: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean', default: true },
          port: { type: 'number', default: 8080, minimum: 1, maximum: 65535 },
          host: { type: 'string', default: '0.0.0.0' },
          authToken: { type: 'string', nullable: true },
          sslCert: { type: 'string', nullable: true },
          sslKey: { type: 'string', nullable: true },
        },
      },
      mqtt: {
        type: 'object',
        properties: {
          server: { type: 'string', default: 'mqtt://localhost:1883' },
          base_topic: { type: 'string', default: 'rfxcom2mqtt' },
          username: { type: 'string', nullable: true },
          password: { type: 'string', nullable: true },
          client_id: { type: 'string', default: 'rfxcom2mqtt' },
          keepalive: { type: 'number', default: 60, minimum: 1 },
          clean: { type: 'boolean', default: false },
          reconnectPeriod: { type: 'number', default: 1000, minimum: 100 },
          connectTimeout: { type: 'number', default: 30000, minimum: 1000 },
        },
      },
      rfxcom: {
        type: 'object',
        properties: {
          port: { type: 'string', default: '/dev/ttyUSB0' },
          debug: { type: 'boolean', default: false },
        },
      },
      homeassistant: {
        type: 'object',
        properties: {
          discovery: { type: 'boolean', default: false },
          discovery_prefix: { type: 'string', default: 'homeassistant' },
        },
      },
      prometheus: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean', default: false },
          port: { type: 'number', default: 9090, minimum: 1, maximum: 65535 },
        },
      },
      healthcheck: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean', default: false },
          cron: { type: 'string', default: '0 */5 * * * *' },
        },
      },
      loglevel: {
        type: 'string',
        enum: ['error', 'warn', 'info', 'debug', 'verbose'],
        default: 'info',
      },
      devices: {
        type: 'array',
        items: { type: 'object' },
        default: [],
      },
    };
  }
}
