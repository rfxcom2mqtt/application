import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as rfxcom from 'rfxcom';
import { SettingsService } from '../../core/settings/settings.service';
import { logger } from '../../utils/logger';

export interface CommandPayload {
  subtype?: string;
  deviceFunction?: string;
  value?: string | number;
  deviceOptions?: string[];
  command?: string;
  blindsMode?: string;
}

export interface RfxcomEvent {
  type: string;
  subtype: number;
  id: string;
  deviceName?: string;
  group?: boolean;
  subTypeValue?: string;
  [key: string]: any;
}

export interface RfxcomInfo {
  receiverTypeCode: number;
  receiverType: string;
  hardwareVersion: string;
  firmwareVersion: number;
  firmwareType: string;
  enabledProtocols: string[];
}

export interface OnStatusCallback {
  (coordinatorInfo: RfxcomInfo): void;
}

export interface StatusCallback {
  (status: string): void;
}

export interface RfxcomEventHandler {
  (type: string, evt: RfxcomEvent): void;
}

/**
 * List of supported protocols for RFXCOM
 */
const SUPPORTED_PROTOCOLS = [
  'lighting1',
  'lighting2',
  'lighting3',
  'lighting4',
  'lighting5',
  'lighting6',
  'curtain1',
  'blinds1',
  'blinds2',
  'security1',
  'security2',
  'camera1',
  'remote',
  'thermostat1',
  'thermostat2',
  'thermostat3',
  'thermostat4',
  'bbq1',
  'temperaturerain1',
  'temperature1',
  'temperature2',
  'humidity1',
  'temperaturehumidity1',
  'temphumbarobaro1',
  'temphumbarobaro2',
  'rain1',
  'rain2',
  'rain3',
  'rain4',
  'rain5',
  'rain6',
  'rain7',
  'rain8',
  'rain9',
  'wind1',
  'wind2',
  'wind3',
  'wind4',
  'wind5',
  'wind6',
  'wind7',
  'uv1',
  'uv2',
  'uv3',
  'datetime',
  'elec1',
  'elec2',
  'elec3',
  'elec4',
  'elec5',
  'weight1',
  'weight2',
  'cartelectronic',
  'rfxsensor',
  'rfxmeter',
  'waterlevel',
  'lightning1',
  'lightning2',
  'lightning3',
  'lightning4',
  'lightning5',
  'lightning6',
  'lightning7',
  'funkbus',
  'edisio',
  'hunter',
  'activlink',
  'weather1',
  'weather2',
  'solar1',
  'solar2',
  'solar3',
  'solar4',
  'solar5',
  'solar6',
  'solar7',
];

@Injectable()
export class RfxcomService implements OnModuleInit, OnModuleDestroy {
  private rfxtrx?: rfxcom.RfxCom;
  private connected = false;
  private eventHandlers: RfxcomEventHandler[] = [];
  private statusCallbacks: OnStatusCallback[] = [];
  private disconnectCallbacks: ((evt: Record<string, unknown>) => void)[] = [];

  constructor(
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService
  ) {}

  async onModuleInit(): Promise<void> {
    // Initialize RFXCOM in background, don't block app startup
    this.initializeInBackground();
  }

  async onModuleDestroy(): Promise<void> {
    await this.stop();
  }

  /**
   * Initializes RFXCOM in background without blocking app startup
   */
  private initializeInBackground(): void {
    this.initialize().catch(error => {
      logger.warn(
        `RFXCOM initialization failed, app will continue without RFXCOM: ${error.message}`
      );
      // Schedule retry after 60 seconds
      setTimeout(() => {
        logger.info('Retrying RFXCOM initialization...');
        this.initializeInBackground();
      }, 60000);
    });
  }

  async initialize(): Promise<void> {
    if (this.connected) {
      logger.debug('RFXCOM already connected');
      return;
    }

    const config = this.getRfxcomConfig();

    // Handle mock mode
    if (config.usbport === 'mock') {
      logger.info('RFXCOM running in mock mode');
      this.connected = true;
      return;
    }

    logger.info(`Connecting to RFXCOM at ${config.usbport}`);

    return new Promise((resolve, reject) => {
      try {
        this.rfxtrx = new rfxcom.RfxCom(config.usbport, {
          debug: config.debug || false,
        });

        this.rfxtrx.initialise((error: Error | null) => {
          if (error) {
            logger.error(`Unable to initialise the RFXCOM device: ${error.message}`);
            this.connected = false;
            reject(new Error(`Unable to initialise the RFXCOM device: ${error.message}`));
          } else {
            logger.info('RFXCOM device initialised');
            this.connected = true;
            this.enableRFXProtocols();
            this.setupEventHandlers();
            resolve();
          }
        });
      } catch (error: any) {
        logger.error(`Failed to create RFXCOM instance: ${error.message}`);
        reject(error);
      }
    });
  }

  private getRfxcomConfig() {
    const settings = this.settingsService.get();
    return {
      usbport: this.configService.get<string>(
        'RFXCOM_USB_DEVICE',
        settings.rfxcom?.usbport || '/dev/ttyUSB0'
      ),
      debug: this.configService.get<boolean>('RFXCOM_DEBUG', settings.rfxcom?.debug || false),
      receive: settings.rfxcom?.receive || ['lighting1', 'lighting2', 'temperaturehumidity1'],
      transmit: settings.rfxcom?.transmit || {
        repeat: 1,
        lighting1: [],
        lighting2: [],
        lighting3: [],
        lighting4: [],
      },
    };
  }

  /**
   * Enables the configured RFXCOM protocols
   */
  private enableRFXProtocols(): void {
    if (!this.rfxtrx) {
      return;
    }

    const config = this.getRfxcomConfig();
    const receiveProtocols = config.receive || [];

    if (receiveProtocols.length === 0) {
      logger.warn('No RFXCOM protocols configured for receiving. Using default protocols.');
      receiveProtocols.push(
        'lighting1',
        'lighting2',
        'lighting3',
        'lighting4',
        'temperaturehumidity1'
      );
    }

    // Validate protocols against supported list
    const validProtocols = receiveProtocols.filter(protocol =>
      SUPPORTED_PROTOCOLS.includes(protocol.toLowerCase())
    );

    if (validProtocols.length !== receiveProtocols.length) {
      const invalidProtocols = receiveProtocols.filter(
        protocol => !SUPPORTED_PROTOCOLS.includes(protocol.toLowerCase())
      );
      logger.warn(`Some configured protocols are not supported: ${invalidProtocols.join(', ')}`);
      logger.info(`Using valid protocols: ${validProtocols.join(', ')}`);
    }

    this.rfxtrx.enableRFXProtocols(validProtocols, (evt: Record<string, unknown>) => {
      logger.info(`RFXCOM protocols enabled: ${validProtocols.join(', ')}`);
    });
  }

  /**
   * Sets up event handlers for RFXCOM events
   */
  private setupEventHandlers(): void {
    if (!this.rfxtrx) {
      return;
    }

    // Status events
    this.rfxtrx.on('status', (evt: Record<string, unknown>) => {
      const json = JSON.stringify(
        evt,
        (key, value) => {
          if (key === 'subtype' || key === 'seqnbr' || key === 'cmnd') {
            return undefined;
          }
          return value;
        },
        2
      );

      if (json !== undefined) {
        logger.debug(`RFXCOM status event: ${json}`);
        try {
          const parsedInfo = JSON.parse(json) as RfxcomInfo;
          this.statusCallbacks.forEach(callback => callback(parsedInfo));
        } catch (error) {
          logger.error(`Error parsing RFXCOM status: ${error}`);
        }
      }
    });

    // Disconnect events
    this.rfxtrx.on('disconnect', (evt: Record<string, unknown>) => {
      logger.info('RFXCOM Disconnected');
      this.connected = false;
      this.disconnectCallbacks.forEach(callback => callback(evt));
    });

    // Protocol events
    const config = this.getRfxcomConfig();
    if (config.receive) {
      config.receive.forEach((protocol: string) => {
        logger.info(`RFXCOM listening for protocol: ${protocol}`);
        this.rfxtrx!.on(protocol, (evt: RfxcomEvent, packetType: string) => {
          logger.debug(`Received ${protocol} event`);

          // Enrich event with additional information
          evt.type = protocol;
          evt.deviceName = (rfxcom as any).deviceNames?.[packetType]?.[evt.subtype];
          evt.group = this.isGroup(evt);
          evt.subTypeValue = this.getSubType(evt.type, evt.subtype.toString());

          // Handle special cases for device ID
          let deviceId = evt.id;
          if (evt.type === 'lighting4') {
            deviceId = (evt as any).data;
          }
          evt.id = deviceId;

          // Notify all event handlers
          this.eventHandlers.forEach(handler => handler(protocol, evt));
        });
      });
    }
  }

  /**
   * Determines if the event is a group command
   */
  isGroup(payload: RfxcomEvent): boolean {
    if (payload.type === 'lighting2') {
      return payload.commandNumber === 3 || payload.commandNumber === 4; // Group On/Off
    }
    if (payload.type === 'lighting1') {
      return payload.commandNumber === 5 || payload.commandNumber === 6; // Group On/Off
    }
    if (payload.type === 'lighting5') {
      return payload.commandNumber === 3 || payload.commandNumber === 4; // Group On/Off
    }
    if (payload.type === 'lighting6') {
      return payload.commandNumber === 2 || payload.commandNumber === 3; // Group On/Off
    }
    if (payload.type === 'blinds1') {
      return payload.commandNumber === 7; // Group commands for blinds
    }
    return false;
  }

  /**
   * Gets the subtype name from type and subtype number
   */
  getSubType(type: string, subType: string): string {
    let returnValue = '';
    try {
      if ((rfxcom as any).packetNames?.[type] !== undefined) {
        if ((rfxcom as any)[type] !== undefined) {
          Object.keys((rfxcom as any)[type]).forEach((subTypeName: string) => {
            if (parseInt(subType) === parseInt((rfxcom as any)[type][subTypeName])) {
              returnValue = subTypeName;
            }
          });
        }
      }
    } catch (error) {
      logger.debug(`Error getting subtype for ${type}.${subType}: ${error}`);
    }
    return returnValue;
  }

  /**
   * Gets the status of the RFXCOM device
   */
  async getStatus(): Promise<string> {
    if (!this.rfxtrx || !this.connected) {
      return 'offline';
    }

    return new Promise(resolve => {
      this.rfxtrx!.getRFXStatus((error: Error | null) => {
        if (error) {
          logger.error(`RFXCOM Status ERROR: ${error.message}`);
          resolve('offline');
        } else {
          resolve('online');
        }
      });
    });
  }

  /**
   * Registers a callback for status events
   */
  onStatus(callback: OnStatusCallback): void {
    this.statusCallbacks.push(callback);
    logger.debug('Added RFXCOM status callback');
  }

  /**
   * Registers a callback for disconnect events
   */
  onDisconnect(callback: (evt: Record<string, unknown>) => void): void {
    this.disconnectCallbacks.push(callback);
    logger.debug('Added RFXCOM disconnect callback');
  }

  /**
   * Subscribes to protocol events
   */
  subscribeProtocolsEvent(callback: RfxcomEventHandler): void {
    this.eventHandlers.push(callback);
    logger.debug('Added RFXCOM event handler');
  }

  /**
   * Sends a command to a device
   */
  async sendCommand(
    deviceType: string,
    entityName: string,
    payload: CommandPayload | string,
    deviceConf?: any
  ): Promise<void> {
    if (!this.connected) {
      logger.warn(`Cannot send RFXCOM command: device not connected`);
      return;
    }

    if (this.getRfxcomConfig().usbport === 'mock') {
      logger.info(`Mock RFXCOM command: ${deviceType}/${entityName} -> ${JSON.stringify(payload)}`);
      return;
    }

    try {
      await this.onCommand(deviceType, entityName, payload, deviceConf);
    } catch (error: any) {
      logger.error(`Failed to send RFXCOM command: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handles a command for a device
   */
  private async onCommand(
    deviceType: string,
    entityName: string,
    payload: CommandPayload | string,
    deviceConf?: any
  ): Promise<void> {
    try {
      const deviceTypeLower = deviceType?.toLowerCase();

      // Special handling for specific device types
      if (deviceTypeLower === 'rfy') {
        this.onCommandRfy(deviceType, entityName, payload, deviceConf);
        return;
      } else if (deviceTypeLower === 'blinds1') {
        this.onCommandBlinds(deviceType, entityName, payload, deviceConf);
        return;
      } else if (deviceTypeLower === 'lighting5') {
        this.onCommandLighting5(deviceType, entityName, payload, deviceConf);
        return;
      }

      // Default handling for other device types
      this.onCommandDefault(deviceType, entityName, payload, deviceConf);
    } catch (error) {
      logger.error(`Error processing command for ${deviceType}.${entityName}: ${error}`);
      throw error;
    }
  }

  /**
   * Default command handler for most device types
   */
  private onCommandDefault(
    deviceType: string,
    entityName: string,
    payload: CommandPayload | string,
    deviceConf?: any
  ): void {
    if (!this.rfxtrx) {
      throw new Error('RFXCOM not initialized');
    }

    try {
      // Validate device type
      if (!this.validRfxcomDevice(deviceType)) {
        throw new Error(`${deviceType} is not a valid RFXCOM device type`);
      }

      // Handle string vs object payload
      let payloadObj: CommandPayload;
      if (typeof payload === 'string') {
        try {
          payloadObj = JSON.parse(payload) as CommandPayload;
        } catch (error) {
          throw new Error(`Payload is not a valid JSON format: ${payload}`);
        }
      } else {
        payloadObj = payload;
      }

      // Get subtype from payload or config
      const subtype = payloadObj.subtype || deviceConf?.subtype || '';
      if (!subtype) {
        throw new Error(`Subtype not defined in payload or config for ${deviceType}`);
      }

      // Get device function from payload
      const deviceFunction = payloadObj.deviceFunction || payloadObj.command || '';
      if (!deviceFunction) {
        throw new Error(`No device function specified for ${deviceType}`);
      }

      // Validate device function
      if (!this.validRfxcomDeviceFunction(deviceType, deviceFunction)) {
        throw new Error(`${deviceFunction} is not a valid function for device type ${deviceType}`);
      }

      // Get value and options from payload
      const value = payloadObj.value;
      const deviceOptions = payloadObj.deviceOptions || deviceConf?.options;

      // Apply device configuration if available
      if (deviceConf?.id) {
        entityName = deviceConf.id;
      }

      // Instantiate the device class
      let device;
      if (deviceOptions) {
        device = new (rfxcom as any)[deviceType](this.rfxtrx, subtype, deviceOptions);
      } else {
        device = new (rfxcom as any)[deviceType](this.rfxtrx, subtype);
      }

      // Determine number of repetitions
      const repeat = deviceConf?.repetitions || this.getRfxcomConfig().transmit?.repeat || 1;

      // Execute the command the specified number of times
      for (let i = 0; i < repeat; i++) {
        if (value !== undefined) {
          device[deviceFunction](entityName, value);
        } else {
          device[deviceFunction](entityName);
        }

        logger.debug(
          `${deviceType} ${entityName} - Function: ${deviceFunction}${value !== undefined ? `, Value: ${value}` : ''} (Repetition ${i + 1}/${repeat})`
        );
      }

      logger.info(
        `Sent ${deviceType} command '${deviceFunction}' to ${entityName}${value !== undefined ? ` with value: ${value}` : ''}${repeat > 1 ? ` (${repeat} repetitions)` : ''}`
      );
    } catch (error) {
      logger.error(`Error processing command for ${deviceType}.${entityName}: ${error}`);
      throw error;
    }
  }

  /**
   * Handles RFY (Somfy) commands
   */
  private onCommandRfy(
    deviceType: string,
    entityName: string,
    payload: CommandPayload | string,
    deviceConf?: any
  ): void {
    if (!this.rfxtrx) {
      throw new Error('RFXCOM not initialized');
    }

    logger.debug(`RFY command: ${deviceType}.${entityName} -> ${JSON.stringify(payload)}`);

    const deviceIds = deviceConf ? [deviceConf.id] : entityName.split(',');

    deviceIds.forEach(deviceId => {
      try {
        const payloadObj = typeof payload === 'string' ? JSON.parse(payload) : payload;
        const blindsMode = deviceConf?.blindsMode || payloadObj.blindsMode || 'EU';
        const subtype = deviceConf?.subtype || payloadObj.subtype || 'RFY';

        const rfy = new (rfxcom as any).Rfy(this.rfxtrx, subtype, {
          venetianBlindsMode: blindsMode,
        });

        logger.info(`Send RFY command '${payloadObj.command}' to deviceid: ${deviceId}`);
        rfy.doCommand([deviceId, '1'], payloadObj.command);
      } catch (error) {
        logger.error(`Error processing RFY command for ${deviceId}: ${error}`);
        throw error;
      }
    });
  }

  /**
   * Handles Blinds1 commands
   */
  private onCommandBlinds(
    deviceType: string,
    entityName: string,
    payload: CommandPayload | string,
    deviceConf?: any
  ): void {
    if (!this.rfxtrx) {
      throw new Error('RFXCOM not initialized');
    }

    logger.debug(`Blinds command: ${deviceType}.${entityName} -> ${JSON.stringify(payload)}`);

    try {
      const payloadObj = typeof payload === 'string' ? JSON.parse(payload) : payload;
      const subtype = deviceConf?.subtype || payloadObj.subtype;

      if (!subtype) {
        throw new Error('Blinds1 subtype not defined in payload or config');
      }

      const blinds = new (rfxcom as any).Blinds1(this.rfxtrx, subtype);
      const deviceId = deviceConf?.id || entityName;
      const command = payloadObj.command;

      if (!command) {
        throw new Error('Command not specified in payload');
      }

      logger.info(`Send Blinds1 command '${command}' to deviceid: ${deviceId}`);

      if (blinds[command]) {
        blinds[command](deviceId);
      } else {
        throw new Error(`Unknown Blinds1 command: ${command}`);
      }
    } catch (error) {
      logger.error(`Error processing Blinds1 command: ${error}`);
      throw error;
    }
  }

  /**
   * Handles Lighting5 commands
   */
  private onCommandLighting5(
    deviceType: string,
    entityName: string,
    payload: CommandPayload | string,
    deviceConf?: any
  ): void {
    if (!this.rfxtrx) {
      throw new Error('RFXCOM not initialized');
    }

    logger.debug(`Lighting5 command: ${deviceType}.${entityName} -> ${JSON.stringify(payload)}`);

    try {
      const payloadObj = typeof payload === 'string' ? JSON.parse(payload) : payload;
      const subtype = deviceConf?.subtype || payloadObj.subtype;

      if (!subtype) {
        throw new Error('Lighting5 subtype not defined in payload or config');
      }

      const lighting5 = new (rfxcom as any).Lighting5(this.rfxtrx, subtype);
      const deviceId = deviceConf?.id || entityName;
      const command = payloadObj.deviceFunction || payloadObj.command;
      const value = payloadObj.value;

      if (!command) {
        throw new Error('Command not specified in payload');
      }

      logger.info(
        `Send Lighting5 command '${command}' to deviceid: ${deviceId}${value ? ` with value: ${value}` : ''}`
      );

      if (value !== undefined) {
        lighting5[command](deviceId, value);
      } else {
        lighting5[command](deviceId);
      }
    } catch (error) {
      logger.error(`Error processing Lighting5 command: ${error}`);
      throw error;
    }
  }

  /**
   * Validates if a device type is supported by RFXCOM
   */
  private validRfxcomDevice(device: string): boolean {
    return Object.keys(rfxcom).includes(device);
  }

  /**
   * Validates if a device function is supported by the device type
   */
  private validRfxcomDeviceFunction(device: string, deviceFunction: string): boolean {
    if (!(rfxcom as any)[device]) {
      return false;
    }

    const deviceFunctions = Object.getOwnPropertyNames((rfxcom as any)[device].prototype);
    return deviceFunctions.includes(deviceFunction);
  }

  /**
   * Checks if RFXCOM is connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  async stop(): Promise<void> {
    if (this.rfxtrx && this.connected) {
      logger.info('Disconnecting from RFXCOM');
      this.rfxtrx.close();
      this.connected = false;
    }
  }
}
