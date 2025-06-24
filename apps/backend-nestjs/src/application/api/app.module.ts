import { Module } from '@nestjs/common';
import { BridgeModule } from './bridge/bridge.module';
import { DeviceModule } from './device/device.module';
import { SettingsModule } from './settings/settings.module';
import { FrontendModule } from './frontend/frontend.module';

@Module({
  imports: [
    // Feature modules
    BridgeModule,
    DeviceModule,
    SettingsModule,

    // Frontend module (should be last to catch all non-API routes)
    FrontendModule,
  ],
  controllers: [],
  providers: [],
})
export class ApiModule {}
