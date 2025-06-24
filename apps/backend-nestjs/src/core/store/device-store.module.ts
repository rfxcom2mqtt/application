import { Module } from '@nestjs/common';
import { DeviceStore } from './device.store';

@Module({
  providers: [DeviceStore],
  exports: [DeviceStore],
})
export class DeviceStoreModule {}
