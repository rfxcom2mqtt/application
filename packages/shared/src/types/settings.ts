/**
 * Settings and configuration types
 */

export interface Settings {
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
}

export interface SettingFrontend {
  enabled: boolean;
  host: string;
  port: number;
  sslCert: string;
  sslKey: string;
}

export interface SettingMqtt {
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
}

export interface SettingHass {
  discovery: boolean;
  discovery_topic: string;
  discovery_device: string;
}

export interface SettingRfxcom {
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
}

export interface SettingDevice {
  id: string;
  name?: string;
  type?: string;
  subtype?: string;
  units?: Units[];
  options?: string[];
  repetitions?: number;
}

export interface Units {
  unitCode: string;
  name: string;
  friendlyName: string;
}
