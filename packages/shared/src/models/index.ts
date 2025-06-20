/**
 * Model classes for shared entities
 */

const RFXCOM2MQTT_PREFIX = 'rfxcom2mqtt_';

export class Action {
  constructor(
    public type: string = '',
    public action: string = '',
    public deviceId: string = '',
    public entityId: string = ''
  ) {}
}

export class DeviceEntity {
  public manufacturer: string = 'Rfxcom';
  public via_device: string = RFXCOM2MQTT_PREFIX + 'bridge';
  public identifiers: string[] = [];
  public id?: string;
  public name: string = '';
  public originalName?: string;

  constructor(id?: string, name?: string) {
    this.identifiers = [RFXCOM2MQTT_PREFIX + id, RFXCOM2MQTT_PREFIX + name];
    this.id = id;
    this.name = name ? name : '';
    this.originalName = name;
  }
}

export class DeviceSensor {
  constructor(
    public id: string = '',
    public name: string = '',
    public description: string = '',
    public property: string = '',
    public type: string = '',
    public unit_of_measurement: string = '',
    public icon: string = ''
  ) {}
}

export class DeviceBinarySensor {
  constructor(
    public id: string = '',
    public name: string = '',
    public description: string = '',
    public property: string = '',
    public type: string = '',
    public value_on: boolean = true,
    public value_off: boolean = false
  ) {}
}

export class DeviceSwitch {
  constructor(
    public id: string = '',
    public name: string = '',
    public originalName: string = '',
    public unit: number = 0,
    public value_on: string = 'On',
    public value_off: string = 'Off',
    public description: string = 'On/off state of the switch',
    public property: string = 'command',
    public type: string = 'binary',
    public group: boolean = false
  ) {}
}

export class DeviceCover {
  constructor(
    public id: string = '',
    public name: string = '',
    public description: string = '',
    public property: string = '',
    public positionProperty: string = '',
    public type: string = '',
    public unit_of_measurement: string = '',
    public icon: string = ''
  ) {}
}

export class DeviceSelect {
  constructor(
    public id: string = '',
    public name: string = '',
    public description: string = '',
    public property: string = '',
    public type: string = '',
    public options: string[] = []
  ) {}
}

export class DeviceState extends DeviceEntity {
  public type: string = '';
  public subtype: number = 0;
  public subTypeValue: string = '';
  entities: string[] = [];
  sensors: { [s: string]: DeviceSensor } = {};
  binarysensors: { [s: string]: DeviceBinarySensor } = {};
  selects: { [s: string]: DeviceSelect } = {};
  covers: { [s: string]: DeviceCover } = {};
  switchs: { [s: string]: DeviceSwitch } = {};

  constructor(id: string, name: string) {
    super(id, name);
  }
}

export class RfxcomInfo {
  receiverTypeCode: number = 0;
  receiverType: string = '';
  hardwareVersion: string = '';
  firmwareVersion: number = 0;
  firmwareType: string = '';
  enabledProtocols: string[] = [];
}

export class BridgeInfo {
  coordinator: RfxcomInfo = new RfxcomInfo();
  version: string = '';
  logLevel: string = '';
}

export class DeviceBridge {
  public model: string = 'Bridge';
  public name: string = 'Rfxcom2Mqtt Bridge';
  public manufacturer: string = 'Rfxcom2Mqtt';

  constructor(
    public identifiers: string[] = [],
    public hw_version: string = '',
    public sw_version: string = ''
  ) {}
}

export class EntityState {
  id: string = '';
  type: string = '';
  subtype: string = '';
}
