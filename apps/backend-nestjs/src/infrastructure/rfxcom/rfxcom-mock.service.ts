import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { logger } from '../../utils/logger';
import {
  RfxcomService,
  RfxcomEvent,
  RfxcomInfo,
  CommandPayload,
  OnStatusCallback,
  RfxcomEventHandler,
} from './rfxcom.service';
import { SettingsService } from '../../core/settings/settings.service';

// Define specific event interfaces for mock data
interface Lighting2Event extends RfxcomEvent {
  unitCode: string;
  commandNumber: number;
  command: string;
  level: number;
}

interface Lighting1Event extends RfxcomEvent {
  houseCode: string;
  unitCode: string;
  commandNumber: number;
  command: string;
}

interface Lighting5Event extends RfxcomEvent {
  unitCode: string;
  commandNumber: number;
  command: string;
  level: string;
}

interface Blinds1Event extends RfxcomEvent {
  unitCode: number;
  commandNumber: number;
  command: string;
  batteryLevel: number;
}

interface Security1Event extends RfxcomEvent {
  deviceStatus: string;
  tampered: string;
  batteryLevel: string;
}

interface TemphumbaroEvent extends RfxcomEvent {
  temperature: string;
  humidity: string;
  humidityStatus: string;
  barometer: string;
  forecast: string;
  batteryLevel: number;
}

interface TemphumidityEvent extends RfxcomEvent {
  temperature: string;
  humidity: string;
  humidityStatus: string;
  batteryLevel: number;
}

interface TempEvent extends RfxcomEvent {
  temperature: string;
  batteryLevel: number;
}

interface Bbq1Event extends RfxcomEvent {
  temperature: string;
  batteryLevel: number;
}

interface HumidityEvent extends RfxcomEvent {
  humidity: string;
  humidityStatus: string;
  batteryLevel: number;
}

interface UvEvent extends RfxcomEvent {
  temperature: string;
  uv: number;
  batteryLevel: number;
}

interface WeightEvent extends RfxcomEvent {
  weight: number;
  batteryLevel: number;
}

interface WaterlevelEvent extends RfxcomEvent {
  temperature: string;
  level: number;
  batteryLevel: number;
}

interface Lighting4Event extends RfxcomEvent {
  data: string;
}

@Injectable()
export class RfxcomMockService extends RfxcomService {
  private mockEvents: RfxcomEvent[] = [];

  constructor(configService: ConfigService, settingsService: SettingsService) {
    super(configService, settingsService);
    this.initializeMockEvents();
  }

  /**
   * Initialize mock events for testing
   */
  private initializeMockEvents(): void {
    // Lighting2 events
    this.mockEvents.push({
      id: '0x011Bmocked_device2',
      seqnbr: 7,
      subtype: 0,
      unitCode: '1',
      commandNumber: 0,
      command: 'Off',
      level: 0,
      rssi: 5,
      type: 'lighting2',
      subTypeValue: 'AC',
    } as Lighting2Event);

    this.mockEvents.push({
      id: '0x011Bmocked_device2',
      seqnbr: 7,
      subtype: 0,
      unitCode: '2',
      commandNumber: 1,
      command: 'On',
      level: 0,
      rssi: 5,
      type: 'lighting2',
      subTypeValue: 'AC',
    } as Lighting2Event);

    // Lighting1 events
    this.mockEvents.push({
      id: '0x011Cmocked_lighting1',
      seqnbr: 8,
      subtype: 0,
      houseCode: 'A',
      unitCode: '1',
      commandNumber: 0,
      command: 'Off',
      rssi: 5,
      type: 'lighting1',
      subTypeValue: 'X10',
    } as Lighting1Event);

    this.mockEvents.push({
      id: '0x011Cmocked_lighting1',
      seqnbr: 9,
      subtype: 0,
      houseCode: 'A',
      unitCode: '2',
      commandNumber: 1,
      command: 'On',
      rssi: 5,
      type: 'lighting1',
      subTypeValue: 'X10',
    } as Lighting1Event);

    // Lighting5 events
    this.mockEvents.push({
      id: '0x011Dmocked_lighting5',
      seqnbr: 10,
      subtype: 0,
      unitCode: '1',
      commandNumber: 0,
      command: 'Off',
      level: '0',
      rssi: 5,
      type: 'lighting5',
      subTypeValue: 'LIGHTWAVERF',
    } as Lighting5Event);

    this.mockEvents.push({
      id: '0x011Dmocked_lighting5',
      seqnbr: 11,
      subtype: 0,
      unitCode: '2',
      commandNumber: 1,
      command: 'On',
      level: '15',
      rssi: 5,
      type: 'lighting5',
      subTypeValue: 'LIGHTWAVERF',
    } as Lighting5Event);

    // Blinds1 events
    this.mockEvents.push({
      id: '0x011Emocked_blinds1',
      seqnbr: 12,
      subtype: 0,
      unitCode: 1,
      commandNumber: 0,
      command: 'Open',
      batteryLevel: 100,
      rssi: 5,
      type: 'blinds1',
      subTypeValue: 'BLINDST0',
    } as Blinds1Event);

    this.mockEvents.push({
      id: '0x011Emocked_blinds1',
      seqnbr: 13,
      subtype: 0,
      unitCode: 2,
      commandNumber: 1,
      command: 'Close',
      batteryLevel: 100,
      rssi: 5,
      type: 'blinds1',
      subTypeValue: 'BLINDST0',
    } as Blinds1Event);

    // Security1 events
    this.mockEvents.push({
      id: '0x011Fmocked_security1',
      seqnbr: 14,
      subtype: 0,
      deviceStatus: 'Normal',
      tampered: 'No',
      batteryLevel: '100',
      rssi: 5,
      type: 'security1',
      subTypeValue: 'X10_SECURITY',
    } as Security1Event);

    this.mockEvents.push({
      id: '0x011Fmocked_security1',
      seqnbr: 15,
      subtype: 0,
      deviceStatus: 'Alert',
      tampered: 'Yes',
      batteryLevel: '50',
      rssi: 5,
      type: 'security1',
      subTypeValue: 'X10_SECURITY',
    } as Security1Event);

    // Temperature and sensor events
    this.mockEvents.push({
      id: 'temphumbaro_device',
      seqnbr: 1,
      subtype: 1,
      temperature: '19',
      humidity: '60',
      humidityStatus: 'Off',
      barometer: '1040',
      forecast: '',
      batteryLevel: 100,
      rssi: 5,
      type: 'tempHumBaro1',
    } as TemphumbaroEvent);

    this.mockEvents.push({
      id: 'temphum_device',
      seqnbr: 1,
      subtype: 1,
      temperature: '19',
      humidity: '60',
      humidityStatus: 'Off',
      batteryLevel: 100,
      rssi: 5,
      type: 'temperatureHumidity1',
    } as TemphumidityEvent);

    this.mockEvents.push({
      id: 'temp_device',
      seqnbr: 1,
      subtype: 1,
      temperature: '19',
      batteryLevel: 100,
      rssi: 5,
      type: 'temperature1',
    } as TempEvent);

    this.mockEvents.push({
      id: 'bbq1_device',
      seqnbr: 1,
      subtype: 1,
      temperature: '19',
      batteryLevel: 100,
      rssi: 5,
      type: 'bbq1',
    } as Bbq1Event);

    this.mockEvents.push({
      id: 'uv1_device',
      seqnbr: 1,
      subtype: 1,
      temperature: '19',
      uv: 2,
      batteryLevel: 100,
      rssi: 5,
      type: 'uv1',
    } as UvEvent);

    this.mockEvents.push({
      id: 'hum_device',
      seqnbr: 1,
      subtype: 1,
      humidity: '60',
      humidityStatus: 'Off',
      batteryLevel: 100,
      rssi: 5,
      type: 'humidity1',
    } as HumidityEvent);

    this.mockEvents.push({
      id: 'weight_device',
      seqnbr: 1,
      subtype: 1,
      weight: 60,
      batteryLevel: 100,
      rssi: 5,
      type: 'weight1',
    } as WeightEvent);

    this.mockEvents.push({
      id: 'waterlevel_device',
      seqnbr: 1,
      subtype: 0,
      temperature: '10',
      level: 50,
      batteryLevel: 100,
      rssi: 5,
      type: 'waterlevel',
    } as WaterlevelEvent);

    logger.info(`Mock RFXCOM initialized with ${this.mockEvents.length} test events`);
  }

  /**
   * Mock initialization - always succeeds
   */
  async initialize(): Promise<void> {
    logger.info('Mock RFXCOM device initialized');
    return Promise.resolve();
  }

  /**
   * Mock status check - always returns online
   */
  async getStatus(): Promise<string> {
    logger.debug('Mock RFXCOM status check');
    return Promise.resolve('online');
  }

  /**
   * Mock status info - returns mock device information
   */
  onStatus(callback: OnStatusCallback): void {
    logger.debug('Mock RFXCOM status info requested');

    const mockInfo: RfxcomInfo = {
      receiverTypeCode: 83,
      receiverType: 'Mock',
      hardwareVersion: '1.2',
      firmwareVersion: 242,
      firmwareType: 'Ext',
      enabledProtocols: [
        'LIGHTING1',
        'LIGHTING2',
        'LIGHTING3',
        'LIGHTING4',
        'LIGHTING5',
        'LIGHTING6',
        'BLINDS1',
        'SECURITY1',
        'TEMPERATURE1',
        'TEMPERATUREHUMIDITY1',
        'TEMPHUMBAROBARO1',
        'HUMIDITY1',
        'BBQ1',
        'UV1',
        'WEIGHT1',
        'WATERLEVEL',
        'LACROSSE',
        'AC',
        'OREGON',
        'HOMECONFORT',
      ],
    };

    callback(mockInfo);
  }

  /**
   * Mock command handling - logs commands but doesn't execute them
   */
  async sendCommand(
    deviceType: string,
    entityName: string,
    payload: CommandPayload | string,
    deviceConf?: any
  ): Promise<void> {
    logger.info(`Mock RFXCOM command received: ${deviceType} - ${entityName}`);

    // Log the payload for debugging
    if (typeof payload === 'string') {
      try {
        const parsedPayload = JSON.parse(payload);
        logger.debug(`Command payload: ${JSON.stringify(parsedPayload)}`);
      } catch (error) {
        logger.debug(`Command payload (raw): ${payload}`);
      }
    } else {
      logger.debug(`Command payload: ${JSON.stringify(payload)}`);
    }

    // Log device config if available
    if (deviceConf) {
      logger.debug(`Device config: ${JSON.stringify(deviceConf)}`);
    }

    // Simulate command execution delay
    return new Promise(resolve => {
      setTimeout(() => {
        logger.debug(`Mock command executed for ${deviceType}.${entityName}`);
        resolve();
      }, 100);
    });
  }

  /**
   * Mock disconnect handler
   */
  onDisconnect(callback: (evt: Record<string, unknown>) => void): void {
    logger.debug('Mock RFXCOM disconnect handler registered');
    // In mock mode, we never actually disconnect
    // But we register the callback for consistency
  }

  /**
   * Mock protocol event subscription - emits all mock events
   */
  subscribeProtocolsEvent(callback: RfxcomEventHandler): void {
    logger.info('Mock RFXCOM protocol events subscription started');

    // Emit all mock events with a small delay to simulate real events
    this.mockEvents.forEach((event, index) => {
      setTimeout(() => {
        // Add group detection
        event.group = this.isGroup(event);

        // Get device ID
        let deviceId = event.id;
        if (event.type === 'lighting4') {
          deviceId = (event as Lighting4Event).data;
        }

        logger.debug(`Emitting mock event: ${event.type} - ${deviceId}`);
        callback(event.type, event);
      }, index * 1000); // Emit events 1 second apart
    });
  }

  /**
   * Mock stop - just logs
   */
  async stop(): Promise<void> {
    logger.info('Mock RFXCOM stopped');
    return Promise.resolve();
  }

  /**
   * Mock get subtype - returns mock subtype names
   */
  getSubType(type: string, subType: string): string {
    logger.debug(`Mock get subtype: ${type}.${subType}`);

    // Return mock subtype names based on type
    const mockSubTypes: Record<string, Record<string, string>> = {
      lighting1: { '0': 'X10' },
      lighting2: { '0': 'AC' },
      lighting5: { '0': 'LIGHTWAVERF' },
      blinds1: { '0': 'BLINDST0' },
      security1: { '0': 'X10_SECURITY' },
      temperaturehumidity1: { '1': 'THGN122N' },
      temperature1: { '1': 'THR128' },
      humidity1: { '1': 'LaCrosse_TX3' },
      tempHumBaro1: { '1': 'BTHR918N' },
      bbq1: { '1': 'MAVERICK_ET732' },
      uv1: { '1': 'UVN128' },
      weight1: { '1': 'BWR102' },
      waterlevel: { '0': 'ALECTO_WS1200' },
    };

    return mockSubTypes[type]?.[subType] || 'UNKNOWN';
  }
}
