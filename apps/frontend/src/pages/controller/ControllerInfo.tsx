import React, { useState, useEffect } from 'react';
import { BridgeInfo } from '../../models/shared';
import { 
    Alert, 
    Box, 
    Button, 
    Card, 
    CardContent, 
    CardHeader, 
    CircularProgress, 
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    FormLabel,
    Grid, 
    Snackbar, 
    Stack, 
    Typography 
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';

import controllerApi from '../../api/ControllerApi';

/**
 * Controller Information Page
 * Displays information about the RFXCOM controller and bridge
 */
function ControllerInfoPage() {
    // State
    const [controllerInfo, setControllerInfo] = useState<BridgeInfo>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [restartDialogOpen, setRestartDialogOpen] = useState<boolean>(false);
    const [notification, setNotification] = useState<{message: string, severity: 'success' | 'error' | 'info' | 'warning'} | null>(null);

    // Load controller info on component mount
    useEffect(() => {
        fetchControllerInfo();
    }, []);

    // Fetch controller information from API
    const fetchControllerInfo = () => {
        setLoading(true);
        setError(null);
        
        controllerApi.getInfo()
            .then((response) => {
                setControllerInfo(response);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch controller info:', err);
                setError('Failed to load controller information. Please try again later.');
                setLoading(false);
            });
    };

    // Handle controller restart
    const handleRestartController = () => {
        setRestartDialogOpen(false);
        setLoading(true);
        
        controllerApi.restart()
            .then(() => {
                setNotification({
                    message: 'Controller restart initiated successfully',
                    severity: 'success'
                });
                
                // Fetch updated info after a delay to allow restart
                setTimeout(() => {
                    fetchControllerInfo();
                }, 5000);
            })
            .catch((err) => {
                console.error('Failed to restart controller:', err);
                setNotification({
                    message: 'Failed to restart controller',
                    severity: 'error'
                });
                setLoading(false);
            });
    };

    // Close notification
    const handleCloseNotification = () => {
        setNotification(null);
    };

    // Render loading state
    if (loading && !controllerInfo) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Render error state
    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert 
                    severity="error" 
                    action={
                        <Button color="inherit" size="small" onClick={fetchControllerInfo}>
                            Retry
                        </Button>
                    }
                >
                    {error}
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <InfoIcon sx={{ mr: 1 }} /> Controller Information
            </Typography>
            
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <CircularProgress size={24} />
                </Box>
            )}
            
            <Card sx={{ mb: 3 }}>
                <CardHeader 
                    title="RFXCOM Hardware" 
                    subheader="Information about the RFXCOM controller hardware"
                    avatar={<SettingsIcon />}
                />
                <Divider />
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={4}>
                            <FormLabel>Protocols</FormLabel>
                        </Grid>
                        <Grid item xs={6} sm={8}>
                            <Typography>
                                {controllerInfo?.coordinator.enabledProtocols?.length 
                                    ? controllerInfo.coordinator.enabledProtocols.join(', ') 
                                    : 'None'}
                            </Typography>
                        </Grid>
                        
                        <Grid item xs={6} sm={4}>
                            <FormLabel>Firmware Type</FormLabel>
                        </Grid>
                        <Grid item xs={6} sm={8}>
                            <Typography>{controllerInfo?.coordinator.firmwareType || 'Unknown'}</Typography>
                        </Grid>
                        
                        <Grid item xs={6} sm={4}>
                            <FormLabel>Firmware Version</FormLabel>
                        </Grid>
                        <Grid item xs={6} sm={8}>
                            <Typography>{controllerInfo?.coordinator.firmwareVersion || 'Unknown'}</Typography>
                        </Grid>
                        
                        <Grid item xs={6} sm={4}>
                            <FormLabel>Hardware Version</FormLabel>
                        </Grid>
                        <Grid item xs={6} sm={8}>
                            <Typography>{controllerInfo?.coordinator.hardwareVersion || 'Unknown'}</Typography>
                        </Grid>
                        
                        <Grid item xs={6} sm={4}>
                            <FormLabel>Receiver Type</FormLabel>
                        </Grid>
                        <Grid item xs={6} sm={8}>
                            <Typography>{controllerInfo?.coordinator.receiverType || 'Unknown'}</Typography>
                        </Grid>
                        
                        <Grid item xs={6} sm={4}>
                            <FormLabel>Receiver Code</FormLabel>
                        </Grid>
                        <Grid item xs={6} sm={8}>
                            <Typography>{controllerInfo?.coordinator.receiverTypeCode || 'Unknown'}</Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader 
                    title="RFXCOM2MQTT Bridge" 
                    subheader="Information about the RFXCOM2MQTT bridge software"
                    avatar={<InfoIcon />}
                />
                <Divider />
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={4}>
                            <FormLabel>Version</FormLabel>
                        </Grid>
                        <Grid item xs={6} sm={8}>
                            <Typography>{controllerInfo?.version || 'Unknown'}</Typography>
                        </Grid>
                        
                        <Grid item xs={6} sm={4}>
                            <FormLabel>Log Level</FormLabel>
                        </Grid>
                        <Grid item xs={6} sm={8}>
                            <Typography>{controllerInfo?.logLevel || 'Unknown'}</Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            
            <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
                <Button 
                    variant="contained" 
                    color="warning" 
                    startIcon={<RestartAltIcon />}
                    onClick={() => setRestartDialogOpen(true)}
                    disabled={loading}
                >
                    Restart Controller
                </Button>
            </Stack>
            
            {/* Restart Confirmation Dialog */}
            <Dialog
                open={restartDialogOpen}
                onClose={() => setRestartDialogOpen(false)}
            >
                <DialogTitle>Restart Controller?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to restart the RFXCOM controller? This will temporarily interrupt communication with your devices.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRestartDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleRestartController} color="warning" autoFocus>
                        Restart
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Notification Snackbar */}
            <Snackbar 
                open={notification !== null} 
                autoHideDuration={6000} 
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseNotification} 
                    severity={notification?.severity || 'info'}
                    sx={{ width: '100%' }}
                >
                    {notification?.message || ''}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default ControllerInfoPage;
