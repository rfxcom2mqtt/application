import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import { join } from 'path';
import objectAssignDeep from 'object-assign-deep';
import * as yaml from 'js-yaml';
import { logger } from '../../utils/logger';

export interface SettingDevice {
  id: string;
  name?: string;
  type?: string;
  subtype?: string;
  units?: Units[];
  options?: string[];
  repetitions?: number;
  blindsMode?: string;
}

export interface Units {
  unitCode: number;
  name: string;
}

export interface AppSettings {
  loglevel: string;
  cacheState: {
    enable: boolean;
    saveInterval: number;
  };
  healthcheck: {
    enabled: boolean;
    cron: string;
  };
  homeassistant: {
    discovery: boolean;
    discovery_topic: string;
    discovery_device: string;
  };
  devices: SettingDevice[];
  mqtt: {
    base_topic: string;
    include_device_information: boolean;
    retain: boolean;
    qos: 0 | 1 | 2;
    version?: 3 | 4 | 5;
    username?: string;
    password?: string;
    port?: number;
    server: string;
    key?: string;
    ca?: string;
    cert?: string;
    keepalive?: number;
    client_id?: string;
    reject_unauthorized?: boolean;
  };
  rfxcom: {
    usbport: string;
    debug: boolean;
    transmit: {
      repeat: number;
      lighting1: string[];
      lighting2: string[];
      lighting3: string[];
      lighting4: string[];
    };
    receive: string[];
  };
  frontend: {
    enabled: boolean;
    authToken: string;
    host: string;
    port: number;
    sslCert: string;
    sslKey: string;
  };
  prometheus: {
    enabled: boolean;
    port: number;
    host: string;
    path: string;
  };
}

@Injectable()
export class SettingsService implements OnModuleInit {
  private settings: AppSettings;
  private configFile: string;

  constructor(private readonly configService: ConfigService) {
    // Use the same config file that ConfigService uses
    this.configFile = join(process.cwd(), 'config', 'config.yml');

    // Initialize with defaults
    this.settings = this.getDefaults();
  }

  async onModuleInit(): Promise<void> {
    await this.loadSettings();
  }

  private getDefaults(): AppSettings {
    return {
      loglevel: 'info',
      cacheState: {
        enable: true,
        saveInterval: 1, // interval in minutes
      },
      healthcheck: {
        enabled: true,
        cron: '* * * * *',
      },
      homeassistant: {
        discovery: true,
        discovery_topic: 'homeassistant',
        discovery_device: 'rfxcom2mqtt',
      },
      devices: [],
      mqtt: {
        base_topic: 'rfxcom2mqtt',
        include_device_information: false,
        qos: 0,
        retain: true,
        server: this.configService.get<string>('MQTT_SERVER', 'mqtt://localhost'),
        port: this.configService.get<number>('MQTT_PORT', 1883),
        username: this.configService.get<string>('MQTT_USERNAME'),
        password: this.configService.get<string>('MQTT_PASSWORD'),
        client_id: this.configService.get<string>('MQTT_CLIENT_ID', 'rfxcom2mqtt-nestjs'),
      },
      rfxcom: {
        usbport: this.configService.get<string>('RFXCOM_USB_DEVICE', '/dev/ttyUSB0'),
        debug: true,
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
        enabled: this.configService.get<boolean>('FRONTEND_ENABLED', false),
        authToken: this.configService.get<string>('FRONTEND_AUTH_TOKEN', ''),
        host: this.configService.get<string>('FRONTEND_HOST', '0.0.0.0'),
        port: this.configService.get<number>('FRONTEND_PORT', 8080),
        sslCert: this.configService.get<string>('FRONTEND_SSL_CERT', ''),
        sslKey: this.configService.get<string>('FRONTEND_SSL_KEY', ''),
      },
      prometheus: {
        enabled: this.configService.get<boolean>('PROMETHEUS_ENABLED', false),
        port: this.configService.get<number>('PROMETHEUS_PORT', 9090),
        host: this.configService.get<string>('PROMETHEUS_HOST', '0.0.0.0'),
        path: this.configService.get<string>('PROMETHEUS_PATH', '/metrics'),
      },
    };
  }

  private async loadSettings(): Promise<void> {
    try {
      const data = await fs.readFile(this.configFile, 'utf8');
      const fileSettings = yaml.load(data) as any;

      // Merge defaults with file settings
      this.settings = objectAssignDeep({}, this.getDefaults(), fileSettings);

      logger.info(`Settings loaded from ${this.configFile}`);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        logger.info(`Settings file ${this.configFile} doesn't exist, using defaults`);
        await this.saveSettings();
      } else {
        logger.error(`Failed to load settings from ${this.configFile}: ${error.message}`);
      }
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      // Ensure directory exists
      await fs.mkdir(join(this.configFile, '..'), { recursive: true });

      const json = JSON.stringify(this.settings, null, 2);
      await fs.writeFile(this.configFile, json, 'utf8');

      logger.debug(`Settings saved to ${this.configFile}`);
    } catch (error: any) {
      logger.error(`Failed to save settings to ${this.configFile}: ${error.message}`);
    }
  }

  get(): AppSettings {
    return this.settings;
  }

  async updateSettings(newSettings: Partial<AppSettings>): Promise<void> {
    logger.info('Updating application settings');

    this.settings = objectAssignDeep({}, this.settings, newSettings);
    await this.saveSettings();

    logger.debug('Settings updated successfully');
  }

  getDeviceConfig(deviceId: string): SettingDevice | undefined {
    return this.settings.devices.find((dev: SettingDevice) => dev.id === deviceId);
  }

  async applyDeviceOverride(newSettings: SettingDevice): Promise<void> {
    logger.info(`Applying device override for device: ${newSettings.id}`);

    let found = false;
    const devices = this.settings.devices || [];

    for (const device of devices) {
      if (device.id === newSettings.id) {
        found = true;

        // Update device name if provided
        if (newSettings.name !== undefined) {
          device.name = newSettings.name;
        }

        // Update units if provided
        if (newSettings.units !== undefined) {
          if (!device.units) {
            device.units = [];
          }

          for (const newUnit of newSettings.units) {
            let foundUnit = false;

            for (const unit of device.units) {
              if (unit.unitCode === newUnit.unitCode) {
                foundUnit = true;
                if (newUnit.name !== undefined) {
                  unit.name = newUnit.name;
                }
                break;
              }
            }

            if (!foundUnit) {
              device.units.push(newUnit);
            }
          }
        }

        break;
      }
    }

    // If device not found, add it
    if (!found) {
      devices.push(newSettings);
    }

    this.settings.devices = devices;
    await this.saveSettings();

    logger.debug(`Device override applied for: ${newSettings.id}`);
  }

  async removeDeviceOverride(deviceId: string): Promise<void> {
    logger.info(`Removing device override for device: ${deviceId}`);

    this.settings.devices = this.settings.devices.filter(device => device.id !== deviceId);
    await this.saveSettings();

    logger.debug(`Device override removed for: ${deviceId}`);
  }

  validate(): string[] {
    const errors: string[] = [];

    // Basic validation
    if (!this.settings.mqtt.server) {
      errors.push('MQTT server is required');
    }

    if (!this.settings.rfxcom.usbport) {
      errors.push('RFXCOM USB port is required');
    }

    if (this.settings.frontend.enabled && !this.settings.frontend.authToken) {
      errors.push('Frontend auth token is required when frontend is enabled');
    }

    return errors;
  }
}
