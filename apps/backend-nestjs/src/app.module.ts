import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BridgeModule } from './application/api/bridge/bridge.module';
import { DeviceModule } from './application/api/device/device.module';
import { SettingsModule } from './application/api/settings/settings.module';
import { MqttModule } from './infrastructure/mqtt/mqtt.module';
import { RfxcomModule } from './infrastructure/rfxcom/rfxcom.module';
import { DiscoveryModule } from './core/discovery/discovery.module';
import { WebSocketModule } from './application/websocket/websocket.module';
import { PrometheusModule } from './infrastructure/prometheus/prometheus.module';
import { FrontendModule } from './application/api/frontend/frontend.module';
import { configurationLoader } from './core/discovery/config/configuration';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configurationLoader],
      envFilePath: ['.env.dev', '.env'],
    }),

    // Schedule module for cron jobs
    ScheduleModule.forRoot(),

    // Feature modules
    BridgeModule,
    DeviceModule,
    SettingsModule,
    MqttModule,
    RfxcomModule,
    DiscoveryModule,
    WebSocketModule,
    PrometheusModule,

    // Frontend module (should be last to catch all non-API routes)
    FrontendModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
