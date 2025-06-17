export type WsMessage = {
    id: string;
    level: string;
    label: string;
    value: string;
    time: number;
};

export interface KeyValue {
    [s: string]: any;
}

export type Settings = {
    mock: boolean;
    loglevel: string;
    cacheState: {
        enable: boolean;
        saveInterval: number;
    };
    healthcheck: {
        enabled: boolean;
        cron: string;
    };
    homeassistant: SettingHass;
    devices: SettingDevice[];
    mqtt: SettingMqtt;
    rfxcom: SettingRfxcom;
    frontend: SettingFrontend;
};

export type SettingFrontend = {
    enabled: boolean;
    host: string;
    port: number;
    sslCert: string;
    sslKey: string;
};

export type SettingMqtt = {
    base_topic: string;
    include_device_information: boolean;
    retain: boolean;
    qos: 0 | 1 | 2;
    version?: 3 | 4 | 5;
    username?: string;
    password?: string;
    port?: string;
    server: string;
    key?: string;
    ca?: string;
    cert?: string;
    keepalive?: number;
    client_id?: string;
    reject_unauthorized?: boolean;
};

export type SettingHass = {
    discovery: boolean;
    discovery_topic: string;
    discovery_device: string;
};

export type SettingRfxcom = {
    usbport: string;
    debug: boolean;
    transmit: {
        repeat: number;
        lighting1: string[];
        lighting2: string[];
        lighting3: string[];
        lighting4: string[];
    };
    receive: string[];
};

export type SettingDevice = {
    id: string;
    name?: string;
    type?: string;
    subtype?: string;
    units?: Units[];
    options?: string[];
    repetitions?: number;
};

export type Units = {
    unitCode: string;
    name: string;
    friendlyName: string;
};

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

export class DeviceSensor {
    constructor(
        public id: string = '',
        public name: string = '',
        public description: string = '',
        public property: string = '',
        public type: string = '',
        public unit_of_measurement: string = '',
        public icon = '',
    ) {}
}

export class DeviceSwitch {
    constructor(
        public id: string = '',
        public name: string = '',
        public description: string = 'On/off state of the switch',
        public property: string = 'command',
        public type: string = 'binary',
        public unit: string = '',
        public value_off: string = 'Off',
        public value_on: string = 'On',
    ) {}
}

export class DeviceCover {
    constructor(
        public id: string = '',
        public name: string = '',
        public description: string = '',
        public property: string = '',
        public type: string = '',
        public unit_of_measurement: string = '',
        public icon = '',
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
        public value_off: boolean = false,
    ) {}
}

export class DeviceSelect {
    constructor(
        public id: string = '',
        public name: string = '',
        public description: string = '',
        public property: string = '',
        public type: string = '',
        public options: string[] = [],
    ) {}
}

export class DeviceInfo {
    manufacturer: string = 'Rfxcom';
    via_device: string = 'rfxcom2mqtt_bridge';
    identifiers: string[] = [];
    name: string = '';
    originalName?: string;
    id: string = '';
    type: string = '';
    subtype: number = 0;
    subTypeValue: string = '';
    entities: string[] = [];
    sensors: { [s: string]: DeviceSensor } = {};
    binarysensors: { [s: string]: DeviceBinarySensor } = {};
    selects: { [s: string]: DeviceSelect } = {};
    covers: { [s: string]: DeviceCover } = {};
    switchs: { [s: string]: DeviceSwitch } = {};
}
