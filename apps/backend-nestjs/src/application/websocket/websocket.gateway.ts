import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, OnModuleInit, OnModuleDestroy, Inject, forwardRef } from '@nestjs/common';
import { loggerFactory, LoggerCategories } from '../../utils/logger';
import { PrometheusService } from '../../infrastructure/prometheus/prometheus.service';
import { JournalService } from '../../core/journal/journal.service';

@Injectable()
@WSGateway({
  cors: {
    origin: '*',
  },
  namespace: '/',
})
export class WebSocketGateway 
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleInit, OnModuleDestroy {
  
  @WebSocketServer()
  server!: Server;

  private readonly logger = loggerFactory.getLogger(LoggerCategories.WEBSOCKET);
  private connectedClients = new Set<string>();
  private deviceSubscriptions = new Map<string, Set<string>>(); // deviceId -> Set of clientIds
  private clientSubscriptions = new Map<string, Set<string>>(); // clientId -> Set of deviceIds

  constructor(
    private readonly prometheusService: PrometheusService,
    @Inject(forwardRef(() => JournalService))
    private readonly journalService?: JournalService
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.info('WebSocket gateway module initialized');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.info('WebSocket gateway module destroyed');
    this.connectedClients.clear();
    this.deviceSubscriptions.clear();
    this.clientSubscriptions.clear();
  }

  afterInit(server: Server): void {
    this.logger.info('WebSocket gateway initialized');
  }

  handleConnection(client: Socket): void {
    this.logger.info(`WebSocket client connected: ${client.id} from ${client.handshake.address}`);
    
    this.connectedClients.add(client.id);
    this.clientSubscriptions.set(client.id, new Set());
    
    // Update metrics
    this.prometheusService.updateWebSocketConnections(this.connectedClients.size);
    
    // Send initial connection confirmation
    client.emit('connected', {
      clientId: client.id,
      timestamp: new Date().toISOString(),
      message: 'Connected to RFXCOM2MQTT WebSocket',
    });

    // Send current connection count
    client.emit('connection_count', {
      count: this.connectedClients.size,
      timestamp: new Date().toISOString(),
    });

    // Send all existing logs to the newly connected client (like original backend)
    this.sendAllLogsToClient(client);
  }

  handleDisconnect(client: Socket): void {
    this.logger.info(`WebSocket client disconnected: ${client.id}`);
    
    // Clean up subscriptions
    const clientDevices = this.clientSubscriptions.get(client.id);
    if (clientDevices) {
      clientDevices.forEach(deviceId => {
        const deviceClients = this.deviceSubscriptions.get(deviceId);
        if (deviceClients) {
          deviceClients.delete(client.id);
          if (deviceClients.size === 0) {
            this.deviceSubscriptions.delete(deviceId);
          }
        }
      });
    }
    
    this.connectedClients.delete(client.id);
    this.clientSubscriptions.delete(client.id);
    
    // Update metrics
    this.prometheusService.updateWebSocketConnections(this.connectedClients.size);
    
    // Broadcast updated connection count
    this.broadcastConnectionCount();
  }

  @SubscribeMessage('subscribe_device')
  handleDeviceSubscription(
    @MessageBody() data: { deviceId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    const { deviceId } = data;
    
    if (!deviceId) {
      client.emit('error', { message: 'Device ID is required' });
      return;
    }

    this.logger.debug(`Client ${client.id} subscribing to device: ${deviceId}`);
    
    // Add client to device subscription
    if (!this.deviceSubscriptions.has(deviceId)) {
      this.deviceSubscriptions.set(deviceId, new Set());
    }
    this.deviceSubscriptions.get(deviceId)!.add(client.id);
    
    // Add device to client subscription
    this.clientSubscriptions.get(client.id)?.add(deviceId);
    
    client.emit('subscribed', {
      deviceId,
      timestamp: new Date().toISOString(),
      message: `Subscribed to device ${deviceId}`,
    });
  }

  @SubscribeMessage('unsubscribe_device')
  handleDeviceUnsubscription(
    @MessageBody() data: { deviceId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    const { deviceId } = data;
    
    if (!deviceId) {
      client.emit('error', { message: 'Device ID is required' });
      return;
    }

    this.logger.debug(`Client ${client.id} unsubscribing from device: ${deviceId}`);
    
    // Remove client from device subscription
    const deviceClients = this.deviceSubscriptions.get(deviceId);
    if (deviceClients) {
      deviceClients.delete(client.id);
      if (deviceClients.size === 0) {
        this.deviceSubscriptions.delete(deviceId);
      }
    }
    
    // Remove device from client subscription
    this.clientSubscriptions.get(client.id)?.delete(deviceId);
    
    client.emit('unsubscribed', {
      deviceId,
      timestamp: new Date().toISOString(),
      message: `Unsubscribed from device ${deviceId}`,
    });
  }

  @SubscribeMessage('get_status')
  handleGetStatus(@ConnectedSocket() client: Socket): void {
    const clientDevices = this.clientSubscriptions.get(client.id);
    
    client.emit('status', {
      clientId: client.id,
      connectedClients: this.connectedClients.size,
      subscribedDevices: Array.from(clientDevices || []),
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): void {
    client.emit('pong', {
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('getAllLogs')
  handleGetAllLogs(@ConnectedSocket() client: Socket): void {
    this.logger.info('getAllLogs request received from client: ' + client.id);
    this.sendAllLogsToClient(client);
  }

  // Public methods for broadcasting events

  /**
   * Broadcast a message to all connected clients
   */
  broadcastMessage(event: string, data: any): void {
    if (this.server) {
      this.server.emit(event, {
        ...data,
        timestamp: new Date().toISOString(),
      });
      this.logger.debug(`Broadcasted ${event} to ${this.connectedClients.size} clients`);
    }
  }

  /**
   * Send log message to all connected clients (like original backend)
   */
  sendLog(message: any): void {
    if (this.server) {
      this.server.emit('log', message);
      // Don't log this to avoid infinite loops
    }
  }

  /**
   * Send all logs to a specific client
   */
  private sendAllLogsToClient(client: Socket): void {
    if (this.journalService) {
      const logs = this.journalService.getAllLogs();
      logs.forEach(log => {
        client.emit('log', log);
      });
      this.logger.debug(`Sent ${logs.length} logs to client ${client.id}`);
    }
  }

  /**
   * Broadcast device state update to subscribed clients
   */
  broadcastDeviceUpdate(deviceId: string, deviceData: any): void {
    const subscribedClients = this.deviceSubscriptions.get(deviceId);
    
    if (subscribedClients && subscribedClients.size > 0) {
      const eventData = {
        deviceId,
        data: deviceData,
        timestamp: new Date().toISOString(),
      };
      
      subscribedClients.forEach(clientId => {
        this.server.to(clientId).emit('device_update', eventData);
      });
      
      this.logger.debug(`Broadcasted device update for ${deviceId} to ${subscribedClients.size} clients`);
    }
  }

  /**
   * Broadcast bridge status update
   */
  broadcastBridgeStatus(status: any): void {
    this.broadcastMessage('bridge_status', status);
  }

  /**
   * Broadcast system event
   */
  broadcastSystemEvent(event: string, data: any): void {
    this.broadcastMessage('system_event', {
      event,
      data,
    });
  }

  /**
   * Broadcast error to all clients
   */
  broadcastError(error: string, details?: any): void {
    this.broadcastMessage('error', {
      error,
      details,
    });
  }

  /**
   * Send message to specific client
   */
  sendToClient(clientId: string, event: string, data: any): void {
    if (this.connectedClients.has(clientId)) {
      this.server.to(clientId).emit(event, {
        ...data,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): {
    connectedClients: number;
    deviceSubscriptions: number;
    totalSubscriptions: number;
  } {
    let totalSubscriptions = 0;
    this.clientSubscriptions.forEach(devices => {
      totalSubscriptions += devices.size;
    });

    return {
      connectedClients: this.connectedClients.size,
      deviceSubscriptions: this.deviceSubscriptions.size,
      totalSubscriptions,
    };
  }

  /**
   * Check if service is running
   */
  isRunning(): boolean {
    return this.server !== undefined;
  }

  private broadcastConnectionCount(): void {
    this.broadcastMessage('connection_count', {
      count: this.connectedClients.size,
    });
  }
}
