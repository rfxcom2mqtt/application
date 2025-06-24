import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import { join } from 'path';
import objectAssignDeep from 'object-assign-deep';
import { EntityState } from '@rfxcom2mqtt/shared';
import { logger } from '../../utils/logger';

interface KeyValue {
  [key: string]: any;
}

@Injectable()
export class StateStore implements OnModuleInit, OnModuleDestroy {
  private state: Map<string, KeyValue> = new Map();
  private file: string;
  private timer?: NodeJS.Timeout;
  private saveInterval: number;

  constructor(private readonly configService: ConfigService) {
    const dataPath = this.configService.get<string>('RFXCOM2MQTT_DATA', '/app/data/');
    this.file = join(dataPath, 'state.json');

    const saveIntervalMultiplier = this.configService.get<number>('CACHE_SAVE_INTERVAL', 1);
    this.saveInterval = 1000 * 60 * saveIntervalMultiplier; // Default 1 minute
  }

  async onModuleInit(): Promise<void> {
    await this.load();

    // Save state on interval
    this.timer = setInterval(() => this.save(), this.saveInterval);
    logger.info('State store initialized');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
    }
    await this.save();
    logger.info('State store destroyed');
  }

  private async load(): Promise<void> {
    try {
      const data = await fs.readFile(this.file, 'utf8');
      const stateData = JSON.parse(data);

      // Convert plain object back to Map
      for (const [id, state] of Object.entries(stateData)) {
        this.state.set(id, state as KeyValue);
      }

      logger.debug(`Loaded ${this.state.size} entity states from file ${this.file}`);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        logger.debug(`State file ${this.file} doesn't exist, starting with empty store`);
      } else {
        logger.error(`Failed to load state from file ${this.file}: ${error.message}`);
      }
    }
  }

  private async save(): Promise<void> {
    const cacheEnabled = this.configService.get<boolean>('CACHE_STATE_ENABLE', true);

    if (!cacheEnabled) {
      logger.debug('State caching disabled, not saving');
      return;
    }

    try {
      // Convert Map to plain object for JSON serialization
      const stateData = Object.fromEntries(this.state);
      const json = JSON.stringify(stateData, null, 2);

      // Ensure directory exists
      await fs.mkdir(join(this.file, '..'), { recursive: true });
      await fs.writeFile(this.file, json, 'utf8');

      logger.debug(`Saved ${this.state.size} entity states to file ${this.file}`);
    } catch (error: any) {
      logger.error(`Failed to save state to file ${this.file}: ${error.message}`);
    }
  }

  async reset(): Promise<void> {
    this.state.clear();
    try {
      await fs.writeFile(this.file, '{}', 'utf8');
      logger.info('State store reset');
    } catch (error: any) {
      logger.error(`Failed to reset state file ${this.file}: ${error.message}`);
    }
  }

  exists(entity: EntityState): boolean {
    return this.state.has(entity.id);
  }

  existsById(id: string): boolean {
    return this.state.has(id);
  }

  get(id: string): KeyValue {
    logger.debug(`Getting entity state: ${id}`);
    return this.state.get(id) || {};
  }

  getByDeviceIdAndUnitCode(id: string, unitCode?: number): KeyValue {
    logger.debug(`Getting entities of device: ${id}.${unitCode}`);

    for (const [entityId, entityState] of this.state) {
      if (entityState.id === id && entityState.unitCode === String(unitCode)) {
        return entityState;
      }
    }
    return {};
  }

  getByDeviceId(id: string): KeyValue[] {
    logger.debug(`Getting entities of device: ${id}`);
    const entities: KeyValue[] = [];

    for (const [entityId, entityState] of this.state) {
      if (entityState.id === id) {
        entities.push(entityState);
      }
    }

    return entities;
  }

  getAll(): KeyValue[] {
    return Array.from(this.state.values());
  }

  getAllAsMap(): Map<string, KeyValue> {
    return new Map(this.state);
  }

  set(id: string, update: KeyValue, reason?: string): KeyValue {
    logger.debug(`Updating entity state: ${id}${reason ? ` (${reason})` : ''}`);

    const existing = this.state.get(id) || {};
    const newState = objectAssignDeep({}, existing, update);
    newState.entityId = id;

    this.state.set(id, newState);
    return newState;
  }

  remove(id: string): boolean {
    logger.debug(`Removing entity state: ${id}`);
    return this.state.delete(id);
  }

  size(): number {
    return this.state.size;
  }
}
