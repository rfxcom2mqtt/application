import { Module } from '@nestjs/common';
import { BridgeController } from './bridge.controller';
import { BridgeModule as CoreBridgeModule } from '../../../core/bridge/bridge.module';
import { RfxcomModule } from '../../../infrastructure/rfxcom/rfxcom.module';

@Module({
  imports: [RfxcomModule, CoreBridgeModule],
  controllers: [BridgeController],
})
export class BridgeModule {}
