import React from 'react';
import {
    Paper,
    Box,
    Avatar,
    Typography,
    Chip,
    Stack,
    IconButton,
    Tooltip,
    Breadcrumbs,
    Link,
} from '@mui/material';
import {
    Edit,
    Refresh,
    ArrowBack,
    DeviceHub,
    Memory,
    Router,
    SignalWifi4Bar,
    Category,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface DeviceHeaderProps {
    device: {
        id: string;
        name: string;
        type: string;
        originalName?: string;
    };
    entityCount: number;
    onRename: () => void;
    onRefresh: () => void;
}

const DEVICE_ICONS = {
    'switch': <Memory />,
    'sensor': <DeviceHub />,
    'cover': <Router />,
    'binary_sensor': <SignalWifi4Bar />,
    'select': <Category />,
    'default': <DeviceHub />
};

function DeviceHeader({ device, entityCount, onRename, onRefresh }: DeviceHeaderProps) {
    const navigate = useNavigate();

    const getDeviceIcon = (type?: string) => {
        return DEVICE_ICONS[type?.toLowerCase() as keyof typeof DEVICE_ICONS] || DEVICE_ICONS.default;
    };

    return (
        <>
            {/* Breadcrumbs */}
            <Breadcrumbs sx={{ mb: 3 }}>
                <Link
                    component="button"
                    variant="body1"
                    onClick={() => navigate('/devices')}
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    <DeviceHub sx={{ mr: 0.5, fontSize: 20 }} />
                    Devices
                </Link>
                <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                    {device.name}
                </Typography>
            </Breadcrumbs>

            {/* Header */}
            <Paper sx={{ p: 3, mb: 3, background: '#667eea', borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
                    <Avatar sx={{ mr: 3, bgcolor: 'rgba(255,255,255,0.2)', width: 64, height: 64 }}>
                        {getDeviceIcon(device.type)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'white' }}>
                            {device.name}
                            <Tooltip title="Rename device">
                                <IconButton onClick={onRename} sx={{ ml: 1, color: 'white' }}>
                                    <Edit />
                                </IconButton>
                            </Tooltip>
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9, color: 'white' }}>
                            {device.id}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <Chip 
                                label="Online" 
                                color="success" 
                                size="small" 
                                sx={{ bgcolor: 'rgba(76, 175, 80, 0.8)', color: 'white' }}
                            />
                            <Chip 
                                label={`${entityCount} entities`} 
                                size="small" 
                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                            />
                            <Chip 
                                label={device.type} 
                                size="small" 
                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                            />
                        </Stack>
                    </Box>
                    <Stack spacing={1}>
                        <Tooltip title="Refresh device data">
                            <IconButton onClick={onRefresh} sx={{ color: 'white' }}>
                                <Refresh />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Go back">
                            <IconButton onClick={() => navigate('/devices')} sx={{ color: 'white' }}>
                                <ArrowBack />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Box>
            </Paper>
        </>
    );
}

export default DeviceHeader;
