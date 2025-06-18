import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Alert,
} from '@mui/material';

// Components
import DeviceCard from '../../components/common/DeviceCard';
import DeviceListItem from '../../components/common/DeviceListItem';
import DevicesControls from '../../components/common/DevicesControls';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

// Hooks
import { useDevices } from '../../hooks/useDevices';
import { useDeviceFilters } from '../../hooks/useDeviceFilters';

function DevicesPage() {
    // Use custom hooks for data and filtering
    const { devices, loading, refresh, resetState, resetDevices } = useDevices();
    const {
        searchTerm,
        setSearchTerm,
        filterType,
        setFilterType,
        viewMode,
        toggleViewMode,
        filteredDevices,
        uniqueTypes,
    } = useDeviceFilters(devices);

    if (loading) {
        return <LoadingSkeleton />;
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Devices
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage and monitor your connected devices
                </Typography>
            </Box>

            {/* Controls */}
            <DevicesControls
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterType={filterType}
                onFilterChange={setFilterType}
                viewMode={viewMode}
                onViewModeChange={toggleViewMode}
                onRefresh={refresh}
                onResetState={resetState}
                onResetDevices={resetDevices}
                deviceTypes={uniqueTypes}
            />

            {/* Device Count */}
            <Box sx={{ mb: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                    Found {filteredDevices.length} device{filteredDevices.length !== 1 ? 's' : ''}
                    {searchTerm && ` matching "${searchTerm}"`}
                    {filterType !== 'all' && ` of type "${filterType}"`}
                </Alert>
            </Box>

            {/* Devices Grid/List */}
            {filteredDevices.length === 0 ? (
                <EmptyState 
                    searchTerm={searchTerm}
                    filterType={filterType}
                    onRefresh={refresh}
                />
            ) : viewMode === 'grid' ? (
                <Grid container spacing={3}>
                    {filteredDevices.map((device) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={device.device}>
                            <DeviceCard device={device} />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Box>
                    {filteredDevices.map((device) => (
                        <DeviceListItem key={device.device} device={device} />
                    ))}
                </Box>
            )}
        </Box>
    );
}

export default DevicesPage;
