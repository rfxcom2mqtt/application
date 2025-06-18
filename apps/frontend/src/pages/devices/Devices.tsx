import React from 'react';
import {
    Grid,
    Alert,
    Button,
    Chip,
    Stack,
} from '@mui/material';
import { Refresh, Add } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// Components
import DeviceCard from '../../components/common/DeviceCard';
import DeviceListItem from '../../components/common/DeviceListItem';
import DevicesControls from '../../components/common/DevicesControls';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import PageContainer from '../../components/common/PageContainer';

// Hooks
import { useDevices } from '../../hooks/useDevices';
import { useDeviceFilters } from '../../hooks/useDeviceFilters';

function DevicesPage() {
    const { t } = useTranslation();
    
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

    const pageActions = (
        <Stack direction="row" spacing={1}>
            <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={refresh}
                disabled={loading}
            >
                {t('common.refresh')}
            </Button>
            <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {/* TODO: Add device discovery */}}
            >
                {t('devices.discoverDevices')}
            </Button>
        </Stack>
    );

    if (loading) {
        return (
            <PageContainer
                title={t('devices.title')}
                subtitle={t('devices.subtitle')}
                actions={pageActions}
                loading={true}
            >
                <LoadingSkeleton />
            </PageContainer>
        );
    }

    return (
        <PageContainer
            title={t('devices.title')}
            subtitle={t('devices.subtitle')}
            actions={pageActions}
        >
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

            {/* Device Count & Status */}
            <Stack direction="row" spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
                <Alert severity="info" sx={{ flex: 1 }}>
                    {t('devices.foundDevices', { count: filteredDevices.length })}
                    {searchTerm && ` ${t('devices.matchingSearch', { searchTerm })}`}
                    {filterType !== 'all' && ` ${t('devices.ofType', { filterType })}`}
                </Alert>
                
                {/* Quick stats */}
                <Stack direction="row" spacing={1}>
                    <Chip 
                        label={`${t('common.total')}: ${devices.length}`} 
                        color="primary" 
                        variant="outlined" 
                        size="small"
                    />
                    <Chip 
                        label={`${t('common.online')}: ${devices.filter(d => d.status === 'online').length}`} 
                        color="success" 
                        variant="outlined" 
                        size="small"
                    />
                    <Chip 
                        label={`${t('common.offline')}: ${devices.filter(d => d.status === 'offline').length}`} 
                        color="error" 
                        variant="outlined" 
                        size="small"
                    />
                </Stack>
            </Stack>

            {/* Devices Grid/List */}
            {filteredDevices.length === 0 ? (
                <EmptyState 
                    searchTerm={searchTerm}
                    filterType={filterType}
                    onRefresh={refresh}
                    onClearFilters={() => {
                        setSearchTerm('');
                        setFilterType('all');
                    }}
                    onDiscoverDevices={() => {/* TODO: Add device discovery */}}
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
                <Stack spacing={2}>
                    {filteredDevices.map((device) => (
                        <DeviceListItem key={device.device} device={device} />
                    ))}
                </Stack>
            )}
        </PageContainer>
    );
}

export default DevicesPage;
