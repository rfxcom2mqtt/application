import React from 'react';
import { Card, CardContent, Typography, Button, Chip, Avatar, Grid, Stack } from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface DeviceListItemProps {
  device: {
    id: string;
    name: string;
    type: string;
    status?: 'online' | 'offline' | 'unknown';
    entityCount?: number;
  };
}

const DEVICE_ICONS: { [key: string]: string } = {
  switch: '💡',
  sensor: '🌡️',
  cover: '🚪',
  binary_sensor: '🔘',
  select: '📋',
  default: '📱',
};

const STATUS_COLORS = {
  online: 'success' as const,
  offline: 'error' as const,
  unknown: 'warning' as const,
};

function DeviceListItem({ device }: DeviceListItemProps) {
  const navigate = useNavigate();

  const getDeviceIcon = (type: string) => {
    return DEVICE_ICONS[type.toLowerCase()] || DEVICE_ICONS.default;
  };

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.unknown;
  };

  return (
    <Card sx={{ mb: 1, borderRadius: 3 }}>
      <CardContent sx={{ py: 2 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <Avatar sx={{ bgcolor: 'primary.main' }}>{getDeviceIcon(device.type)}</Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h6" component="h2">
              {device.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {device.id} • {device.type}
            </Typography>
          </Grid>
          <Grid item>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={device.status || 'unknown'}
                color={getStatusColor(device.status || 'unknown')}
                size="small"
              />
              <Chip label={`${device.entityCount || 0} entities`} size="small" variant="outlined" />
              <Button
                variant="outlined"
                startIcon={<Visibility />}
                onClick={() => navigate(`/devices/${device.id}`)}
                size="small"
              >
                View
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default DeviceListItem;
