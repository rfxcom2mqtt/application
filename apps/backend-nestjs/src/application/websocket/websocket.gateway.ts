import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { logger } from '../../utils/logger';

@WSGateway({
  cors: {
    origin: '*',
  },
})
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket): void {
    logger.info(`WebSocket client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    logger.info(`WebSocket client disconnected: ${client.id}`);
  }

  broadcastMessage(event: string, data: any): void {
    this.server.emit(event, data);
  }
}
