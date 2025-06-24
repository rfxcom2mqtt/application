import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BridgeService } from './bridge.service';
import { MqttModule } from '../../infrastructure/mqtt/mqtt.module';
import { RfxcomModule } from '../../infrastructure/rfxcom/rfxcom.module';
import { DiscoveryModule } from '../discovery/discovery.module';
import { SettingsModule } from '../settings/settings.module';
import { DeviceStoreModule } from '../store/device-store.module';
import { StateStoreModule } from '../store/state-store.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MqttModule,
    RfxcomModule,
    DiscoveryModule,
    SettingsModule,
    DeviceStoreModule,
    StateStoreModule,
  ],
  providers: [BridgeService],
  exports: [BridgeService],
})
export class BridgeModule {}
