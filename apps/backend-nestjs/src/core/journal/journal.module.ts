import { Module, forwardRef } from '@nestjs/common';
import { JournalService } from './journal.service';
import { WebSocketModule } from '../../application/websocket/websocket.module';

@Module({
  imports: [forwardRef(() => WebSocketModule)],
  providers: [JournalService],
  exports: [JournalService],
})
export class JournalModule {}
