import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { logger } from '../../../utils/logger';

@Injectable()
export class DeviceService {
  private devices: Map<string, any> = new Map();

  constructor(private readonly configService: ConfigService) {}

  async getAllDevices(): Promise<any[]> {
    return Array.from(this.devices.values());
  }

  async getDevice(id: string): Promise<any> {
    const device = this.devices.get(id);
    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }
    return device;
  }

  async executeDeviceAction(deviceId: string, entityId: string, action: string): Promise<void> {
    logger.info(`Executing device action: ${deviceId}/${entityId} -> ${action}`);

    const device = this.devices.get(deviceId);
    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    // TODO: Implement actual device action execution
    // This would involve sending commands to the RFXCOM bridge
    logger.debug(`Device action would be executed: ${deviceId}/${entityId} -> ${action}`);
  }

  addDevice(id: string, device: any): void {
    this.devices.set(id, device);
    logger.debug(`Device added: ${id}`);
  }

  removeDevice(id: string): void {
    this.devices.delete(id);
    logger.debug(`Device removed: ${id}`);
  }

  updateDevice(id: string, device: any): void {
    this.devices.set(id, device);
    logger.debug(`Device updated: ${id}`);
  }

  reset(): void {
    this.devices.clear();
    logger.info('All devices reset');
  }
}
