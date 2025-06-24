/**
 * DeviceStateStore class for managing device state operations
 */

import {
  DeviceState,
  DeviceSensor,
  DeviceBinarySensor,
  DeviceSwitch,
  DeviceCover,
  DeviceSelect,
} from '../types/devices';
import { SettingDevice } from '../types/settings';

const RFXCOM2MQTT_PREFIX = 'rfxcom2mqtt_';

export class DeviceStateStore {
  public state: DeviceState;

  constructor(state: DeviceState) {
    this.state = state;
  }

  getInfo(): any {
    const info = {
      manufacturer: 'Rfxcom',
      via_device: RFXCOM2MQTT_PREFIX + 'bridge',
      identifiers: [] as string[],
      name: this.state.name,
    };

    if (this.state.name !== this.state.originalName) {
      info.identifiers = [
        RFXCOM2MQTT_PREFIX + this.state.id,
        RFXCOM2MQTT_PREFIX + this.state.originalName,
        RFXCOM2MQTT_PREFIX + info.name,
      ];
    } else {
      info.identifiers = [
        RFXCOM2MQTT_PREFIX + this.state.id,
        RFXCOM2MQTT_PREFIX + this.state.originalName,
      ];
    }

    return info;
  }

  getId() {
    return this.state.id;
  }

  getEntityId(payload: any): any {
    let entityId = payload.subTypeValue + '_' + payload.id.replace('0x', '');
    if (payload.unitCode !== undefined && !payload.group) {
      entityId += '_' + payload.unitCode;
    }

    return entityId;
  }

  getCommandTopic(baseTopic: string, entityId: string) {
    let topicSufix = '';
    if (this.state.switchs[entityId] && this.state.switchs[entityId].unit !== undefined) {
      topicSufix = '/' + this.state.switchs[entityId].unit;
    }
    return (
      baseTopic + this.state.type + '/' + this.state.subtype + '/' + this.state.id + topicSufix
    );
  }

  getStateTopic(baseTopic: string, switchId?: string) {
    let topicSufix = '';
    if (
      switchId !== undefined &&
      this.state.switchs[switchId] &&
      this.state.switchs[switchId].unit !== undefined
    ) {
      topicSufix = '/' + this.state.switchs[switchId].unit;
    }
    return baseTopic + '/' + this.state.id + topicSufix;
  }

  addEntity(entityId: string) {
    if (!this.state.entities.includes(entityId)) {
      this.state.entities.push(entityId);
    }
  }

  addSensorId(sensorId: string) {
    this.addSensor({
      id: sensorId,
      name: sensorId,
      description: '',
      property: '',
      type: '',
      unit_of_measurement: '',
      icon: '',
    });
  }

  addSensor(sensor: DeviceSensor): DeviceSensor {
    if (this.state.sensors[sensor.id] === undefined) {
      this.state.sensors[sensor.id] = sensor;
    }
    return sensor;
  }

  getSensors(): { [s: string]: DeviceSensor } {
    return this.state.sensors;
  }

  addSwitchId(switchId: string) {
    this.addSwitch({
      id: switchId,
      name: switchId,
      originalName: switchId,
      unit: 0,
      value_on: 'On',
      value_off: 'Off',
      description: 'On/off state of the switch',
      property: 'command',
      type: 'binary',
      group: false,
    });
  }

  addSwitch(dswitch: DeviceSwitch) {
    if (this.state.switchs[dswitch.id] === undefined) {
      this.state.switchs[dswitch.id] = dswitch;
    }
  }

  getSwitchs(): { [s: string]: DeviceSwitch } {
    return this.state.switchs;
  }

  addBinarySensorId(sensorId: string) {
    this.addBinarySensor({
      id: sensorId,
      name: sensorId,
      description: '',
      property: '',
      type: '',
      value_on: true,
      value_off: false,
    });
  }

  addBinarySensor(sensor: DeviceBinarySensor): DeviceBinarySensor {
    if (this.state.binarysensors[sensor.id] === undefined) {
      this.state.binarysensors[sensor.id] = sensor;
    }
    return sensor;
  }

  getBinarySensors(): { [s: string]: DeviceBinarySensor } {
    return this.state.binarysensors;
  }

  addSelelectId(sensorId: string) {
    this.addSelect({
      id: sensorId,
      name: sensorId,
      description: '',
      property: '',
      type: '',
      options: [],
    });
  }

  addSelect(sensor: DeviceSelect): DeviceSelect {
    if (this.state.selects[sensor.id] === undefined) {
      this.state.selects[sensor.id] = sensor;
    }
    return sensor;
  }

  getSelects(): { [s: string]: DeviceSelect } {
    return this.state.selects;
  }

  addCoverId(sensorId: string) {
    this.addCover({
      id: sensorId,
      name: sensorId,
      description: '',
      property: '',
      positionProperty: '',
      type: '',
      unit_of_measurement: '',
      icon: '',
    });
  }

  addCover(sensor: DeviceCover): DeviceCover {
    if (this.state.covers[sensor.id] === undefined) {
      this.state.covers[sensor.id] = sensor;
    }
    return sensor;
  }

  getCovers(): { [s: string]: DeviceCover } {
    return this.state.covers;
  }

  overrideDeviceInfo(settingsService?: any) {
    if (!settingsService) return;

    const deviceConf = settingsService.get().devices.find((dev: any) => dev.id === this.state.id);

    if (deviceConf?.name !== undefined) {
      this.state.name = deviceConf.name;
    }

    for (const index in this.state.switchs) {
      const item = this.state.switchs[index];
      for (const indexU in deviceConf?.units) {
        const unit = deviceConf?.units[indexU];
        if (parseInt(unit.unitCode) === parseInt(item.unit + '')) {
          this.state.switchs[index].name = unit.name;
        }
      }
    }
  }
}
