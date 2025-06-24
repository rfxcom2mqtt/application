import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeviceStateStore, ActionClass } from '@rfxcom2mqtt/shared';
import { DeviceStore } from '../../../core/store/device.store';
import { StateStore } from '../../../core/store/state.store';
import { DiscoveryService } from '../../../core/discovery/discovery.service';
import { SettingsService } from '../../../core/settings/settings.service';
import { logger } from '../../../utils/logger';

@Injectable()
export class DeviceService {
  constructor(
    private readonly configService: ConfigService,
    private readonly deviceStore: DeviceStore,
    private readonly stateStore: StateStore,
    private readonly discoveryService: DiscoveryService,
    private readonly settingsService: SettingsService
  ) {}

  async getAllDevices(): Promise<any[]> {
    const devices = this.deviceStore.getAll();

    // Apply device overrides and enrich with additional info
    return devices.map(device => {
      const deviceStateStore = new DeviceStateStore(device);
      deviceStateStore.overrideDeviceInfo();
      return deviceStateStore.state;
    });
  }

  async getDevice(id: string): Promise<any> {
    const device = this.deviceStore.get(id);
    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    const deviceStateStore = new DeviceStateStore(device);
    deviceStateStore.overrideDeviceInfo();

    // Enrich sensors with lookup information
    const sensors = deviceStateStore.getSensors();
    for (const sensorId in sensors) {
      const sensor = sensors[sensorId];
      // TODO: Apply sensor lookup from discovery service
      // sensors[sensorId] = { ...sensor, ...lookup[sensor.type] };
    }

    return deviceStateStore.state;
  }

  async getDeviceState(id: string): Promise<any[]> {
    const device = this.deviceStore.get(id);
    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    return this.stateStore.getByDeviceId(id);
  }

  async executeDeviceAction(deviceId: string, entityId: string, action: string): Promise<void> {
    logger.info(`Executing device action: ${deviceId}/${entityId} -> ${action}`);

    const device = this.deviceStore.get(deviceId);
    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    // Create action object
    const actionObj = new ActionClass('device', action, deviceId, entityId);

    // TODO: Send action to RFXCOM bridge via action callback
    // This would be handled by the controller or a dedicated action service
    logger.debug(`Device action created: ${JSON.stringify(actionObj)}`);
  }

  async renameDevice(id: string, newName: string): Promise<void> {
    const device = this.deviceStore.get(id);
    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    // Apply device override through settings service
    await this.settingsService.applyDeviceOverride({ id, name: newName });

    const deviceStateStore = new DeviceStateStore(device);
    deviceStateStore.overrideDeviceInfo(this.settingsService);

    // Update device in store
    this.deviceStore.set(id, deviceStateStore.state);

    // Publish discovery update
    await this.discoveryService.publishDiscovery(deviceStateStore);

    logger.info(`Device ${id} renamed to ${newName}`);
  }

  async renameSwitchUnit(
    deviceId: string,
    itemId: string,
    newName: string,
    unitCode: number
  ): Promise<void> {
    const device = this.deviceStore.get(deviceId);
    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    // Apply device override through settings service
    await this.settingsService.applyDeviceOverride({
      id: deviceId,
      units: [{ unitCode, name: newName }],
    });

    const deviceStateStore = new DeviceStateStore(device);
    deviceStateStore.overrideDeviceInfo(this.settingsService);

    // Update device in store
    this.deviceStore.set(deviceId, deviceStateStore.state);

    // Publish discovery update
    await this.discoveryService.publishDiscovery(deviceStateStore);

    logger.info(`Device ${deviceId} switch ${itemId} (unit ${unitCode}) renamed to ${newName}`);
  }

  addDevice(id: string, device: any): void {
    this.deviceStore.set(id, device);
    logger.debug(`Device added: ${id}`);
  }

  removeDevice(id: string): void {
    this.deviceStore.remove(id);
    logger.debug(`Device removed: ${id}`);
  }

  updateDevice(id: string, device: any): void {
    this.deviceStore.set(id, device);
    logger.debug(`Device updated: ${id}`);
  }

  async reset(): Promise<void> {
    await this.deviceStore.reset();
    logger.info('All devices reset');
  }
}
