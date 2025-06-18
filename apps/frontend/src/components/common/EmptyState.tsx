import React from 'react';
import {
    Box,
    Typography,
    Button,
} from '@mui/material';
import { DeviceHub, Refresh } from '@mui/icons-material';

interface EmptyStateProps {
    searchTerm?: string;
    filterType?: string;
    onRefresh?: () => void;
}

function EmptyState({ searchTerm, filterType, onRefresh }: EmptyStateProps) {
    const hasFilters = searchTerm || (filterType && filterType !== 'all');
    
    return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
            <DeviceHub sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
                No devices found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {hasFilters 
                    ? 'Try adjusting your search or filter criteria'
                    : 'No devices have been discovered yet'
                }
            </Typography>
            {!hasFilters && onRefresh && (
                <Button variant="contained" startIcon={<Refresh />} onClick={onRefresh}>
                    Refresh Devices
                </Button>
            )}
        </Box>
    );
}

export default EmptyState;
