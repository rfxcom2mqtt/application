import React from 'react';
import { 
    Box, 
    Typography, 
    Divider, 
    Paper,
    Grid,
    Collapse,
    Alert,
    Chip
} from '@mui/material';
import { 
    Home as HomeIcon,
    Search as DiscoveryIcon,
    DeviceHub as DeviceIcon
} from '@mui/icons-material';
import { SettingHass } from '../../models/shared';
import SettingField from './SettingField';
import SettingSwitch from './SettingSwitch';

interface HomeassistantSettingsProps {
    settings: SettingHass;
    onChange: (homeassistant: SettingHass) => void;
}

function HomeassistantSettings({ settings, onChange }: HomeassistantSettingsProps) {
    const updateField = (field: keyof SettingHass, value: string | boolean) => {
        onChange({ ...settings, [field]: value });
    };

    const SettingGroup = ({ 
        title, 
        icon, 
        children, 
        description 
    }: { 
        title: string; 
        icon: React.ReactNode; 
        children: React.ReactNode;
        description?: string;
    }) => (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    color: 'primary.main',
                    mr: 1
                }}>
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
                title="Home Assistant Integration"
                icon={<HomeIcon />}
                description="Configure automatic device discovery and integration with Home Assistant"
            >
                <Box sx={{ mb: 2 }}>
                    <Chip 
                        label="Requires Home Assistant with MQTT integration" 
                        size="small" 
                        variant="outlined" 
                        color="info"
                    />
                </Box>

                <SettingSwitch
                    id="homeassistant-discovery"
                    label="Enable Home Assistant Discovery"
                    checked={settings.discovery}
                    onChange={(checked) => updateField('discovery', checked)}
                    helperText="Automatically publish device configuration to Home Assistant via MQTT discovery"
                />

                {!settings.discovery && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        Home Assistant discovery is disabled. Your RFXcom devices will not be automatically 
                        discovered by Home Assistant. You can still manually configure them using the MQTT integration.
                    </Alert>
                )}

                {settings.discovery && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                            <strong>Discovery enabled!</strong> Your RFXcom devices will automatically appear in Home Assistant 
                            under the MQTT integration. Make sure your Home Assistant MQTT integration is configured 
                            to use the same broker as RFXcom2MQTT.
                        </Typography>
                    </Alert>
                )}
            </SettingGroup>

            <Collapse in={settings.discovery}>
                <SettingGroup
                    title="Discovery Configuration"
                    icon={<DiscoveryIcon />}
                    description="Configure how devices are discovered and presented in Home Assistant"
                >
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <SettingField
                                id="homeassistant-discovery-topic"
                                label="Discovery Topic"
                                value={settings.discovery_topic}
                                onChange={(value) => updateField('discovery_topic', value)}
                                helperText="MQTT topic prefix for Home Assistant discovery messages"
                                placeholder="homeassistant"
                                required
                                disabled={!settings.discovery}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <SettingField
                                id="homeassistant-discovery-device"
                                label="Device Prefix"
                                value={settings.discovery_device}
                                onChange={(value) => updateField('discovery_device', value)}
                                helperText="Prefix for device names in Home Assistant"
                                placeholder="rfxcom2mqtt"
                                disabled={!settings.discovery}
                            />
                        </Grid>
                    </Grid>

                    <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                            <strong>Discovery Topic Structure:</strong><br />
                            Devices will be published to: <code>{settings.discovery_topic || 'homeassistant'}/[component]/[device_id]/config</code>
                        </Typography>
                    </Alert>
                </SettingGroup>

                <SettingGroup
                    title="Device Management"
                    icon={<DeviceIcon />}
                    description="Information about how devices appear in Home Assistant"
                >
                    <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Supported Device Types:</strong>
                        </Typography>
                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                            <li>Sensors (temperature, humidity, etc.)</li>
                            <li>Binary sensors (motion, door/window, etc.)</li>
                            <li>Switches and dimmers</li>
                            <li>Covers (blinds, shutters)</li>
                        </Box>
                    </Alert>

                    <Alert severity="warning">
                        <Typography variant="body2">
                            <strong>Note:</strong> Changes to discovery settings require restarting RFXcom2MQTT 
                            to take effect. Existing devices in Home Assistant may need to be manually removed 
                            and re-discovered if you change the discovery topic or device prefix.
                        </Typography>
                    </Alert>
                </SettingGroup>
            </Collapse>
        </Box>
    );
}

export default HomeassistantSettings;
