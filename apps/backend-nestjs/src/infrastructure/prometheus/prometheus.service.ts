import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { logger } from '../../utils/logger';
import * as promClient from 'prom-client';
import express from 'express';
import { Server } from 'http';

@Injectable()
export class PrometheusService implements OnModuleInit, OnModuleDestroy {
  private server?: Server;
  private register: promClient.Registry;
  private isStarted = false;

  // Metrics
  private rfxcomMessagesTotal!: promClient.Counter<string>;
  private mqttMessagesTotal!: promClient.Counter<string>;
  private deviceStatesTotal!: promClient.Gauge<string>;
  private bridgeUptime!: promClient.Gauge<string>;
  private httpRequestsTotal!: promClient.Counter<string>;
  private httpRequestDuration!: promClient.Histogram<string>;
  private websocketConnections!: promClient.Gauge<string>;
  private errorTotal!: promClient.Counter<string>;

  constructor(private readonly configService: ConfigService) {
    // Create a new registry
    this.register = new promClient.Registry();

    // Add default metrics
    promClient.collectDefaultMetrics({
      register: this.register,
      prefix: 'rfxcom2mqtt_',
    });

    // Initialize custom metrics
    this.initializeMetrics();
  }

  async onModuleInit(): Promise<void> {
    await this.start();
  }

  async onModuleDestroy(): Promise<void> {
    await this.stop();
  }

  private initializeMetrics(): void {
    // RFXCOM message counter
    this.rfxcomMessagesTotal = new promClient.Counter({
      name: 'rfxcom2mqtt_rfxcom_messages_total',
      help: 'Total number of RFXCOM messages processed',
      labelNames: ['type', 'subtype', 'direction'],
      registers: [this.register],
    });

    // MQTT message counter
    this.mqttMessagesTotal = new promClient.Counter({
      name: 'rfxcom2mqtt_mqtt_messages_total',
      help: 'Total number of MQTT messages processed',
      labelNames: ['topic', 'direction', 'qos'],
      registers: [this.register],
    });

    // Device states gauge
    this.deviceStatesTotal = new promClient.Gauge({
      name: 'rfxcom2mqtt_device_states_total',
      help: 'Total number of device states stored',
      labelNames: ['type'],
      registers: [this.register],
    });

    // Bridge uptime
    this.bridgeUptime = new promClient.Gauge({
      name: 'rfxcom2mqtt_bridge_uptime_seconds',
      help: 'Bridge uptime in seconds',
      registers: [this.register],
    });

    // HTTP requests
    this.httpRequestsTotal = new promClient.Counter({
      name: 'rfxcom2mqtt_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.register],
    });

    // HTTP request duration
    this.httpRequestDuration = new promClient.Histogram({
      name: 'rfxcom2mqtt_http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.1, 0.5, 1, 2, 5],
      registers: [this.register],
    });

    // WebSocket connections
    this.websocketConnections = new promClient.Gauge({
      name: 'rfxcom2mqtt_websocket_connections',
      help: 'Number of active WebSocket connections',
      registers: [this.register],
    });

    // Error counter
    this.errorTotal = new promClient.Counter({
      name: 'rfxcom2mqtt_errors_total',
      help: 'Total number of errors',
      labelNames: ['service', 'type'],
      registers: [this.register],
    });
  }

  async start(): Promise<void> {
    if (this.isStarted) {
      logger.debug('Prometheus service already started');
      return;
    }

    const enabled = this.configService.get<boolean>('prometheus.enabled', false);

    if (!enabled) {
      logger.debug('Prometheus metrics disabled');
      return;
    }

    const port = this.configService.get<number>('prometheus.port', 9090);

    try {
      logger.info('Prometheus service starting...');

      const app = express();

      // Metrics endpoint
      app.get('/metrics', async (req, res) => {
        try {
          res.set('Content-Type', this.register.contentType);
          const metrics = await this.register.metrics();
          res.end(metrics);
        } catch (error: any) {
          logger.error(`Error generating metrics: ${error.message}`);
          res.status(500).end('Error generating metrics');
        }
      });

      // Health endpoint
      app.get('/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
      });

      this.server = app.listen(port, () => {
        logger.info(`Prometheus metrics server listening on port ${port}`);
        this.isStarted = true;
      });

      // Initialize bridge uptime tracking
      const startTime = Date.now();
      setInterval(() => {
        this.bridgeUptime.set((Date.now() - startTime) / 1000);
      }, 5000);
    } catch (error: any) {
      logger.error(`Failed to start Prometheus service: ${error.message}`);
    }
  }

  async stop(): Promise<void> {
    if (!this.isStarted) {
      logger.debug('Prometheus service already stopped');
      return;
    }

    logger.info('Prometheus service stopping...');

    if (this.server) {
      await new Promise<void>(resolve => {
        this.server!.close(() => {
          logger.info('Prometheus service stopped');
          this.isStarted = false;
          resolve();
        });
      });
    }
  }

  // RFXCOM metrics
  recordRfxcomMessage(type: string, subtype: string, direction: 'inbound' | 'outbound'): void {
    this.rfxcomMessagesTotal.inc({ type, subtype, direction });
  }

  // MQTT metrics
  recordMqttMessage(topic: string, direction: 'publish' | 'subscribe', qos: number = 0): void {
    this.mqttMessagesTotal.inc({ topic, direction, qos: qos.toString() });
  }

  // Device metrics
  updateDeviceStatesCount(type: string, count: number): void {
    this.deviceStatesTotal.set({ type }, count);
  }

  // HTTP metrics
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number): void {
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode.toString() });
    this.httpRequestDuration.observe({ method, route }, duration);
  }

  // WebSocket metrics
  updateWebSocketConnections(count: number): void {
    this.websocketConnections.set(count);
  }

  // Error metrics
  recordError(service: string, type: string): void {
    this.errorTotal.inc({ service, type });
  }

  // Generic metric recording
  recordMetric(name: string, value: number, labels?: Record<string, string>): void {
    logger.debug(`Recording metric: ${name} = ${value}`, labels);

    // For custom metrics, we can create them dynamically
    try {
      const metric = new promClient.Gauge({
        name: `rfxcom2mqtt_custom_${name}`,
        help: `Custom metric: ${name}`,
        labelNames: labels ? Object.keys(labels) : [],
        registers: [this.register],
      });

      if (labels) {
        metric.set(labels, value);
      } else {
        metric.set(value);
      }
    } catch (error: any) {
      // Metric might already exist, try to update it
      logger.debug(`Metric ${name} might already exist: ${error.message}`);
    }
  }

  // Get metrics for debugging
  async getMetrics(): Promise<string> {
    return await this.register.metrics();
  }

  // Check if service is running
  isRunning(): boolean {
    return this.isStarted;
  }
}
