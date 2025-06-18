import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    IconButton,
    Tooltip,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import { 
    Visibility, 
    MoreVert, 
    PowerSettingsNew, 
    Refresh, 
    Edit, 
    Delete,
    SignalWifi4Bar,
    SignalWifiOff,
} from '@mui/icons-material';
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
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

    const getDeviceIcon = (type: string) => {
        return DEVICE_ICONS[type.toLowerCase()] || DEVICE_ICONS.default;
    };

    const getStatusColor = (status: string) => {
        return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.unknown;
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setMenuAnchor(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
    };

    const handleQuickAction = (action: string) => {
        handleMenuClose();
        // TODO: Implement quick actions
        console.log(`Quick action: ${action} for device ${device.id}`);
    };

    return (
        <Card 
            sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                position: 'relative',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.shadows[8],
                },
                border: device.status === 'offline' ? '2px solid' : '1px solid',
                borderColor: device.status === 'offline' ? 'error.main' : 'divider',
            }}
            onClick={() => navigate(`/devices/${device.id}`)}
        >
            <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                {/* Header with Status Indicator */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar 
                        sx={{ 
                            mr: 2, 
                            bgcolor: device.status === 'online' ? 'success.main' : 
                                     device.status === 'offline' ? 'error.main' : 'warning.main',
                            fontSize: '1.2rem',
                        }}
                    >
                        {getDeviceIcon(device.type)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="h6" component="h2" noWrap sx={{ fontWeight: 600 }}>
                            {device.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                            {device.id}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Tooltip title={t('deviceCard.deviceStatus', { status: t(`devices.status.${device.status || 'unknown'}`) })}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {device.status === 'online' ? (
                                    <SignalWifi4Bar color="success" fontSize="small" />
                                ) : (
                                    <SignalWifiOff color="error" fontSize="small" />
                                )}
                            </Box>
                        </Tooltip>
                        <Tooltip title={t('deviceCard.moreActions')}>
                            <IconButton
                                size="small"
                                onClick={handleMenuOpen}
                                sx={{ ml: 0.5 }}
                            >
                                <MoreVert fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* Device Info */}
                <Stack spacing={1.5}>
                    <DeviceInfoRow label={t('deviceInfo.type')} value={device.type} />
                    {device.subtype && (
                        <DeviceInfoRow label={t('deviceInfo.subtype')} value={device.subtype} />
                    )}
                    {device.unitCode && (
                        <DeviceInfoRow label={t('deviceCard.unitCode')} value={device.unitCode} />
                    )}
                    <DeviceInfoRow 
                        label={t('deviceInfo.entities')} 
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
                    <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{ 
                            mt: 2, 
                            display: 'block',
                            fontStyle: 'italic',
                        }}
                    >
                        {t('deviceCard.lastSeen', { time: device.lastSeen })}
                    </Typography>
                )}
            </CardContent>

            <CardActions sx={{ pt: 0, px: 2, pb: 2, gap: 1 }}>
                <Button
                    variant="contained"
                    startIcon={<Visibility />}
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/devices/${device.id}`);
                    }}
                    fullWidth
                    size="small"
                >
                    {t('deviceCard.viewDetails')}
                </Button>
                {device.status === 'online' && (
                        <Tooltip title={t('deviceCard.quickToggle')}>
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleQuickAction('toggle');
                            }}
                        >
                            <PowerSettingsNew />
                        </IconButton>
                    </Tooltip>
                )}
            </CardActions>

            {/* Context Menu */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
                onClick={(e) => e.stopPropagation()}
            >
                <MenuItem onClick={() => handleQuickAction('refresh')}>
                    <ListItemIcon>
                        <Refresh fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{t('common.refresh')}</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleQuickAction('edit')}>
                    <ListItemIcon>
                        <Edit fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{t('common.edit')}</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleQuickAction('delete')} sx={{ color: 'error.main' }}>
                    <ListItemIcon>
                        <Delete fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>{t('deviceCard.remove')}</ListItemText>
                </MenuItem>
            </Menu>
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
