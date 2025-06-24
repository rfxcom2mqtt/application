import { Module } from '@nestjs/common';
import { RfxcomService } from './rfxcom.service';

@Module({
  providers: [RfxcomService],
  exports: [RfxcomService],
})
export class RfxcomModule {}
