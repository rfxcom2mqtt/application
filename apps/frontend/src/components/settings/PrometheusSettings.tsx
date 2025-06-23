import React from 'react';
import {
  Box,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography,
  Alert,
  Chip,
  Stack,
  Link,
} from '@mui/material';
import {
  Timeline as MetricsIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { SettingPrometheus } from '../../models/shared';

interface PrometheusSettingsProps {
  settings: SettingPrometheus;
  onChange: (settings: SettingPrometheus) => void;
}

const PrometheusSettings: React.FC<PrometheusSettingsProps> = ({ settings, onChange }) => {
  const { t } = useTranslation();

  const handleChange = (field: keyof SettingPrometheus, value: any) => {
    onChange({
      ...settings,
      [field]: value,
    });
  };

  const metricsUrl = settings.enabled 
    ? `http://${settings.host === '0.0.0.0' ? 'localhost' : settings.host}:${settings.port}${settings.path}`
    : '';

  const healthUrl = settings.enabled 
    ? `http://${settings.host === '0.0.0.0' ? 'localhost' : settings.host}:${settings.port}/health`
    : '';

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MetricsIcon color="primary" />
          {t('settings.prometheus.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('settings.prometheus.description')}
        </Typography>
      </Box>

      {/* Main Settings Card */}
      <Card elevation={1} sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            {/* Enable/Disable */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enabled}
                    onChange={(e) => handleChange('enabled', e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {t('settings.prometheus.enabled.label')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('settings.prometheus.enabled.description')}
                    </Typography>
                  </Box>
                }
              />
            </Grid>

            {settings.enabled && (
              <>
                {/* Port */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <TextField
                      label={t('settings.prometheus.port.label')}
                      type="number"
                      value={settings.port}
                      onChange={(e) => handleChange('port', parseInt(e.target.value) || 9090)}
                      helperText={t('settings.prometheus.port.description')}
                      inputProps={{ min: 1, max: 65535 }}
                    />
                  </FormControl>
                </Grid>

                {/* Host */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <TextField
                      label={t('settings.prometheus.host.label')}
                      value={settings.host}
                      onChange={(e) => handleChange('host', e.target.value)}
                      helperText={t('settings.prometheus.host.description')}
                      placeholder="0.0.0.0"
                    />
                  </FormControl>
                </Grid>

                {/* Path */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <TextField
                      label={t('settings.prometheus.path.label')}
                      value={settings.path}
                      onChange={(e) => handleChange('path', e.target.value)}
                      helperText={t('settings.prometheus.path.description')}
                      placeholder="/metrics"
                    />
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Status and URLs */}
      {settings.enabled && (
        <Card elevation={1} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon color="primary" />
              {t('settings.prometheus.endpoints.title')}
            </Typography>
            
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('settings.prometheus.endpoints.metrics')}
                </Typography>
                <Chip
                  label={metricsUrl}
                  variant="outlined"
                  clickable
                  component={Link}
                  href={metricsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ fontFamily: 'monospace' }}
                />
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('settings.prometheus.endpoints.health')}
                </Typography>
                <Chip
                  label={healthUrl}
                  variant="outlined"
                  clickable
                  component={Link}
                  href={healthUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ fontFamily: 'monospace' }}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <Alert 
        severity="info" 
        icon={<SecurityIcon />}
        sx={{ mb: 2 }}
      >
        <Typography variant="body2">
          {t('settings.prometheus.security.title')}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {t('settings.prometheus.security.description')}
        </Typography>
      </Alert>

      {/* Available Metrics Info */}
      {settings.enabled && (
        <Card elevation={1}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('settings.prometheus.metrics.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {t('settings.prometheus.metrics.description')}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('settings.prometheus.metrics.categories.mqtt')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • {t('settings.prometheus.metrics.mqtt.messages')}<br/>
                  • {t('settings.prometheus.metrics.mqtt.connection')}<br/>
                  • {t('settings.prometheus.metrics.mqtt.duration')}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('settings.prometheus.metrics.categories.rfxcom')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • {t('settings.prometheus.metrics.rfxcom.messages')}<br/>
                  • {t('settings.prometheus.metrics.rfxcom.connection')}<br/>
                  • {t('settings.prometheus.metrics.rfxcom.devices')}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('settings.prometheus.metrics.categories.application')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • {t('settings.prometheus.metrics.application.http')}<br/>
                  • {t('settings.prometheus.metrics.application.uptime')}<br/>
                  • {t('settings.prometheus.metrics.application.devices')}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('settings.prometheus.metrics.categories.system')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • {t('settings.prometheus.metrics.system.cpu')}<br/>
                  • {t('settings.prometheus.metrics.system.memory')}<br/>
                  • {t('settings.prometheus.metrics.system.gc')}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default PrometheusSettings;
