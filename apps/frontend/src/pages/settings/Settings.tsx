import * as React from 'react';
import {
    Box,
    Button,
    Tab,
    Tabs,
    Paper,
    Typography,
    Alert,
    Fab,
    Backdrop,
    CircularProgress,
    useTheme as useMuiTheme,
    alpha,
    Stack,
    Container,
    Snackbar,
} from '@mui/material';
import {
    Router as RouterIcon,
    Wifi as MqttIcon,
    Web as FrontendIcon,
    Home as HomeAssistantIcon,
    Settings as AdvancedIcon,
    Save as SaveIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { Settings, SettingMqtt, SettingFrontend, SettingHass, SettingRfxcom } from '../../models/shared';
import SettingRfxcomEditor from '../../components/settings/SettingRfxcomEditor';
import MqttSettings from '../../components/settings/MqttSettings';
import FrontendSettings from '../../components/settings/FrontendSettings';
import HomeassistantSettings from '../../components/settings/HomeassistantSettings';
import AdvancedSettings from '../../components/settings/AdvancedSettings';
import PageContainer from '../../components/common/PageContainer';
import { useToast } from '../../components/common/Toast';
import settingsApi from '../../api/SettingsApi';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`settings-tabpanel-${index}`}
            aria-labelledby={`settings-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `settings-tab-${index}`,
        'aria-controls': `settings-tabpanel-${index}`,
    };
}

const tabConfig = [
    { label: 'RFXcom', icon: <RouterIcon />, description: 'Configure RFXcom device settings' },
    { label: 'MQTT', icon: <MqttIcon />, description: 'Configure MQTT broker connection' },
    { label: 'Frontend', icon: <FrontendIcon />, description: 'Configure web interface settings' },
    { label: 'Home Assistant', icon: <HomeAssistantIcon />, description: 'Configure Home Assistant integration' },
    { label: 'Advanced', icon: <AdvancedIcon />, description: 'Advanced system settings' },
];

function SettingsPage() {
    const theme = useMuiTheme();
    const { showSuccess, showError, showInfo } = useToast();
    const [settings, setSettings] = React.useState<Settings>();
    const [originalSettings, setOriginalSettings] = React.useState<Settings>();
    const [tabValue, setTabValue] = React.useState<number>(0);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [saving, setSaving] = React.useState<boolean>(false);
    const [hasChanges, setHasChanges] = React.useState<boolean>(false);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const checkForChanges = React.useCallback((newSettings: Settings) => {
        if (!originalSettings) return false;
        return JSON.stringify(newSettings) !== JSON.stringify(originalSettings);
    }, [originalSettings]);

    const handleRfxcomChange = (rfxcom: SettingRfxcom) => {
        if (settings) {
            const newSettings = { ...settings, rfxcom };
            setSettings(newSettings);
            setHasChanges(checkForChanges(newSettings));
        }
    };

    const handleMqttChange = (mqtt: SettingMqtt) => {
        if (settings) {
            const newSettings = { ...settings, mqtt };
            setSettings(newSettings);
            setHasChanges(checkForChanges(newSettings));
        }
    };

    const handleFrontendChange = (frontend: SettingFrontend) => {
        if (settings) {
            const newSettings = { ...settings, frontend };
            setSettings(newSettings);
            setHasChanges(checkForChanges(newSettings));
        }
    };

    const handleHomeassistantChange = (homeassistant: SettingHass) => {
        if (settings) {
            const newSettings = { ...settings, homeassistant };
            setSettings(newSettings);
            setHasChanges(checkForChanges(newSettings));
        }
    };

    const handleLogLevelChange = (loglevel: string) => {
        if (settings) {
            const newSettings = { ...settings, loglevel };
            setSettings(newSettings);
            setHasChanges(checkForChanges(newSettings));
        }
    };

    const cancel = () => {
        if (originalSettings) {
            setSettings({ ...originalSettings });
            setHasChanges(false);
            showInfo('Changes discarded');
        }
    };

    const save = async () => {
        if (settings) {
            setSaving(true);
            try {
                await settingsApi.updateSettings(settings);
                setOriginalSettings({ ...settings });
                setHasChanges(false);
                showSuccess('Settings saved successfully');
            } catch (error) {
                console.error('Failed to save settings:', error);
                showError('Failed to save settings. Please try again.');
            } finally {
                setSaving(false);
            }
        }
    };

    const getSettings = async () => {
        setLoading(true);
        try {
            const response = await settingsApi.getSettings();
            setSettings(response);
            setOriginalSettings({ ...response });
            setHasChanges(false);
        } catch (error) {
            console.error('Failed to load settings:', error);
            showError('Failed to load settings. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        getSettings();
    }, []);

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress size={60} />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
                    Settings
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Configure your RFXcom2MQTT system settings
                </Typography>
            </Box>

            {settings && (
                <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ 
                        borderBottom: 1, 
                        borderColor: 'divider',
                        background: alpha(theme.palette.primary.main, 0.02)
                    }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                                '& .MuiTab-root': {
                                    minHeight: 72,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    '&.Mui-selected': {
                                        color: theme.palette.primary.main,
                                    }
                                }
                            }}
                        >
                            {tabConfig.map((tab, index) => (
                                <Tab
                                    key={index}
                                    icon={tab.icon}
                                    label={tab.label}
                                    iconPosition="start"
                                    {...a11yProps(index)}
                                />
                            ))}
                        </Tabs>
                    </Box>

                    <Box sx={{ p: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {tabConfig[tabValue]?.description}
                        </Typography>

                        <TabPanel value={tabValue} index={0}>
                            <SettingRfxcomEditor 
                                settings={settings.rfxcom} 
                                handleChange={handleRfxcomChange} 
                            />
                        </TabPanel>
                        <TabPanel value={tabValue} index={1}>
                            <MqttSettings 
                                settings={settings.mqtt} 
                                onChange={handleMqttChange} 
                            />
                        </TabPanel>
                        <TabPanel value={tabValue} index={2}>
                            <FrontendSettings 
                                settings={settings.frontend} 
                                onChange={handleFrontendChange} 
                            />
                        </TabPanel>
                        <TabPanel value={tabValue} index={3}>
                            <HomeassistantSettings 
                                settings={settings.homeassistant} 
                                onChange={handleHomeassistantChange} 
                            />
                        </TabPanel>
                        <TabPanel value={tabValue} index={4}>
                            <AdvancedSettings 
                                logLevel={settings.loglevel} 
                                onChange={handleLogLevelChange} 
                            />
                        </TabPanel>
                    </Box>

                    {/* Action Bar */}
                    <Box sx={{ 
                        p: 3, 
                        borderTop: 1, 
                        borderColor: 'divider',
                        background: alpha(theme.palette.grey[50], 0.5),
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Box>
                            {hasChanges && (
                                <Alert severity="warning" sx={{ py: 0 }}>
                                    You have unsaved changes
                                </Alert>
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={cancel}
                                disabled={!hasChanges || saving}
                                startIcon={<RefreshIcon />}
                            >
                                Reset
                            </Button>
                            <Button
                                variant="contained"
                                onClick={save}
                                disabled={!hasChanges || saving}
                                startIcon={<SaveIcon />}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            )}

            {/* Floating Action Button for Quick Save */}
            {hasChanges && (
                <Fab
                    color="primary"
                    aria-label="save"
                    onClick={save}
                    disabled={saving}
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        zIndex: 1000
                    }}
                >
                    <SaveIcon />
                </Fab>
            )}

            {/* Loading Backdrop */}
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={saving}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <CircularProgress color="inherit" />
                    <Typography variant="body1">Saving settings...</Typography>
                </Box>
            </Backdrop>

        </Container>
    );
}

export default SettingsPage;
