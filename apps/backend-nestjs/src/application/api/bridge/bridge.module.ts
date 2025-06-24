import { Module } from '@nestjs/common';
import { BridgeController } from './bridge.controller';
import { BridgeService } from './bridge.service';
import { RfxcomModule } from '../../../infrastructure/rfxcom/rfxcom.module';

@Module({
  imports: [RfxcomModule],
  controllers: [BridgeController],
  providers: [BridgeService],
  exports: [BridgeService],
})
export class BridgeModule {}
