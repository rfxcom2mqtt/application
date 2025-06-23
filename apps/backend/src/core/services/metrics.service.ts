import { register, collectDefaultMetrics, Counter, Gauge, Histogram } from 'prom-client';
import { logger } from '../../utils/logger';

/**
 * Prometheus metrics service for collecting and exposing application metrics
 * 
 * This service provides:
 * - Default Node.js metrics (memory, CPU, event loop, etc.)
 * - Custom application metrics for RFXCOM and MQTT operations
 * - HTTP request metrics
 * - Device and message counters
 */
export class MetricsService {
  private static instance: MetricsService;
  
  // MQTT metrics
  public readonly mqttMessagesTotal: Counter<string>;
  public readonly mqttConnectionStatus: Gauge<string>;
  public readonly mqttPublishDuration: Histogram<string>;
  
  // RFXCOM metrics
  public readonly rfxcomMessagesTotal: Counter<string>;
  public readonly rfxcomConnectionStatus: Gauge<string>;
  public readonly rfxcomDevicesTotal: Gauge<string>;
  
  // Application metrics
  public readonly httpRequestsTotal: Counter<string>;
  public readonly httpRequestDuration: Histogram<string>;
  public readonly activeDevicesTotal: Gauge<string>;
  public readonly bridgeUptime: Gauge<string>;
  
  // Discovery metrics
  public readonly discoveryMessagesTotal: Counter<string>;
  public readonly homeAssistantDevicesTotal: Gauge<string>;

  private constructor() {
    // Enable default metrics collection (memory, CPU, etc.)
    collectDefaultMetrics({
      register,
      prefix: 'rfxcom2mqtt_',
      gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
    });

    // MQTT metrics
    this.mqttMessagesTotal = new Counter({
      name: 'rfxcom2mqtt_mqtt_messages_total',
      help: 'Total number of MQTT messages processed',
      labelNames: ['direction', 'topic_type', 'status'],
      registers: [register],
    });

    this.mqttConnectionStatus = new Gauge({
      name: 'rfxcom2mqtt_mqtt_connection_status',
      help: 'MQTT connection status (1 = connected, 0 = disconnected)',
      registers: [register],
    });

    this.mqttPublishDuration = new Histogram({
      name: 'rfxcom2mqtt_mqtt_publish_duration_seconds',
      help: 'Duration of MQTT publish operations',
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      labelNames: ['topic_type'],
      registers: [register],
    });

    // RFXCOM metrics
    this.rfxcomMessagesTotal = new Counter({
      name: 'rfxcom2mqtt_rfxcom_messages_total',
      help: 'Total number of RFXCOM messages processed',
      labelNames: ['direction', 'device_type', 'status'],
      registers: [register],
    });

    this.rfxcomConnectionStatus = new Gauge({
      name: 'rfxcom2mqtt_rfxcom_connection_status',
      help: 'RFXCOM connection status (1 = connected, 0 = disconnected)',
      registers: [register],
    });

    this.rfxcomDevicesTotal = new Gauge({
      name: 'rfxcom2mqtt_rfxcom_devices_total',
      help: 'Total number of RFXCOM devices discovered',
      labelNames: ['device_type'],
      registers: [register],
    });

    // Application metrics
    this.httpRequestsTotal = new Counter({
      name: 'rfxcom2mqtt_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [register],
    });

    this.httpRequestDuration = new Histogram({
      name: 'rfxcom2mqtt_http_request_duration_seconds',
      help: 'Duration of HTTP requests',
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      labelNames: ['method', 'route'],
      registers: [register],
    });

    this.activeDevicesTotal = new Gauge({
      name: 'rfxcom2mqtt_active_devices_total',
      help: 'Total number of active devices',
      registers: [register],
    });

    this.bridgeUptime = new Gauge({
      name: 'rfxcom2mqtt_bridge_uptime_seconds',
      help: 'Bridge uptime in seconds',
      registers: [register],
    });

    // Discovery metrics
    this.discoveryMessagesTotal = new Counter({
      name: 'rfxcom2mqtt_discovery_messages_total',
      help: 'Total number of discovery messages sent',
      labelNames: ['platform', 'status'],
      registers: [register],
    });

    this.homeAssistantDevicesTotal = new Gauge({
      name: 'rfxcom2mqtt_homeassistant_devices_total',
      help: 'Total number of devices published to Home Assistant',
      labelNames: ['device_type'],
      registers: [register],
    });

    logger.info('Prometheus metrics service initialized');
  }

  /**
   * Get singleton instance of MetricsService
   */
  public static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  /**
   * Get metrics in Prometheus format
   */
  public async getMetrics(): Promise<string> {
    try {
      return await register.metrics();
    } catch (error) {
      logger.error(`Failed to get metrics: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Get metrics registry
   */
  public getRegistry() {
    return register;
  }

  /**
   * Clear all metrics (useful for testing)
   */
  public clear(): void {
    register.clear();
    logger.debug('Metrics registry cleared');
  }

  /**
   * Record MQTT message
   */
  public recordMqttMessage(direction: 'inbound' | 'outbound', topicType: string, status: 'success' | 'error' = 'success'): void {
    this.mqttMessagesTotal.inc({ direction, topic_type: topicType, status });
  }

  /**
   * Set MQTT connection status
   */
  public setMqttConnectionStatus(connected: boolean): void {
    this.mqttConnectionStatus.set(connected ? 1 : 0);
  }

  /**
   * Record MQTT publish duration
   */
  public recordMqttPublishDuration(topicType: string, duration: number): void {
    this.mqttPublishDuration.observe({ topic_type: topicType }, duration);
  }

  /**
   * Record RFXCOM message
   */
  public recordRfxcomMessage(direction: 'inbound' | 'outbound', deviceType: string, status: 'success' | 'error' = 'success'): void {
    this.rfxcomMessagesTotal.inc({ direction, device_type: deviceType, status });
  }

  /**
   * Set RFXCOM connection status
   */
  public setRfxcomConnectionStatus(connected: boolean): void {
    this.rfxcomConnectionStatus.set(connected ? 1 : 0);
  }

  /**
   * Update RFXCOM devices count
   */
  public updateRfxcomDevicesCount(deviceType: string, count: number): void {
    this.rfxcomDevicesTotal.set({ device_type: deviceType }, count);
  }

  /**
   * Record HTTP request
   */
  public recordHttpRequest(method: string, route: string, statusCode: number, duration: number): void {
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode.toString() });
    this.httpRequestDuration.observe({ method, route }, duration);
  }

  /**
   * Update active devices count
   */
  public updateActiveDevicesCount(count: number): void {
    this.activeDevicesTotal.set(count);
  }

  /**
   * Update bridge uptime
   */
  public updateBridgeUptime(uptimeSeconds: number): void {
    this.bridgeUptime.set(uptimeSeconds);
  }

  /**
   * Record discovery message
   */
  public recordDiscoveryMessage(platform: string, status: 'success' | 'error' = 'success'): void {
    this.discoveryMessagesTotal.inc({ platform, status });
  }

  /**
   * Update Home Assistant devices count
   */
  public updateHomeAssistantDevicesCount(deviceType: string, count: number): void {
    this.homeAssistantDevicesTotal.set({ device_type: deviceType }, count);
  }
}

// Export singleton instance
export const metricsService = MetricsService.getInstance();
