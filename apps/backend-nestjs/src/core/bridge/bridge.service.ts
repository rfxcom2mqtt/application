import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { BridgeInfoClass, DeviceStateStore, MQTTMessage } from '@rfxcom2mqtt/shared';
import { MqttService, MqttEventListener } from '../../infrastructure/mqtt/mqtt.service';
import { RfxcomService, RfxcomEvent, RfxcomInfo } from '../../infrastructure/rfxcom/rfxcom.service';
import { DiscoveryService } from '../discovery/discovery.service';
import { SettingsService } from '../settings/settings.service';
import { DeviceStore } from '../store/device.store';
import { StateStore } from '../store/state.store';
import { loggerFactory, LoggerCategories } from '../../utils/logger';

export interface Action {
  type: 'bridge' | 'device';
  action?: string;
  deviceId?: string;
  entityId?: string;
}

export const BRIDGE_ACTIONS = {
  RESTART: 'restart',
  STOP: 'stop',
  RESET_DEVICES: 'reset_devices',
  RESET_STATE: 'reset_state',
} as const;

export const DEVICE_TYPES = {
  LIGHTING1: 'lighting1',
  LIGHTING2: 'lighting2',
  LIGHTING3: 'lighting3',
  LIGHTING4: 'lighting4',
  LIGHTING5: 'lighting5',
  LIGHTING6: 'lighting6',
  BLINDS1: 'blinds1',
  SECURITY1: 'security1',
  TEMPERATUREHUMIDITY1: 'temperaturehumidity1',
} as const;

@Injectable()
export class BridgeService implements OnModuleInit, OnModuleDestroy, MqttEventListener {
  private readonly logger = loggerFactory.getLogger(LoggerCategories.BRIDGE);
  private bridgeInfo = new BridgeInfoClass();
  private isStarted = false;
  private healthCheckEnabled = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService,
    private readonly mqttService: MqttService,
    private readonly rfxcomService: RfxcomService,
    private readonly discoveryService: DiscoveryService,
    private readonly deviceStore: DeviceStore,
    private readonly stateStore: StateStore
  ) {}

  async onModuleInit(): Promise<void> {
    await this.start();
  }

  async onModuleDestroy(): Promise<void> {
    await this.stop();
  }

  /**
   * Starts the bridge service and all its components
   */
  async start(): Promise<void> {
    if (this.isStarted) {
      this.logger.debug('Bridge service already started');
      return;
    }

    this.logger.info('Starting RFXCOM to MQTT bridge');

    try {
      // Initialize bridge info
      this.initializeBridgeInfo();

      // Set up MQTT event listeners
      this.setupMqttEventListeners();

      // Set up RFXCOM event handlers
      this.setupRfxcomEventHandlers();

      // Enable health checks if configured
      this.enableHealthChecks();

      this.isStarted = true;
      this.logger.info('Bridge service started successfully');
    } catch (error: any) {
      this.logger.error(`Failed to start bridge service: ${error.message}`);
      throw error;
    }
  }

  /**
   * Stops the bridge service gracefully
   */
  async stop(): Promise<void> {
    if (!this.isStarted) {
      this.logger.debug('Bridge service already stopped');
      return;
    }

    this.logger.info('Stopping RFXCOM to MQTT bridge');

    try {
      this.healthCheckEnabled = false;
      this.isStarted = false;
      this.logger.info('Bridge service stopped successfully');
    } catch (error: any) {
      this.logger.error(`Error stopping bridge service: ${error.message}`);
      throw error;
    }
  }

  /**
   * Restarts the bridge service
   */
  async restart(): Promise<void> {
    this.logger.info('Restarting RFXCOM to MQTT bridge');
    await this.stop();
    await this.start();
    this.logger.info('Bridge service restarted successfully');
  }

  /**
   * Gets the current bridge information
   */
  getBridgeInfo(): BridgeInfoClass {
    return this.bridgeInfo;
  }

  /**
   * Executes a bridge action
   */
  async executeAction(action: Action): Promise<void> {
    if (!action || !action.type) {
      this.logger.warn('Invalid action received: missing type or malformed action object');
      return;
    }

    this.logger.debug(`Processing action: ${JSON.stringify(action)}`);

    try {
      if (action.type === 'bridge') {
        if (!action.action) {
          this.logger.warn('Bridge action missing action property');
          return;
        }
        await this.executeBridgeAction(action.action);
      } else if (action.type === 'device') {
        if (!action.deviceId || !action.entityId || !action.action) {
          this.logger.warn('Device action missing required properties');
          return;
        }
        await this.executeDeviceAction(action.deviceId, action.entityId, action.action);
      } else {
        this.logger.warn(`Unknown action type: ${action.type}`);
      }
    } catch (error: any) {
      this.logger.error(`Failed to execute action: ${error.message}`);
      throw error;
    }
  }

  /**
   * Executes a bridge-specific action
   */
  async executeBridgeAction(action: string): Promise<void> {
    this.logger.info(`Executing bridge action: ${action}`);

    switch (action) {
      case BRIDGE_ACTIONS.RESTART:
        await this.restart();
        break;
      case BRIDGE_ACTIONS.STOP:
        await this.stop();
        break;
      case BRIDGE_ACTIONS.RESET_DEVICES:
        await this.resetDevices();
        break;
      case BRIDGE_ACTIONS.RESET_STATE:
        await this.resetState();
        break;
      default:
        throw new Error(`Unknown bridge action: ${action}`);
    }
  }

  /**
   * Executes a device-specific action
   */
  async executeDeviceAction(deviceId: string, entityId: string, action: string): Promise<void> {
    const deviceState = this.deviceStore.get(deviceId);

    if (!deviceState) {
      this.logger.warn(`Device not found: ${deviceId}`);
      return;
    }

    try {
      const device = new DeviceStateStore(deviceState);
      const baseTopic = this.mqttService.getBaseTopic();
      const commandTopic = device.getCommandTopic(`${baseTopic}/cmd/`, entityId);

      // Simulate MQTT message for device action
      await this.onMQTTMessage({
        topic: commandTopic,
        message: action,
      });

      this.logger.debug(`Device action executed: ${deviceId}/${entityId} -> ${action}`);
    } catch (error: any) {
      this.logger.error(`Failed to execute device action: ${error.message}`);
      throw error;
    }
  }

  /**
   * Resets all devices
   */
  async resetDevices(): Promise<void> {
    this.logger.info('Resetting all devices');
    await this.deviceStore.reset();
    this.logger.info('Devices reset completed');
  }

  /**
   * Resets application state
   */
  async resetState(): Promise<void> {
    this.logger.info('Resetting application state');
    await this.stateStore.reset();
    this.logger.info('State reset completed');
  }

  /**
   * Initializes bridge information
   */
  private initializeBridgeInfo(): void {
    const settings = this.settingsService.get();

    this.bridgeInfo.version = '1.0.0'; // TODO: Get from package.json
    this.bridgeInfo.logLevel = settings.loglevel || 'info';

    // Coordinator info will be updated when RFXCOM connects
    this.bridgeInfo.coordinator = {
      receiverTypeCode: 0,
      receiverType: 'Unknown',
      hardwareVersion: '0.0',
      firmwareVersion: 0,
      firmwareType: 'Unknown',
      enabledProtocols: [],
    };
  }

  /**
   * Sets up MQTT event listeners
   */
  private setupMqttEventListeners(): void {
    this.mqttService.addListener(this);
  }

  /**
   * Sets up RFXCOM event handlers
   */
  private setupRfxcomEventHandlers(): void {
    // Subscribe to protocol events
    this.rfxcomService.subscribeProtocolsEvent((type: string, evt: RfxcomEvent) => {
      this.handleRfxcomEvent(type, evt);
    });

    // Handle status updates
    this.rfxcomService.onStatus((coordinatorInfo: RfxcomInfo) => {
      this.handleRfxcomStatus(coordinatorInfo);
    });

    // Handle disconnection events
    this.rfxcomService.onDisconnect((evt: Record<string, unknown>) => {
      this.handleRfxcomDisconnect(evt);
    });
  }

  /**
   * Enables health checks if configured
   */
  private enableHealthChecks(): void {
    const settings = this.settingsService.get();

    if (settings.healthcheck?.enabled) {
      this.healthCheckEnabled = true;
      this.logger.info('Health checks enabled');
    } else {
      this.logger.debug('Health checks disabled');
    }
  }

  /**
   * Handles RFXCOM status updates
   */
  private async handleRfxcomStatus(coordinatorInfo: RfxcomInfo): Promise<void> {
    this.bridgeInfo.coordinator = coordinatorInfo;

    // Publish bridge info to MQTT
    try {
      const baseTopic = this.mqttService.getBaseTopic();
      await this.mqttService.publish('bridge/info', JSON.stringify(this.bridgeInfo), {
        retain: true,
      });

      // Publish to Home Assistant discovery if enabled
      const settings = this.settingsService.get();
      if (settings.homeassistant?.discovery) {
        // Create a proper device state for the bridge
        const bridgeDeviceState = {
          id: 'bridge',
          type: 'bridge',
          subtype: 0,
          subTypeValue: 'bridge',
          entities: [],
          sensors: {},
          switches: {},
          switchs: {}, // Note: using 'switchs' to match the interface
          binarySensors: {},
          binarysensors: {}, // Note: using 'binarysensors' to match the interface
          covers: {},
          selects: {},
          lastSeen: new Date().toISOString(),
          deviceName: 'RFXCOM Bridge',
          manufacturer: 'RFXCOM',
          via_device: 'bridge',
          model: 'RFXCOM Bridge',
          identifiers: ['bridge'],
          name: 'RFXCOM Bridge',
          ...this.bridgeInfo,
        };
        await this.discoveryService.publishDiscovery(new DeviceStateStore(bridgeDeviceState));
      }
    } catch (error: any) {
      this.logger.error(`Failed to publish bridge info: ${error.message}`);
    }
  }

  /**
   * Handles RFXCOM disconnection events
   */
  private async handleRfxcomDisconnect(evt: Record<string, unknown>): Promise<void> {
    this.logger.warn('RFXCOM disconnected');

    try {
      await this.mqttService.publish('bridge/state', 'offline', { retain: true });
    } catch (error: any) {
      this.logger.error(`Failed to publish disconnection status: ${error.message}`);
    }
  }

  /**
   * Handles RFXCOM events and forwards them to MQTT
   */
  private async handleRfxcomEvent(type: string, evt: RfxcomEvent): Promise<void> {
    if (!evt) {
      this.logger.warn(`Received empty RFXCOM event of type ${type}`);
      return;
    }

    this.logger.info(`Received RFXCOM event type ${type}: ${JSON.stringify(evt)}`);

    try {
      // Process the event data
      const processedEvent = this.processRfxcomEvent(type, evt);

      if (!processedEvent.id) {
        this.logger.warn(
          `RFXCOM event missing ID, cannot publish to MQTT: ${JSON.stringify(processedEvent)}`
        );
        return;
      }

      // Store device if not exists
      this.storeDeviceIfNew(processedEvent);

      // Build the topic entity and payload
      const topicEntity = this.buildTopicEntity(processedEvent);
      const payload = JSON.stringify(processedEvent, null, 2);

      // Publish to MQTT
      await this.publishToMqttTopic(topicEntity, payload);

      // Handle Home Assistant discovery
      await this.handleHomeAssistantDiscovery(processedEvent);

      this.logger.debug(`Successfully processed RFXCOM event: ${type} for entity ${topicEntity}`);
    } catch (error: any) {
      this.logger.error(`Failed to process RFXCOM event: ${error.message}`);
    }
  }

  /**
   * Processes a raw RFXCOM event into a standardized format
   */
  private processRfxcomEvent(type: string, evt: RfxcomEvent): any {
    const processedEvent = { ...evt, type };

    // Handle special device types
    if (type === DEVICE_TYPES.LIGHTING4) {
      processedEvent.id = (evt as any).data;
    }

    return processedEvent;
  }

  /**
   * Stores a device if it's new
   */
  private storeDeviceIfNew(event: any): void {
    const existingDevice = this.deviceStore.get(event.id);

    if (!existingDevice) {
      const deviceState = {
        id: event.id,
        type: event.type,
        subtype: event.subtype,
        deviceName: event.deviceName,
        lastSeen: new Date().toISOString(),
        ...event,
      };

      this.deviceStore.set(event.id, deviceState);
      this.logger.debug(`New device stored: ${event.id}`);
    }
  }

  /**
   * Builds the MQTT topic entity part from an event
   */
  private buildTopicEntity(event: any): string {
    let topicEntity = event.id;

    // Add unit code to topic if present and not a group command
    if (event.unitCode !== undefined && !event.group) {
      topicEntity += `/${event.unitCode}`;
    }

    return topicEntity;
  }

  /**
   * Publishes a message to an MQTT topic
   */
  private async publishToMqttTopic(topicEntity: string, payload: string): Promise<void> {
    try {
      const fullTopic = `devices/${topicEntity}`;
      await this.mqttService.publish(fullTopic, payload);
      this.logger.debug(`Successfully published to MQTT topic: ${fullTopic}`);
    } catch (error: any) {
      this.logger.error(`Failed to publish to MQTT: ${error.message}`);
    }
  }

  /**
   * Handles Home Assistant discovery for a device
   */
  private async handleHomeAssistantDiscovery(payload: any): Promise<void> {
    const settings = this.settingsService.get();

    if (!settings.homeassistant?.discovery) {
      this.logger.debug('Home Assistant discovery disabled, skipping');
      return;
    }

    try {
      const deviceStateStore = new DeviceStateStore(payload);
      await this.discoveryService.publishDiscovery(deviceStateStore);
      this.logger.debug(`Published discovery information for device: ${payload.id || 'unknown'}`);
    } catch (error: any) {
      this.logger.error(`Failed to publish discovery: ${error.message}`);
    }
  }

  /**
   * Returns the MQTT topics this service subscribes to
   */
  subscribeTopic(): string[] {
    const settings = this.settingsService.get();
    const baseTopic = settings.mqtt?.base_topic || 'rfxcom2mqtt';
    return [`${baseTopic}/command/#`];
  }

  /**
   * Handles incoming MQTT messages and routes them to RFXCOM
   */
  async onMQTTMessage(data: MQTTMessage): Promise<void> {
    try {
      const topicParts = data.topic.split('/');
      const settings = this.settingsService.get();
      const baseTopic = settings.mqtt?.base_topic || 'rfxcom2mqtt';

      if (!this.validateTopicStructure(topicParts, baseTopic)) {
        return;
      }

      if (topicParts[1] === 'command') {
        await this.handleCommandMessage(topicParts, data.message);
      } else {
        this.logger.warn(`Invalid topic structure: expected 'command' but got '${topicParts[1]}'`);
      }
    } catch (error: any) {
      this.logger.error(`Error processing MQTT message: ${error.message}`);
    }
  }

  /**
   * Validates the structure of an incoming MQTT topic
   */
  private validateTopicStructure(topicParts: string[], baseTopic: string): boolean {
    if (topicParts[0] !== baseTopic) {
      this.logger.warn(`Invalid topic base: expected '${baseTopic}' but got '${topicParts[0]}'`);
      return false;
    }
    return true;
  }

  /**
   * Handles command messages from MQTT
   */
  private async handleCommandMessage(topicParts: string[], message: string): Promise<void> {
    const deviceType = topicParts[2];
    let entityName = topicParts[3];

    // Handle unit codes in the entity name
    if (topicParts[4] !== undefined && topicParts[4].length > 0) {
      entityName += '/' + topicParts[4];
    }

    // Find device configuration
    const settings = this.settingsService.get();
    const deviceConf = settings.devices?.find(dev => dev.name === entityName);

    // Send command to RFXCOM bridge
    try {
      await this.rfxcomService.sendCommand(deviceType, entityName, message, deviceConf);
      this.logger.debug(`Command sent to RFXCOM: ${deviceType}/${entityName} -> ${message}`);
    } catch (error: any) {
      this.logger.error(`Failed to send command to RFXCOM: ${error.message}`);
    }
  }

  /**
   * Performs a health check (scheduled via cron)
   */
  @Cron('* * * * *') // Every minute - will be overridden by settings
  async performHealthCheck(): Promise<void> {
    if (!this.healthCheckEnabled || !this.isStarted) {
      return;
    }

    this.logger.debug('Performing health check');

    try {
      const status = await this.rfxcomService.getStatus();
      await this.mqttService.publishState(status);

      if (status === 'offline') {
        this.logger.error('Health check failed: RFXCOM is offline');
        // Could trigger restart or alert here
      } else {
        this.logger.debug(`Health check passed: RFXCOM status is ${status}`);
      }
    } catch (error: any) {
      this.logger.error(`Health check failed: ${error.message}`);
    }
  }

  /**
   * Checks if the bridge is running
   */
  isRunning(): boolean {
    return this.isStarted;
  }
}
