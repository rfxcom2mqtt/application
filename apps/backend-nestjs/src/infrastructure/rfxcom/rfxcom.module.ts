import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RfxcomService } from './rfxcom.service';
import { RfxcomMockService } from './rfxcom-mock.service';
import { SettingsModule } from '../../core/settings/settings.module';
import { SettingsService } from '../../core/settings/settings.service';

@Module({
  imports: [SettingsModule],
  providers: [
    {
      provide: RfxcomService,
      useFactory: (configService: ConfigService, settingsService: SettingsService) => {
        // Check if mock mode is enabled
        const settings = settingsService.get();
        const usbPort =
          settings.rfxcom?.usbport ||
          configService.get<string>('RFXCOM_USB_DEVICE', '/dev/ttyUSB0');

        if (usbPort === 'mock') {
          return new RfxcomMockService(configService, settingsService);
        } else {
          return new RfxcomService(configService, settingsService);
        }
      },
      inject: [ConfigService, SettingsService],
    },
  ],
  exports: [RfxcomService],
})
export class RfxcomModule {}
