import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import { join } from 'path';
import objectAssignDeep from 'object-assign-deep';
import { DeviceState } from '@rfxcom2mqtt/shared';
import { logger } from '../../utils/logger';

@Injectable()
export class DeviceStore implements OnModuleInit, OnModuleDestroy {
  private devices: Map<string, DeviceState> = new Map();
  private file: string;
  private timer?: NodeJS.Timeout;
  private saveInterval: number;

  constructor(private readonly configService: ConfigService) {
    const dataPath = this.configService.get<string>('RFXCOM2MQTT_DATA', '/app/data/');
    this.file = join(dataPath, 'devices.json');

    const saveIntervalMultiplier = this.configService.get<number>('CACHE_SAVE_INTERVAL', 1);
    this.saveInterval = 1000 * 60 * saveIntervalMultiplier; // Default 1 minute
  }

  async onModuleInit(): Promise<void> {
    await this.load();

    // Save devices on interval
    this.timer = setInterval(() => this.save(), this.saveInterval);
    logger.info('Device store initialized');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
    }
    await this.save();
    logger.info('Device store destroyed');
  }

  private async load(): Promise<void> {
    try {
      const data = await fs.readFile(this.file, 'utf8');
      const devicesData = JSON.parse(data);

      // Convert plain objects back to Map
      for (const [id, device] of Object.entries(devicesData)) {
        this.devices.set(id, device as DeviceState);
      }

      logger.debug(`Loaded ${this.devices.size} devices from file ${this.file}`);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        logger.debug(`Devices file ${this.file} doesn't exist, starting with empty store`);
      } else {
        logger.error(`Failed to load devices from file ${this.file}: ${error.message}`);
      }
    }
  }

  private async save(): Promise<void> {
    const cacheEnabled = this.configService.get<boolean>('CACHE_STATE_ENABLE', true);

    if (!cacheEnabled) {
      logger.debug('Device caching disabled, not saving');
      return;
    }

    try {
      // Convert Map to plain object for JSON serialization
      const devicesData = Object.fromEntries(this.devices);
      const json = JSON.stringify(devicesData, null, 2);

      // Ensure directory exists
      await fs.mkdir(join(this.file, '..'), { recursive: true });
      await fs.writeFile(this.file, json, 'utf8');

      logger.debug(`Saved ${this.devices.size} devices to file ${this.file}`);
    } catch (error: any) {
      logger.error(`Failed to save devices to file ${this.file}: ${error.message}`);
    }
  }

  async reset(): Promise<void> {
    this.devices.clear();
    try {
      await fs.writeFile(this.file, '{}', 'utf8');
      logger.info('Device store reset');
    } catch (error: any) {
      logger.error(`Failed to reset devices file ${this.file}: ${error.message}`);
    }
  }

  exists(id: string): boolean {
    return this.devices.has(id);
  }

  get(id: string): DeviceState | undefined {
    logger.debug(`Getting device: ${id}`);
    return this.devices.get(id);
  }

  getAll(): DeviceState[] {
    return Array.from(this.devices.values());
  }

  getAllAsMap(): Map<string, DeviceState> {
    return new Map(this.devices);
  }

  set(id: string, update: Partial<DeviceState>): DeviceState {
    logger.debug(`Updating device: ${id}`);

    const existing = this.devices.get(id);
    let device: DeviceState;

    if (existing) {
      device = objectAssignDeep({}, existing, update) as DeviceState;
    } else {
      device = update as DeviceState;
      device.id = id;
    }

    this.devices.set(id, device);
    return device;
  }

  remove(id: string): boolean {
    logger.debug(`Removing device: ${id}`);
    return this.devices.delete(id);
  }

  size(): number {
    return this.devices.size;
  }
}
