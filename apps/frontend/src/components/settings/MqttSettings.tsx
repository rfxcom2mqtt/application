import React from 'react';
import { Box, Typography, Divider, Paper, Grid, Chip } from '@mui/material';
import {
  Storage as ServerIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  VpnKey as AuthIcon,
} from '@mui/icons-material';
import { SettingMqtt } from '../../models/shared';
import SettingField from './SettingField';
import PasswordField from '../PasswordField';

interface MqttSettingsProps {
  settings: SettingMqtt;
  onChange: (mqtt: SettingMqtt) => void;
}

function MqttSettings({ settings, onChange }: MqttSettingsProps) {
  const updateField = (field: keyof SettingMqtt, value: string) => {
    onChange({ ...settings, [field]: value });
  };

  const SettingGroup = ({
    title,
    icon,
    children,
    description,
  }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    description?: string;
  }) => (
    <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: 'primary.main',
            mr: 1,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {description}
        </Typography>
      )}
      <Divider sx={{ mb: 3 }} />
      {children}
    </Paper>
  );

  return (
    <Box>
      <SettingGroup
        title="Connection Settings"
        icon={<ServerIcon />}
        description="Configure the basic MQTT broker connection parameters"
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <SettingField
              id="mqtt-server"
              label="Server URL"
              value={settings.server}
              onChange={value => updateField('server', value)}
              helperText="MQTT server URL (use mqtts:// for SSL/TLS connection)"
              placeholder="mqtt://localhost or mqtts://secure-broker.com"
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <SettingField
              id="mqtt-port"
              label="Port"
              type="number"
              value={settings.port}
              onChange={value => updateField('port', value)}
              helperText="MQTT server port (default: 1883 for MQTT, 8883 for MQTTS)"
              placeholder="1883"
              required
            />
          </Grid>
        </Grid>

        <SettingField
          id="mqtt-base_topic"
          label="Base Topic"
          value={settings.base_topic}
          onChange={value => updateField('base_topic', value)}
          helperText="MQTT base topic for Rfxcom2MQTT MQTT messages"
          placeholder="rfxcom2mqtt"
          required
        />

        <SettingField
          id="mqtt-keepalive"
          label="Keep Alive Interval"
          type="number"
          value={settings.keepalive}
          onChange={value => updateField('keepalive', value)}
          helperText="MQTT keepalive interval in seconds (default: 60)"
          placeholder="60"
        />
      </SettingGroup>

      <SettingGroup
        title="Authentication"
        icon={<AuthIcon />}
        description="Configure MQTT broker authentication credentials"
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <SettingField
              id="mqtt-username"
              label="Username"
              value={settings.username}
              onChange={value => updateField('username', value)}
              helperText="MQTT server authentication username"
              placeholder="Enter username"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography
                  variant="subtitle2"
                  component="label"
                  htmlFor="mqtt-password"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                  }}
                >
                  Password
                </Typography>
              </Box>
              <PasswordField
                id="mqtt-password"
                value={settings.password}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  updateField('password', event.target.value);
                }}
                placeholder="Enter password"
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                  display: 'block',
                  lineHeight: 1.4,
                }}
              >
                MQTT server authentication password
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </SettingGroup>

      <SettingGroup
        title="SSL/TLS Security"
        icon={<SecurityIcon />}
        description="Configure SSL/TLS certificates for secure MQTT connections"
      >
        <Box sx={{ mb: 2 }}>
          <Chip
            label="Optional - Only required for SSL/TLS connections"
            size="small"
            variant="outlined"
            color="info"
          />
        </Box>

        <SettingField
          id="mqtt-ca"
          label="Certificate Authority (CA)"
          value={settings.ca}
          onChange={value => updateField('ca', value)}
          helperText="Absolute path to SSL/TLS certificate of CA used to sign server and client certificates"
          placeholder="/path/to/ca.crt"
        />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <SettingField
              id="mqtt-cert"
              label="Client Certificate"
              value={settings.cert}
              onChange={value => updateField('cert', value)}
              helperText="Absolute path to SSL/TLS certificate for client authentication"
              placeholder="/path/to/client.crt"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <SettingField
              id="mqtt-key"
              label="Client Private Key"
              value={settings.key}
              onChange={value => updateField('key', value)}
              helperText="Absolute path to SSL/TLS private key for client authentication"
              placeholder="/path/to/client.key"
            />
          </Grid>
        </Grid>
      </SettingGroup>
    </Box>
  );
}

export default MqttSettings;
