import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { logger } from '../../../utils/logger';
import { BridgeInfoClass, RfxcomInfoClass } from '@rfxcom2mqtt/shared';
import { RfxcomService } from '../../../infrastructure/rfxcom/rfxcom.service';

@Injectable()
export class BridgeService {
  constructor(
    private readonly configService: ConfigService,
    private readonly rfxcomService: RfxcomService
  ) {}

  async info(): Promise<BridgeInfoClass> {
    logger.info('Getting bridge info');

    const bridgeInfo = new BridgeInfoClass();

    // Get version from package.json
    bridgeInfo.version = '1.0.0';

    // Get log level from configuration
    const config = this.configService.get('loglevel') || 'info';
    bridgeInfo.logLevel = config;

    // Create mock RFXCOM coordinator info for now
    // TODO: Get real coordinator info from RFXCOM service when implemented
    const coordinatorInfo = new RfxcomInfoClass();
    coordinatorInfo.receiverTypeCode = 83;
    coordinatorInfo.receiverType = 'RFXtrx433XL';
    coordinatorInfo.hardwareVersion = '1.0';
    coordinatorInfo.firmwareVersion = 1041;
    coordinatorInfo.firmwareType = 'Type1';
    coordinatorInfo.enabledProtocols = [
      'AC',
      'ARC',
      'ATI',
      'HIDEKI',
      'LACROSSE',
      'OREGON',
      'PROGUARD',
      'VISONIC',
      'X10',
    ];

    bridgeInfo.coordinator = coordinatorInfo;

    logger.debug(`Bridge info: ${JSON.stringify(bridgeInfo)}`);
    return bridgeInfo;
  }

  async executeAction(action: string): Promise<void> {
    logger.info(`Executing bridge action: ${action}`);

    switch (action) {
      case 'restart':
        await this.restart();
        break;
      case 'stop':
        await this.stop();
        break;
      case 'reset_devices':
        await this.resetDevices();
        break;
      case 'reset_state':
        await this.resetState();
        break;
      default:
        throw new Error(`Unknown bridge action: ${action}`);
    }
  }

  async restart(): Promise<void> {
    logger.info('Restarting bridge...');
    // TODO: Implement bridge restart logic
    // This would involve stopping and starting all services
  }

  async stop(): Promise<void> {
    logger.info('Stopping bridge...');
    // TODO: Implement bridge stop logic
    // This would involve gracefully shutting down all services
  }

  async resetDevices(): Promise<void> {
    logger.info('Resetting devices...');
    // TODO: Implement device reset logic
    // This would clear all device states
  }

  async resetState(): Promise<void> {
    logger.info('Resetting state...');
    // TODO: Implement state reset logic
    // This would clear all application state
  }
}
