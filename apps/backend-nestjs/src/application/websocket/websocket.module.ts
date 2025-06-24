import { Module, forwardRef } from '@nestjs/common';
import { WebSocketGateway } from './websocket.gateway';
import { PrometheusModule } from '../../infrastructure/prometheus/prometheus.module';
import { JournalModule } from '../../core/journal/journal.module';

@Module({
  imports: [PrometheusModule, forwardRef(() => JournalModule)],
  providers: [WebSocketGateway],
  exports: [WebSocketGateway],
})
export class WebSocketModule {}
