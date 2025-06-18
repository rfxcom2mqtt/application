import React from 'react';

interface DeviceData {
    id: string;
    name: string;
    type: string;
    device: string;
}

export function useDeviceFilters(devices: DeviceData[]) {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filterType, setFilterType] = React.useState<string>('all');
    const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

    const filteredDevices = React.useMemo(() => {
        return devices.filter((device) => {
            const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                device.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                device.device.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesFilter = filterType === 'all' || device.type.toLowerCase() === filterType.toLowerCase();
            
            return matchesSearch && matchesFilter;
        });
    }, [devices, searchTerm, filterType]);

    const uniqueTypes = React.useMemo(() => {
        return Array.from(new Set(devices.map(d => d.type)));
    }, [devices]);

    const toggleViewMode = React.useCallback(() => {
        setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
    }, []);

    return {
        searchTerm,
        setSearchTerm,
        filterType,
        setFilterType,
        viewMode,
        toggleViewMode,
        filteredDevices,
        uniqueTypes,
    };
}
