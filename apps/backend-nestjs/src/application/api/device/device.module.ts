import { Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { DeviceStore } from '../../../core/store/device.store';
import { StateStore } from '../../../core/store/state.store';
import { DiscoveryModule } from '../../../core/discovery/discovery.module';
import { SettingsModule } from '../../../core/settings/settings.module';

@Module({
  imports: [DiscoveryModule, SettingsModule],
  controllers: [DeviceController],
  providers: [DeviceService, DeviceStore, StateStore],
  exports: [DeviceService, DeviceStore, StateStore],
})
export class DeviceModule {}
