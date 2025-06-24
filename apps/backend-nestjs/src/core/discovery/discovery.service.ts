import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeviceStateStore } from '@rfxcom2mqtt/shared';
import { MqttService } from '../../infrastructure/mqtt/mqtt.service';
import { SettingsService } from '../settings/settings.service';
import { DeviceStore } from '../store/device.store';
import { StateStore } from '../store/state.store';
import { logger } from '../../utils/logger';

// Home Assistant device class mappings
const DEVICE_CLASS_LOOKUP: { [key: string]: any } = {
  battery: {
    device_class: 'battery',
    entity_category: 'diagnostic',
    state_class: 'measurement',
    unit_of_measurement: '%',
  },
  battery_voltage: {
    device_class: 'voltage',
    entity_category: 'diagnostic',
    icon: 'mdi:sine-wave',
    state_class: 'measurement',
    enabled_by_default: true,
  },
  co2: {
    device_class: 'carbon_dioxide',
    state_class: 'measurement',
    unit_of_measurement: 'ppm',
  },
  temperature: {
    device_class: 'temperature',
    state_class: 'measurement',
    icon: 'mdi:temperature-celsius',
    unit_of_measurement: '°C',
  },
  energy: {
    device_class: 'energy',
    entity_category: 'diagnostic',
    state_class: 'total_increasing',
    unit_of_measurement: 'kWh',
  },
  humidity: {
    device_class: 'humidity',
    state_class: 'measurement',
    icon: 'mdi:humidity',
    unit_of_measurement: '%',
  },
  linkquality: {
    enabled_by_default: false,
    entity_category: 'diagnostic',
    icon: 'mdi:signal',
    state_class: 'measurement',
    unit_of_measurement: 'dBm',
  },
  power: {
    device_class: 'power',
    entity_category: 'diagnostic',
    state_class: 'measurement',
    unit_of_measurement: 'W',
  },
  pressure: {
    device_class: 'atmospheric_pressure',
    state_class: 'measurement',
    unit_of_measurement: 'hPa',
  },
  uv: {
    state_class: 'measurement',
    icon: 'mdi:sunglasses',
    unit_of_measurement: 'UV index',
  },
  weight: {
    device_class: 'weight',
    state_class: 'measurement',
    icon: 'mdi:weight',
    unit_of_measurement: 'kg',
  },
  count: {
    entity_category: 'diagnostic',
    state_class: 'measurement',
    icon: 'mdi:counter',
  },
};

// Import types from shared package
import { DeviceSensor, DeviceSwitch, DeviceBinarySensor, DeviceCover } from '@rfxcom2mqtt/shared';

@Injectable()
export class DiscoveryService implements OnModuleInit, OnModuleDestroy {
  private isStarted = false;
  private discoveryOrigin: { name: string; sw: string; url: string };

  constructor(
    private readonly configService: ConfigService,
    private readonly mqttService: MqttService,
    private readonly settingsService: SettingsService,
    private readonly deviceStore: DeviceStore,
    private readonly stateStore: StateStore
  ) {
    this.discoveryOrigin = {
      name: 'RFXCOM2MQTT',
      sw: '1.0.0', // TODO: Get from package.json
      url: 'https://rfxcom2mqtt.github.io/rfxcom2mqtt/',
    };
  }

  async onModuleInit(): Promise<void> {
    await this.start();
  }

  async onModuleDestroy(): Promise<void> {
    await this.stop();
  }

  /**
   * Starts the discovery service
   */
  async start(): Promise<void> {
    if (this.isStarted) {
      logger.debug('Discovery service already started');
      return;
    }

    logger.info('Discovery service starting...');
    this.isStarted = true;
    logger.info('Discovery service started');
  }

  /**
   * Stops the discovery service
   */
  async stop(): Promise<void> {
    if (!this.isStarted) {
      logger.debug('Discovery service already stopped');
      return;
    }

    logger.info('Discovery service stopping...');
    this.isStarted = false;
    logger.info('Discovery service stopped');
  }

  /**
   * Publishes discovery information for a device based on RFXCOM payload
   */
  async publishDiscovery(payload: any): Promise<void> {
    if (!this.isStarted) {
      logger.warn('Discovery service not started, cannot publish discovery');
      return;
    }

    const settings = this.settingsService.get();
    if (!settings.homeassistant?.discovery) {
      logger.debug('Home Assistant discovery disabled');
      return;
    }

    logger.info(`Publishing discovery for device: ${payload.id}`);

    try {
      // Create or update device state
      const deviceStateStore = await this.createOrUpdateDeviceState(payload);

      // Generate and publish discovery messages
      await this.publishDeviceDiscovery(deviceStateStore);

      logger.debug(`Successfully published discovery for device: ${payload.id}`);
    } catch (error: any) {
      logger.error(`Failed to publish discovery for device ${payload.id}: ${error.message}`);
    }
  }

  /**
   * Creates or updates device state from RFXCOM payload
   */
  private async createOrUpdateDeviceState(payload: any): Promise<DeviceStateStore> {
    const deviceId = payload.id;
    const deviceName = `${payload.subTypeValue || 'unknown'}_${payload.id.replace('0x', '')}`;

    let deviceState;
    if (!this.deviceStore.exists(deviceId)) {
      // Create new device state
      deviceState = {
        id: deviceId,
        name: deviceName,
        originalName: deviceName,
        subtype: payload.subtype,
        subTypeValue: payload.subTypeValue,
        type: payload.type,
        entities: [],
        sensors: {},
        binarysensors: {},
        selects: {},
        covers: {},
        switchs: {}, // Use switchs for compatibility
        lastSeen: new Date().toISOString(),
        deviceName: payload.deviceName || deviceName,
        manufacturer: 'RFXCOM',
        via_device: 'rfxcom_bridge',
        identifiers: [deviceId],
      };
    } else {
      // Update existing device state
      deviceState = this.deviceStore.get(deviceId);
      deviceState.name = deviceName;
      deviceState.lastSeen = new Date().toISOString();

      // Initialize missing properties
      if (!deviceState.entities) deviceState.entities = [];
      if (!deviceState.sensors) deviceState.sensors = {};
      if (!deviceState.binarysensors) deviceState.binarysensors = {};
      if (!deviceState.selects) deviceState.selects = {};
      if (!deviceState.covers) deviceState.covers = {};
      if (!deviceState.switchs) deviceState.switchs = {};
    }

    const deviceStateStore = new DeviceStateStore(deviceState);

    // Add entity to the device
    const entityId = this.getEntityId(payload, deviceStateStore);
    this.stateStore.set(entityId, payload);

    if (!deviceState.entities.includes(entityId)) {
      deviceState.entities.push(entityId);
    }

    // Load discovery information for different entity types
    this.loadSensorInfo(payload, deviceStateStore);
    this.loadBinarySensorInfo(payload, deviceStateStore);
    this.loadSwitchInfo(payload, deviceStateStore);
    this.loadCoverInfo(payload, deviceStateStore);

    // Save updated device state
    this.deviceStore.set(deviceId, deviceState);

    return deviceStateStore;
  }

  /**
   * Gets entity ID for a payload
   */
  private getEntityId(payload: any, deviceStateStore: DeviceStateStore): string {
    let entityId = deviceStateStore.getId();

    if (payload.unitCode !== undefined && !payload.group) {
      entityId += `_${payload.unitCode}`;
    }

    if (payload.group) {
      entityId += '_group';
    }

    return entityId || '';
  }

  /**
   * Loads sensor information from payload
   */
  private loadSensorInfo(payload: any, deviceStateStore: DeviceStateStore): void {
    const deviceId = deviceStateStore.getId();
    const sensors: DeviceSensor[] = [];

    // Helper function to create sensor with required properties
    const createSensor = (
      id: string,
      name: string,
      description: string,
      property: string,
      type: string
    ): DeviceSensor => {
      const lookup = DEVICE_CLASS_LOOKUP[type] || {};
      return {
        id,
        name,
        description,
        property,
        type,
        unit_of_measurement: lookup.unit_of_measurement || '',
        icon: lookup.icon || 'mdi:gauge',
      };
    };

    // RSSI/Link Quality
    if (payload.rssi !== undefined) {
      sensors.push(
        createSensor(
          `${deviceId}_linkquality`,
          'Link Quality',
          'Link quality (signal strength)',
          'rssi',
          'linkquality'
        )
      );
    }

    // Battery Level
    if (payload.batteryLevel !== undefined) {
      sensors.push(
        createSensor(
          `${deviceId}_battery`,
          'Battery',
          'Remaining battery in %',
          'batteryLevel',
          'battery'
        )
      );
    }

    // Battery Voltage
    if (payload.batteryVoltage !== undefined) {
      sensors.push(
        createSensor(
          `${deviceId}_voltage`,
          'Voltage',
          'Battery voltage',
          'batteryVoltage',
          'battery_voltage'
        )
      );
    }

    // Temperature
    if (payload.temperature !== undefined) {
      sensors.push(
        createSensor(
          `${deviceId}_temperature`,
          'Temperature',
          'Measured temperature value',
          'temperature',
          'temperature'
        )
      );
    }

    // Humidity
    if (payload.humidity !== undefined) {
      sensors.push(
        createSensor(
          `${deviceId}_humidity`,
          'Humidity',
          'Measured relative humidity',
          'humidity',
          'humidity'
        )
      );
    }

    // Barometer/Pressure
    if (payload.barometer !== undefined) {
      sensors.push(
        createSensor(
          `${deviceId}_pressure`,
          'Pressure',
          'Atmospheric pressure',
          'barometer',
          'pressure'
        )
      );
    }

    // Power
    if (payload.power !== undefined) {
      sensors.push(
        createSensor(`${deviceId}_power`, 'Power', 'Power consumption', 'power', 'power')
      );
    }

    // Energy
    if (payload.energy !== undefined) {
      sensors.push(
        createSensor(`${deviceId}_energy`, 'Energy', 'Energy consumption', 'energy', 'energy')
      );
    }

    // UV
    if (payload.uv !== undefined) {
      sensors.push(createSensor(`${deviceId}_uv`, 'UV Index', 'UV radiation index', 'uv', 'uv'));
    }

    // Weight
    if (payload.weight !== undefined) {
      sensors.push(
        createSensor(`${deviceId}_weight`, 'Weight', 'Measured weight', 'weight', 'weight')
      );
    }

    // Count
    if (payload.count !== undefined) {
      sensors.push(createSensor(`${deviceId}_count`, 'Count', 'Counter value', 'count', 'count'));
    }

    // CO2
    if (payload.co2 !== undefined) {
      sensors.push(createSensor(`${deviceId}_co2`, 'CO2', 'CO2 concentration', 'co2', 'co2'));
    }

    // Add sensors to device state
    sensors.forEach(sensor => {
      deviceStateStore.state.sensors[sensor.id] = sensor;
    });
  }

  /**
   * Loads switch information from payload
   */
  private loadSwitchInfo(payload: any, deviceStateStore: DeviceStateStore): void {
    const lightingTypes = ['lighting1', 'lighting2', 'lighting3', 'lighting5', 'lighting6'];

    if (lightingTypes.includes(payload.type)) {
      const entityId = this.getEntityId(payload, deviceStateStore);
      let entityName = payload.id;
      let originalName = deviceStateStore.state.originalName || deviceStateStore.state.name;

      if (payload.unitCode !== undefined && !payload.group) {
        originalName += ` ${payload.unitCode}`;
        entityName += ` ${payload.unitCode}`;
      }

      let state_off = 'OFF';
      let state_on = 'ON';

      if (payload.group) {
        state_off = 'Group Off';
        state_on = 'Group On';
      }

      const switchInfo: DeviceSwitch = {
        id: entityId,
        name: entityName,
        originalName: originalName,
        unit: payload.unitCode || 1,
        value_on: state_on,
        value_off: state_off,
        description: `Switch for ${entityName}`,
        property: 'command',
        type: 'switch',
        group: payload.group || false,
      };

      deviceStateStore.state.switchs[entityId] = switchInfo;
    }
  }

  /**
   * Loads binary sensor information from payload
   */
  private loadBinarySensorInfo(payload: any, deviceStateStore: DeviceStateStore): void {
    if (payload.type === 'security1') {
      const entityId = this.getEntityId(payload, deviceStateStore);
      const entityName = payload.id;

      const binarySensor: DeviceBinarySensor = {
        id: entityId,
        name: entityName,
        description: `Motion sensor for ${entityName}`,
        property: 'deviceStatus',
        type: 'motion',
        value_on: true,
        value_off: false,
      };

      deviceStateStore.state.binarysensors[entityId] = binarySensor;
    }
  }

  /**
   * Loads cover information from payload
   */
  private loadCoverInfo(payload: any, deviceStateStore: DeviceStateStore): void {
    const coverTypes = ['blinds1', 'rfy'];

    if (coverTypes.includes(payload.type)) {
      const entityId = this.getEntityId(payload, deviceStateStore);
      const entityName = payload.id;

      const cover: DeviceCover = {
        id: entityId,
        name: entityName,
        description: `Cover for ${entityName}`,
        property: 'command',
        positionProperty: 'position',
        type: 'blind',
        unit_of_measurement: '',
        icon: 'mdi:window-shutter',
      };

      deviceStateStore.state.covers[entityId] = cover;
    }
  }

  /**
   * Publishes Home Assistant discovery messages for a device
   */
  private async publishDeviceDiscovery(deviceStateStore: DeviceStateStore): Promise<void> {
    const settings = this.settingsService.get();
    const bridgeName = settings.homeassistant?.discovery_device || 'rfxcom2mqtt';
    const baseTopic = this.mqttService.getBaseTopic();
    const discoveryTopic = settings.homeassistant?.discovery_topic || 'homeassistant';

    // Common configuration for all entities
    const commonConfig = {
      availability: [{ topic: `${baseTopic}/bridge/state` }],
      device: this.getDeviceInfo(deviceStateStore),
      origin: this.discoveryOrigin,
      json_attributes_topic: `${baseTopic}/devices/${deviceStateStore.getId()}`,
      state_topic: `${baseTopic}/devices/${deviceStateStore.getId()}`,
    };

    // Publish sensor discoveries
    await this.publishSensorDiscoveries(deviceStateStore, commonConfig, discoveryTopic, bridgeName);

    // Publish switch discoveries
    await this.publishSwitchDiscoveries(
      deviceStateStore,
      commonConfig,
      discoveryTopic,
      bridgeName,
      baseTopic
    );

    // Publish binary sensor discoveries
    await this.publishBinarySensorDiscoveries(
      deviceStateStore,
      commonConfig,
      discoveryTopic,
      bridgeName
    );

    // Publish cover discoveries
    await this.publishCoverDiscoveries(
      deviceStateStore,
      commonConfig,
      discoveryTopic,
      bridgeName,
      baseTopic
    );
  }

  /**
   * Gets device information for Home Assistant
   */
  private getDeviceInfo(deviceStateStore: DeviceStateStore): any {
    const state = deviceStateStore.state;
    return {
      identifiers: state.identifiers || [state.id],
      name: state.name,
      manufacturer: state.manufacturer || 'RFXCOM',
      model: state.subTypeValue || 'Unknown',
      via_device: state.via_device || 'rfxcom_bridge',
    };
  }

  /**
   * Publishes sensor discovery messages
   */
  private async publishSensorDiscoveries(
    deviceStateStore: DeviceStateStore,
    commonConfig: any,
    discoveryTopic: string,
    bridgeName: string
  ): Promise<void> {
    const sensors = deviceStateStore.state.sensors || {};

    for (const sensorId in sensors) {
      const sensor = sensors[sensorId];
      const discoveryPayload = {
        name: `${deviceStateStore.state.name} ${sensor.name}`,
        object_id: sensor.id,
        unique_id: `${sensor.id}_${bridgeName}`,
        value_template: `{{ value_json.${sensor.property} }}`,
        ...commonConfig,
        ...(DEVICE_CLASS_LOOKUP[sensor.type] || {}),
      };

      const topic = `${discoveryTopic}/sensor/${deviceStateStore.getId()}/${sensor.type}/config`;
      await this.publishDiscoveryMessage(topic, discoveryPayload);
    }
  }

  /**
   * Publishes switch discovery messages
   */
  private async publishSwitchDiscoveries(
    deviceStateStore: DeviceStateStore,
    commonConfig: any,
    discoveryTopic: string,
    bridgeName: string,
    baseTopic: string
  ): Promise<void> {
    const switches = deviceStateStore.state.switchs || {};

    for (const switchId in switches) {
      const switchInfo = switches[switchId];
      let entityTopic = deviceStateStore.getId();

      if (switchInfo.unit !== undefined && !switchInfo.group) {
        entityTopic += `/${switchInfo.unit}`;
      }

      const discoveryPayload = {
        availability: commonConfig.availability,
        device: commonConfig.device,
        enabled_by_default: true,
        payload_off: switchInfo.value_off,
        payload_on: switchInfo.value_on,
        json_attributes_topic: `${baseTopic}/devices/${entityTopic}`,
        command_topic: `${baseTopic}/cmd/${deviceStateStore.state.type}/${entityTopic}/set`,
        name: switchInfo.name,
        object_id: switchInfo.id,
        origin: commonConfig.origin,
        state_off: switchInfo.value_off,
        state_on: switchInfo.value_on,
        state_topic: `${baseTopic}/devices/${entityTopic}`,
        unique_id: `${switchInfo.id}_${bridgeName}`,
        value_template: `{{ value_json.${switchInfo.property} }}`,
      };

      const topic = `${discoveryTopic}/switch/${entityTopic}/config`;
      await this.publishDiscoveryMessage(topic, discoveryPayload);
    }
  }

  /**
   * Publishes binary sensor discovery messages
   */
  private async publishBinarySensorDiscoveries(
    deviceStateStore: DeviceStateStore,
    commonConfig: any,
    discoveryTopic: string,
    bridgeName: string
  ): Promise<void> {
    const binarySensors = deviceStateStore.state.binarysensors || {};

    for (const sensorId in binarySensors) {
      const binarySensor = binarySensors[sensorId];
      const discoveryPayload = {
        name: `${deviceStateStore.state.name} ${binarySensor.name}`,
        object_id: binarySensor.id,
        unique_id: `${binarySensor.id}_${bridgeName}`,
        payload_off: binarySensor.value_off || 'OFF',
        payload_on: binarySensor.value_on || 'ON',
        value_template: `{{ value_json.${binarySensor.property} }}`,
        device_class: binarySensor.type,
        ...commonConfig,
      };

      const topic = `${discoveryTopic}/binary_sensor/${deviceStateStore.getId()}/config`;
      await this.publishDiscoveryMessage(topic, discoveryPayload);
    }
  }

  /**
   * Publishes cover discovery messages
   */
  private async publishCoverDiscoveries(
    deviceStateStore: DeviceStateStore,
    commonConfig: any,
    discoveryTopic: string,
    bridgeName: string,
    baseTopic: string
  ): Promise<void> {
    const covers = deviceStateStore.state.covers || {};

    for (const coverId in covers) {
      const cover = covers[coverId];
      const discoveryPayload = {
        name: `${deviceStateStore.state.name} ${cover.name}`,
        object_id: cover.id,
        unique_id: `${cover.id}_${bridgeName}`,
        value_template: `{{ value_json.${cover.property} }}`,
        position_template: `{{ value_json.${cover.positionProperty} }}`,
        position_topic: `${baseTopic}/devices/${deviceStateStore.getId()}`,
        state_closing: 'DOWN',
        state_opening: 'UP',
        state_stopped: 'STOP',
        set_position_template: '{ "position": {{ position }} }',
        set_position_topic: `${baseTopic}/cmd/${deviceStateStore.state.type}/${deviceStateStore.getId()}/set`,
        device_class: 'blind',
        ...commonConfig,
      };

      const topic = `${discoveryTopic}/cover/${deviceStateStore.getId()}/config`;
      await this.publishDiscoveryMessage(topic, discoveryPayload);
    }
  }

  /**
   * Publishes a discovery message to MQTT
   */
  private async publishDiscoveryMessage(topic: string, payload: any): Promise<void> {
    try {
      await this.mqttService.publish(
        topic,
        JSON.stringify(payload),
        { retain: true, qos: 1 },
        false // Don't use base topic
      );
      logger.debug(`Published discovery message to: ${topic}`);
    } catch (error: any) {
      logger.error(`Failed to publish discovery message to ${topic}: ${error.message}`);
    }
  }

  /**
   * Unpublishes discovery information for a device
   */
  async unpublishDiscovery(deviceId: string): Promise<void> {
    if (!this.isStarted) {
      logger.warn('Discovery service not started, cannot unpublish discovery');
      return;
    }

    const settings = this.settingsService.get();
    if (!settings.homeassistant?.discovery) {
      logger.debug('Home Assistant discovery disabled');
      return;
    }

    logger.info(`Unpublishing discovery for device: ${deviceId}`);

    try {
      const discoveryTopic = settings.homeassistant?.discovery_topic || 'homeassistant';

      // Remove all discovery messages for this device
      const entityTypes = ['sensor', 'switch', 'binary_sensor', 'cover', 'select'];

      for (const entityType of entityTypes) {
        const topic = `${discoveryTopic}/${entityType}/${deviceId}/config`;
        await this.mqttService.publish(topic, '', { retain: true, qos: 1 }, false);
      }

      logger.debug(`Successfully unpublished discovery for device: ${deviceId}`);
    } catch (error: any) {
      logger.error(`Failed to unpublish discovery for device ${deviceId}: ${error.message}`);
    }
  }

  /**
   * Checks if the discovery service is running
   */
  isRunning(): boolean {
    return this.isStarted;
  }
}
