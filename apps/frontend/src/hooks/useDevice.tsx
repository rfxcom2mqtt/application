import React from 'react';
import { useParams } from 'react-router-dom';
import { DeviceInfo, KeyValue, DeviceSwitch, DeviceSensor } from '../models/shared';
import deviceApi from '../api/DeviceApi';

export function useDevice() {
  const { id } = useParams();
  const [device, setDevice] = React.useState<DeviceInfo>();
  const [state, setDeviceState] = React.useState<KeyValue[]>();
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const [deviceResponse, stateResponse] = await Promise.all([
        deviceApi.getDevice(id),
        deviceApi.getDeviceState(id),
      ]);
      setDevice(deviceResponse);
      setDeviceState(stateResponse);
    } catch (error) {
      console.error('Failed to fetch device data:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleSwitchAction = React.useCallback(
    (entity: DeviceSwitch, action: string) => {
      if (!id || !state) return;

      deviceApi.deviceAction(id, entity.id, action).then(() => {
        // Update local state optimistically
        const updatedState = [...state];
        for (const item of updatedState) {
          if (item.entityId === id) {
            item[entity.property] = action;
          }
        }
        setDeviceState(updatedState);
      });
    },
    [id, state]
  );

  const handleSensorRename = React.useCallback(
    (entity: DeviceSensor, name: string) => {
      if (id) {
        deviceApi.updateSensorName(id, entity.id, name).then(() => {
          refresh();
        });
      }
    },
    [id, refresh]
  );

  const handleSwitchRename = React.useCallback(
    (entity: DeviceSwitch, name: string) => {
      if (id) {
        deviceApi.updateSwitchName(id, entity, name).then(() => {
          refresh();
        });
      }
    },
    [id, refresh]
  );

  const handleDeviceRename = React.useCallback(
    (deviceName: string) => {
      if (id) {
        deviceApi.updateDeviceName(id, deviceName).then(() => {
          refresh();
        });
      }
    },
    [id, refresh]
  );

  const getEntityCount = React.useCallback(() => {
    if (!device) return 0;

    let count = 0;
    if (device.sensors) count += Object.keys(device.sensors).length;
    if (device.switchs) count += Object.keys(device.switchs).length;
    if (device.binarysensors) count += Object.keys(device.binarysensors).length;
    if (device.covers) count += Object.keys(device.covers).length;
    if (device.selects) count += Object.keys(device.selects).length;
    return count;
  }, [device]);

  const getEntityCounts = React.useCallback(() => {
    if (!device) {
      return {
        sensors: 0,
        switches: 0,
        binarySensors: 0,
        covers: 0,
        selects: 0,
        total: 0,
      };
    }

    const counts = {
      sensors: device.sensors ? Object.keys(device.sensors).length : 0,
      switches: device.switchs ? Object.keys(device.switchs).length : 0,
      binarySensors: device.binarysensors ? Object.keys(device.binarysensors).length : 0,
      covers: device.covers ? Object.keys(device.covers).length : 0,
      selects: device.selects ? Object.keys(device.selects).length : 0,
      total: 0,
    };

    counts.total =
      counts.sensors + counts.switches + counts.binarySensors + counts.covers + counts.selects;

    return counts;
  }, [device]);

  // Initial load
  React.useEffect(() => {
    if (id) {
      refresh();
    }
  }, [id]); // Remove refresh from dependencies to prevent infinite loop

  return {
    device,
    state,
    loading,
    refresh,
    handleSwitchAction,
    handleSensorRename,
    handleSwitchRename,
    handleDeviceRename,
    getEntityCount,
    getEntityCounts,
  };
}
