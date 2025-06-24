import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { logger } from '../../../utils/logger';

@Injectable()
export class SettingsService {
  constructor(private readonly configService: ConfigService) {}

  async getSettings(): Promise<any> {
    // Return current configuration
    return {
      frontend: this.configService.get('frontend'),
      mqtt: this.configService.get('mqtt'),
      rfxcom: this.configService.get('rfxcom'),
      homeassistant: this.configService.get('homeassistant'),
      prometheus: this.configService.get('prometheus'),
      healthcheck: this.configService.get('healthcheck'),
      loglevel: this.configService.get('loglevel'),
      devices: this.configService.get('devices', []),
    };
  }

  async updateSettings(settings: any): Promise<void> {
    logger.info('Updating application settings');

    // TODO: Implement settings persistence
    // This would involve writing to the configuration file
    // and potentially reloading services that depend on the settings

    logger.debug(`Settings update requested: ${JSON.stringify(settings)}`);
  }
}
