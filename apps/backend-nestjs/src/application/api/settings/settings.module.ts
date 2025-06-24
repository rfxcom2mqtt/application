import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { SettingsModule as CoreSettingsModule } from '../../../core/settings/settings.module';
import { MqttModule } from '../../../infrastructure/mqtt/mqtt.module';

@Module({
  imports: [CoreSettingsModule, MqttModule],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
