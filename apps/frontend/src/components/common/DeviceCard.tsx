import React from 'react';
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Chip,
    Avatar,
    Box,
    Stack,
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface DeviceCardProps {
    device: {
        id: string;
        name: string;
        type: string;
        subtype?: string;
        unitCode?: string;
        status?: 'online' | 'offline' | 'unknown';
        entityCount?: number;
        lastSeen?: string;
    };
}

const DEVICE_ICONS: { [key: string]: string } = {
    'switch': '💡',
    'sensor': '🌡️',
    'cover': '🚪',
    'binary_sensor': '🔘',
    'select': '📋',
    'default': '📱'
};

const STATUS_COLORS = {
    'online': 'success' as const,
    'offline': 'error' as const,
    'unknown': 'warning' as const,
};

function DeviceCard({ device }: DeviceCardProps) {
    const navigate = useNavigate();

    const getDeviceIcon = (type: string) => {
        return DEVICE_ICONS[type.toLowerCase()] || DEVICE_ICONS.default;
    };

    const getStatusColor = (status: string) => {
        return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.unknown;
    };

    return (
        <Card 
            sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                borderRadius: 3,
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                },
                border: device.status === 'offline' ? '1px solid #f44336' : 'none',
            }}
        >
            <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {getDeviceIcon(device.type)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="h2" noWrap>
                            {device.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                            {device.id}
                        </Typography>
                    </Box>
                    <Chip 
                        label={device.status || 'unknown'} 
                        color={getStatusColor(device.status || 'unknown')}
                        size="small"
                        variant="outlined"
                    />
                </Box>

                {/* Device Info */}
                <Stack spacing={1}>
                    <DeviceInfoRow label="Type" value={device.type} />
                    {device.subtype && (
                        <DeviceInfoRow label="Subtype" value={device.subtype} />
                    )}
                    {device.unitCode && (
                        <DeviceInfoRow label="Unit Code" value={device.unitCode} />
                    )}
                    <DeviceInfoRow 
                        label="Entities" 
                        value={
                            <Chip 
                                label={device.entityCount || 0} 
                                size="small" 
                                color="primary"
                                variant="filled"
                            />
                        } 
                    />
                </Stack>

                {device.lastSeen && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Last seen: {device.lastSeen}
                    </Typography>
                )}
            </CardContent>

            <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/devices/${device.id}`)}
                    fullWidth
                    size="small"
                >
                    View Details
                </Button>
            </CardActions>
        </Card>
    );
}

interface DeviceInfoRowProps {
    label: string;
    value: React.ReactNode;
}

function DeviceInfoRow({ label, value }: DeviceInfoRowProps) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
                {label}:
            </Typography>
            {typeof value === 'string' ? (
                <Chip label={value} size="small" variant="outlined" />
            ) : (
                value
            )}
        </Box>
    );
}

export default DeviceCard;
