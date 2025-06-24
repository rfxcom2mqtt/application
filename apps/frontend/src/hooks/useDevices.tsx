import React from 'react';
import { KeyValue } from '../models/shared';
import deviceApi from '../api/DeviceApi';
import controllerApi from '../api/ControllerApi';

interface DeviceData {
  id: string;
  unitCode: string;
  type: string;
  device: string;
  subtype: string;
  name: string;
  manufacturer?: string;
  lastSeen?: string;
  status?: 'online' | 'offline' | 'unknown';
  entityCount?: number;
}

export function useDevices() {
  const [devicesState, setDevicesState] = React.useState<{ [s: string | number]: KeyValue }>();
  const [devices, setDevices] = React.useState<DeviceData[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await deviceApi.getDevices();
      setDevicesState(response);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetState = React.useCallback(async () => {
    try {
      await controllerApi.sendAction('reset_state');
      refresh();
    } catch (error) {
      console.error('Failed to reset state:', error);
    }
  }, [refresh]);

  const resetDevices = React.useCallback(async () => {
    try {
      await controllerApi.sendAction('reset_devices');
      refresh();
    } catch (error) {
      console.error('Failed to reset devices:', error);
    }
  }, [refresh]);

  // Transform devices state into device list
  React.useEffect(() => {
    if (!devicesState) return;

    const deviceList: DeviceData[] = [];
    let index = 1;

    for (const key in devicesState) {
      const deviceData = devicesState[key];
      const device: DeviceData = {
        id: deviceData['id'] || key,
        name: deviceData['name'] || `Device ${index}`,
        type: deviceData['type'] || 'Unknown',
        subtype: deviceData['subTypeValue'] || deviceData['subtype'] || '',
        device: deviceData['id'] || key,
        unitCode: deviceData['unitCode'] || '',
        manufacturer: deviceData['manufacturer'] || 'Unknown',
        status: Math.random() > 0.2 ? 'online' : 'offline', // Mock status
        entityCount: Math.floor(Math.random() * 10) + 1, // Mock entity count
        lastSeen: new Date(Date.now() - Math.random() * 86400000).toLocaleString(),
      };
      deviceList.push(device);
      index++;
    }

    setDevices(deviceList);
  }, [devicesState]);

  // Initial load
  React.useEffect(() => {
    refresh();
  }, []); // Remove refresh from dependencies to prevent infinite loop

  return {
    devices,
    loading,
    refresh,
    resetState,
    resetDevices,
  };
}
