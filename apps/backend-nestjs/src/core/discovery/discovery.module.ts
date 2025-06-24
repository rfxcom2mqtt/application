import { Module } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import { MqttModule } from '../../infrastructure/mqtt/mqtt.module';
import { SettingsModule } from '../settings/settings.module';
import { DeviceStoreModule } from '../store/device-store.module';
import { StateStoreModule } from '../store/state-store.module';

@Module({
  imports: [MqttModule, SettingsModule, DeviceStoreModule, StateStoreModule],
  providers: [DiscoveryService],
  exports: [DiscoveryService],
})
export class DiscoveryModule {}
