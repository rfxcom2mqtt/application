import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as mqtt from 'mqtt';
import { logger } from '../../utils/logger';

export interface MQTTOptions {
  qos?: 0 | 1 | 2;
  retain?: boolean;
}

export interface MqttConnectionConfig {
  server: string;
  port: number;
  username?: string;
  password?: string;
  qos: number;
  retain: boolean;
  version?: number;
  keepalive?: number;
  ca?: string;
  key?: string;
  cert?: string;
  client_id?: string;
  base_topic: string;
}

export interface MQTTMessage {
  topic: string;
  message: string;
}

export interface MqttEventListener {
  subscribeTopic(): string[];
  onMQTTMessage(data: MQTTMessage): void;
}

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private client?: mqtt.MqttClient;
  private defaultOptions: mqtt.IClientPublishOptions;
  private listeners: MqttEventListener[] = [];
  private isConnected = false;
  private baseTopic: string;

  constructor(private readonly configService: ConfigService) {
    this.defaultOptions = { qos: 0, retain: false };
    // Get base topic from YAML config first, then fallback to environment variable
    const mqttConfig = this.configService.get('mqtt', {});
    this.baseTopic =
      mqttConfig.base_topic || this.configService.get<string>('MQTT_BASE_TOPIC', 'rfxcom2mqtt');
  }

  async onModuleInit(): Promise<void> {
    // Start MQTT connection in background, don't block app startup
    this.connectInBackground();
  }

  /**
   * Connects to MQTT in background without blocking app startup
   */
  private connectInBackground(): void {
    this.connect().catch(error => {
      logger.warn(`MQTT connection failed, app will continue without MQTT: ${error.message}`);
      // Schedule retry after 30 seconds
      setTimeout(() => {
        logger.info('Retrying MQTT connection...');
        this.connectInBackground();
      }, 30000);
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  /**
   * Adds an event listener for MQTT messages
   */
  addListener(listener: MqttEventListener): void {
    this.listeners.push(listener);
    logger.debug(`Added MQTT listener: ${listener.constructor.name}`);

    // If already connected, subscribe to the new listener's topics
    if (this.isConnected) {
      this.subscribeToListenerTopics([listener]);
    }
  }

  /**
   * Removes an event listener
   */
  removeListener(listener: MqttEventListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
      logger.debug(`Removed MQTT listener: ${listener.constructor.name}`);
    }
  }

  /**
   * Establishes connection to the MQTT broker
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      logger.debug('MQTT already connected');
      return;
    }

    const connectionConfig = this.buildConnectionConfig();
    const options = this.buildMqttOptions(connectionConfig);

    logger.info(`Connecting to MQTT server at ${connectionConfig.server}:${connectionConfig.port}`);

    return new Promise((resolve, reject) => {
      let connectionUrl: string;

      if (connectionConfig.server.includes('://')) {
        // Server already has protocol, check if it has port
        if (
          connectionConfig.server.includes(':') &&
          connectionConfig.server.split(':').length > 2
        ) {
          // Already has port
          connectionUrl = connectionConfig.server;
        } else {
          // Add port
          connectionUrl = `${connectionConfig.server}:${connectionConfig.port}`;
        }
      } else {
        // No protocol, add mqtt:// and port
        connectionUrl = `mqtt://${connectionConfig.server}:${connectionConfig.port}`;
      }

      logger.debug(`MQTT connection URL: ${connectionUrl}`);
      this.client = mqtt.connect(connectionUrl, options);

      this.setupConnectionHandlers(resolve, reject);
    });
  }

  /**
   * Builds the connection configuration from YAML config and environment variables
   */
  private buildConnectionConfig(): MqttConnectionConfig {
    // Get MQTT config from YAML file first, then fallback to environment variables
    const mqttConfig = this.configService.get('mqtt', {});

    return {
      server:
        mqttConfig.server || this.configService.get<string>('MQTT_SERVER', 'mqtt://localhost'),
      port: mqttConfig.port || this.configService.get<number>('MQTT_PORT', 1883),
      username: mqttConfig.username || this.configService.get<string>('MQTT_USERNAME'),
      password: mqttConfig.password || this.configService.get<string>('MQTT_PASSWORD'),
      qos:
        mqttConfig.qos !== undefined
          ? mqttConfig.qos
          : this.configService.get<number>('MQTT_QOS', 0),
      retain:
        mqttConfig.retain !== undefined
          ? mqttConfig.retain
          : this.configService.get<boolean>('MQTT_RETAIN', false),
      version: mqttConfig.version || this.configService.get<number>('MQTT_VERSION'),
      keepalive: mqttConfig.keepalive || this.configService.get<number>('MQTT_KEEPALIVE', 60),
      ca: mqttConfig.ca || this.configService.get<string>('MQTT_CA'),
      key: mqttConfig.key || this.configService.get<string>('MQTT_KEY'),
      cert: mqttConfig.cert || this.configService.get<string>('MQTT_CERT'),
      client_id:
        mqttConfig.client_id ||
        this.configService.get<string>('MQTT_CLIENT_ID', 'rfxcom2mqtt-nestjs'),
      base_topic: mqttConfig.base_topic || this.baseTopic,
    };
  }

  /**
   * Builds MQTT client options from connection configuration
   */
  private buildMqttOptions(config: MqttConnectionConfig): mqtt.IClientOptions {
    this.defaultOptions = {
      qos: config.qos as 0 | 1 | 2,
      retain: config.retain,
    };

    const will = this.createWillMessage();
    const options: mqtt.IClientOptions = {
      username: config.username,
      password: config.password,
      will: will,
      clientId: config.client_id,
    };

    this.configureProtocolOptions(options, config);
    this.configureSslOptions(options, config);

    return options;
  }

  /**
   * Creates the Last Will and Testament message
   */
  private createWillMessage(): mqtt.IClientOptions['will'] {
    return {
      topic: `${this.baseTopic}/bridge/state`,
      payload: Buffer.from('offline', 'utf8'),
      qos: 1,
      retain: true,
    };
  }

  /**
   * Configures protocol-specific options for MQTT connection
   */
  private configureProtocolOptions(
    options: mqtt.IClientOptions,
    config: MqttConnectionConfig
  ): void {
    if (config.version && [3, 4, 5].includes(config.version)) {
      options.protocolVersion = config.version as 3 | 4 | 5;
      logger.debug(`Using MQTT protocol version: ${config.version}`);
    }

    if (config.keepalive) {
      options.keepalive = config.keepalive;
      logger.debug(`Using MQTT keepalive: ${config.keepalive} seconds`);
    }
  }

  /**
   * Configures SSL/TLS options for secure MQTT connection
   */
  private configureSslOptions(options: mqtt.IClientOptions, config: MqttConnectionConfig): void {
    if (config.ca) {
      logger.debug(`MQTT SSL/TLS: Loading CA certificate from ${config.ca}`);
      try {
        options.ca = fs.readFileSync(config.ca);
      } catch (error: any) {
        logger.error(`Failed to read CA certificate: ${error.message}`);
        throw new Error(`Failed to read CA certificate: ${error.message}`);
      }
    }

    if (config.key && config.cert) {
      logger.debug(`MQTT SSL/TLS: Loading client certificates`);
      try {
        options.key = fs.readFileSync(config.key);
        options.cert = fs.readFileSync(config.cert);
      } catch (error: any) {
        logger.error(`Failed to read SSL certificates: ${error.message}`);
        throw new Error(`Failed to read SSL certificates: ${error.message}`);
      }
    }
  }

  /**
   * Sets up connection event handlers for the MQTT client
   */
  private setupConnectionHandlers(resolve: () => void, reject: (error: any) => void): void {
    this.client?.on('connect', async () => {
      logger.info('Successfully connected to MQTT broker');
      this.isConnected = true;
      this.subscribeToListenerTopics(this.listeners);
      this.publishState('online');
      this.setupMessageHandler();
      resolve();
    });

    this.client?.on('error', (err: any) => {
      logger.error(`MQTT connection error: ${err.message}`);
      this.isConnected = false;
      reject(new Error(`MQTT connection failed: ${err.message}`));
    });

    this.client?.on('disconnect', () => {
      logger.warn('MQTT client disconnected');
      this.isConnected = false;
    });

    this.client?.on('reconnect', () => {
      logger.info('MQTT client attempting to reconnect');
    });
  }

  /**
   * Subscribes to topics for the given listeners
   */
  private subscribeToListenerTopics(listeners: MqttEventListener[]): void {
    listeners.forEach(listener => {
      const topics = listener.subscribeTopic();
      this.subscribeToTopics(topics);
    });
  }

  /**
   * Sets up the message handler for incoming MQTT messages
   */
  private setupMessageHandler(): void {
    this.client?.on('message', (topic: string, message: Buffer) => {
      const messageStr = message.toString();
      logger.debug(`Received MQTT message on '${topic}' with data '${messageStr}'`);

      this.notifyListeners(topic, messageStr);
    });
  }

  /**
   * Notifies all relevant listeners about an incoming MQTT message
   */
  private notifyListeners(topic: string, message: string): void {
    this.listeners.forEach(listener => {
      const subscribedTopics = listener.subscribeTopic();
      const isTopicMatch = subscribedTopics.some(subscribedTopic =>
        this.isTopicMatch(topic, subscribedTopic)
      );

      if (isTopicMatch) {
        listener.onMQTTMessage({
          topic: topic,
          message: message,
        });
      }
    });
  }

  /**
   * Checks if a topic matches a subscription pattern
   */
  private isTopicMatch(topic: string, pattern: string): boolean {
    const regexPattern = pattern.replace(/\+/g, '[^/]+').replace(/#/g, '.*');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(topic);
  }

  /**
   * Subscribes to MQTT topics
   */
  private subscribeToTopics(topics: string[]): void {
    if (!this.client || !this.isConnected) {
      logger.warn('Cannot subscribe to topics: MQTT client not available or not connected');
      return;
    }

    this.client.subscribe(topics, error => {
      if (error) {
        logger.error(`Failed to subscribe to topics ${topics.join(', ')}: ${error.message}`);
      } else {
        logger.info(`Successfully subscribed to topics: ${topics.join(', ')}`);
      }
    });
  }

  /**
   * Publishes a message to an MQTT topic
   */
  async publish(
    topic: string,
    payload: any,
    options: MQTTOptions = {},
    useBaseTopic = true
  ): Promise<void> {
    if (!this.client || !this.isConnected) {
      logger.warn(
        `Cannot publish to MQTT topic '${topic}': MQTT client not available or not connected`
      );
      return; // Gracefully handle when MQTT is not available
    }

    const actualOptions: mqtt.IClientPublishOptions = {
      ...this.defaultOptions,
      ...options,
    };

    const fullTopic = useBaseTopic ? `${this.baseTopic}/${topic}` : topic;

    logger.debug(`Publishing to MQTT topic '${fullTopic}' with payload: ${payload}`);

    return new Promise((resolve, reject) => {
      this.client!.publish(fullTopic, payload, actualOptions, error => {
        if (error) {
          logger.error(`Failed to publish to topic '${fullTopic}': ${error.message}`);
          reject(error);
        } else {
          logger.debug(`Successfully published to topic '${fullTopic}'`);
          resolve();
        }
      });
    });
  }

  /**
   * Publishes the bridge state (online/offline)
   */
  async publishState(state: string): Promise<void> {
    try {
      await this.publish('bridge/state', state, {
        retain: true,
        qos: 0,
      });
    } catch (error: any) {
      logger.error(`Failed to publish state '${state}': ${error.message}`);
    }
  }

  /**
   * Checks if the MQTT client is connected
   */
  isClientConnected(): boolean {
    return this.isConnected && this.client !== undefined && this.client.connected;
  }

  /**
   * Disconnects from the MQTT broker gracefully
   */
  async disconnect(): Promise<void> {
    if (!this.client) {
      logger.warn('Cannot disconnect: MQTT client not available');
      return;
    }

    logger.info('Disconnecting from MQTT broker');

    // Publish offline state before disconnecting
    if (this.isConnected) {
      await this.publishState('offline');
    }

    return new Promise(resolve => {
      this.client!.end(false, {}, () => {
        logger.info('MQTT client disconnected successfully');
        this.isConnected = false;
        resolve();
      });
    });
  }

  /**
   * Gets the base topic for MQTT messages
   */
  getBaseTopic(): string {
    return this.baseTopic;
  }

  /**
   * Restarts the MQTT connection with new configuration
   */
  async restart(): Promise<void> {
    logger.info('Restarting MQTT service with new configuration');

    try {
      // Disconnect from current connection if exists
      if (this.isConnected) {
        await this.disconnect();
      }

      // Update base topic from new configuration
      const mqttConfig = this.configService.get('mqtt', {});
      this.baseTopic =
        mqttConfig.base_topic || this.configService.get<string>('MQTT_BASE_TOPIC', 'rfxcom2mqtt');

      // Reconnect with new configuration
      await this.connect();

      logger.info('MQTT service restarted successfully');
    } catch (error: any) {
      logger.error(`Failed to restart MQTT service: ${error.message}`);
      // Start background reconnection
      this.connectInBackground();
    }
  }
}
