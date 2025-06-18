import React from 'react';
import { 
    Box, 
    Typography, 
    Divider, 
    Paper,
    Grid,
    Collapse,
    Alert
} from '@mui/material';
import { 
    Web as WebIcon,
    Security as SecurityIcon,
    NetworkCheck as NetworkIcon
} from '@mui/icons-material';
import { SettingFrontend } from '../../models/shared';
import SettingField from './SettingField';
import SettingSwitch from './SettingSwitch';

interface FrontendSettingsProps {
    settings: SettingFrontend;
    onChange: (frontend: SettingFrontend) => void;
}

function FrontendSettings({ settings, onChange }: FrontendSettingsProps) {
    const updateField = (field: keyof SettingFrontend, value: string | boolean | number) => {
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
                title="Frontend Interface"
                icon={<WebIcon />}
                description="Enable and configure the web interface for RFXcom2MQTT"
            >
                <SettingSwitch
                    id="frontend-enabled"
                    label="Enable Web Interface"
                    checked={settings.enabled}
                    onChange={(checked) => updateField('enabled', checked)}
                    helperText="Enable the web-based user interface for managing your RFXcom2MQTT system"
                />

                {!settings.enabled && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        The web interface is currently disabled. Enable it to access the configuration and device management features.
                    </Alert>
                )}
            </SettingGroup>

            <Collapse in={settings.enabled}>
                <SettingGroup
                    title="Network Configuration"
                    icon={<NetworkIcon />}
                    description="Configure how the web interface is accessible on your network"
                >
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <SettingField
                                id="frontend-host"
                                label="Host Address"
                                value={settings.host}
                                onChange={(value) => updateField('host', value)}
                                helperText="Frontend binding host. Use 0.0.0.0 to bind to all interfaces, or specify an absolute path for unix socket"
                                placeholder="0.0.0.0 or /path/to/socket"
                                disabled={!settings.enabled}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <SettingField
                                id="frontend-port"
                                label="Port"
                                type="number"
                                value={settings.port}
                                onChange={(value) => updateField('port', parseInt(value) || 0)}
                                helperText="Frontend binding port (ignored when using unix socket)"
                                placeholder="8080"
                                disabled={!settings.enabled}
                            />
                        </Grid>
                    </Grid>

                    {settings.host && !settings.host.startsWith('/') && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                <strong>Access URL:</strong> http://{settings.host || 'localhost'}:{settings.port || 8080}
                            </Typography>
                        </Alert>
                    )}

                    {settings.host && settings.host.startsWith('/') && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                <strong>Unix Socket:</strong> {settings.host}
                            </Typography>
                        </Alert>
                    )}
                </SettingGroup>

                <SettingGroup
                    title="SSL/TLS Security"
                    icon={<SecurityIcon />}
                    description="Configure HTTPS encryption for secure web interface access"
                >
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            <strong>Important:</strong> Both certificate and key files must be provided to enable HTTPS. 
                            Leave both fields empty to use HTTP.
                        </Typography>
                    </Alert>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <SettingField
                                id="frontend-sslCert"
                                label="SSL Certificate File"
                                value={settings.sslCert}
                                onChange={(value) => updateField('sslCert', value)}
                                helperText="Absolute path to SSL certificate file (.crt or .pem)"
                                placeholder="/path/to/certificate.crt"
                                disabled={!settings.enabled}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <SettingField
                                id="frontend-sslKey"
                                label="SSL Private Key File"
                                value={settings.sslKey}
                                onChange={(value) => updateField('sslKey', value)}
                                helperText="Absolute path to SSL private key file (.key or .pem)"
                                placeholder="/path/to/private.key"
                                disabled={!settings.enabled}
                            />
                        </Grid>
                    </Grid>

                    {settings.sslCert && settings.sslKey && settings.host && !settings.host.startsWith('/') && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                <strong>HTTPS Access URL:</strong> https://{settings.host || 'localhost'}:{settings.port || 8080}
                            </Typography>
                        </Alert>
                    )}

                    {(settings.sslCert && !settings.sslKey) || (!settings.sslCert && settings.sslKey) && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                Both SSL certificate and private key files must be provided to enable HTTPS.
                            </Typography>
                        </Alert>
                    )}
                </SettingGroup>
            </Collapse>
        </Box>
    );
}

export default FrontendSettings;
