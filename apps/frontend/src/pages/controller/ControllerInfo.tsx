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
import { useTranslation } from 'react-i18next';
import PageContainer from '../../components/common/PageContainer';

import controllerApi from '../../api/ControllerApi';

/**
 * Controller Information Page
 * Displays information about the RFXCOM controller and bridge
 */
function ControllerInfoPage() {
    const { t } = useTranslation();
    
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
                setError(t('controller.loadError'));
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
                    message: t('controller.restart.success'),
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
                    message: t('controller.restart.error'),
                    severity: 'error'
                });
                setLoading(false);
            });
    };

    // Close notification
    const handleCloseNotification = () => {
        setNotification(null);
    };

    const pageActions = (
        <Button 
            variant="contained" 
            color="warning" 
            startIcon={<RestartAltIcon />}
            onClick={() => setRestartDialogOpen(true)}
            disabled={loading}
        >
            {t('controller.restart.button')}
        </Button>
    );

    // Render loading state
    if (loading && !controllerInfo) {
        return (
            <PageContainer
                title={t('controller.title')}
                subtitle={t('controller.subtitle')}
                actions={pageActions}
                loading={true}
                maxWidth="lg"
            >
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress />
                </Box>
            </PageContainer>
        );
    }

    // Render error state
    if (error) {
        return (
            <PageContainer
                title={t('controller.title')}
                subtitle={t('controller.subtitle')}
                actions={pageActions}
                maxWidth="lg"
            >
                <Alert 
                    severity="error" 
                    action={
                        <Button color="inherit" size="small" onClick={fetchControllerInfo}>
                            {t('common.retry')}
                        </Button>
                    }
                >
                    {error}
                </Alert>
            </PageContainer>
        );
    }

    return (
        <PageContainer
            title={t('controller.title')}
            subtitle={t('controller.subtitle')}
            actions={pageActions}
            maxWidth="lg"
        >
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <CircularProgress size={24} />
                </Box>
            )}
            
            <Card sx={{ mb: 3 }}>
                <CardHeader 
                    title={t('controller.hardware.title')} 
                    subheader={t('controller.hardware.subtitle')}
                    avatar={<SettingsIcon />}
                />
                <Divider />
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={4}>
                            <FormLabel>{t('controller.hardware.protocols')}</FormLabel>
                        </Grid>
                        <Grid item xs={6} sm={8}>
                            <Typography>
                                {controllerInfo?.coordinator.enabledProtocols?.length 
                                    ? controllerInfo.coordinator.enabledProtocols.join(', ') 
                                    : t('common.none')}
                            </Typography>
                        </Grid>
                        
                        <Grid item xs={6} sm={4}>
                            <FormLabel>{t('controller.hardware.firmwareType')}</FormLabel>
                        </Grid>
                        <Grid item xs={6} sm={8}>
                            <Typography>{controllerInfo?.coordinator.firmwareType || t('common.unknown')}</Typography>
                        </Grid>
                        
                        <Grid item xs={6} sm={4}>
                            <FormLabel>{t('controller.hardware.firmwareVersion')}</FormLabel>
                        </Grid>
                        <Grid item xs={6} sm={8}>
                            <Typography>{controllerInfo?.coordinator.firmwareVersion || t('common.unknown')}</Typography>
                        </Grid>
                        
                        <Grid item xs={6} sm={4}>
                            <FormLabel>{t('controller.hardware.hardwareVersion')}</FormLabel>
                        </Grid>
                        <Grid item xs={6} sm={8}>
                            <Typography>{controllerInfo?.coordinator.hardwareVersion || t('common.unknown')}</Typography>
                        </Grid>
                        
                        <Grid item xs={6} sm={4}>
                            <FormLabel>{t('controller.hardware.receiverType')}</FormLabel>
                        </Grid>
                        <Grid item xs={6} sm={8}>
                            <Typography>{controllerInfo?.coordinator.receiverType || t('common.unknown')}</Typography>
                        </Grid>
                        
                        <Grid item xs={6} sm={4}>
                            <FormLabel>{t('controller.hardware.receiverCode')}</FormLabel>
                        </Grid>
                        <Grid item xs={6} sm={8}>
                            <Typography>{controllerInfo?.coordinator.receiverTypeCode || t('common.unknown')}</Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader 
                    title={t('controller.bridge.title')} 
                    subheader={t('controller.bridge.subtitle')}
                    avatar={<InfoIcon />}
                />
                <Divider />
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={4}>
                            <FormLabel>{t('controller.bridge.version')}</FormLabel>
                        </Grid>
                        <Grid item xs={6} sm={8}>
                            <Typography>{controllerInfo?.version || t('common.unknown')}</Typography>
                        </Grid>
                        
                        <Grid item xs={6} sm={4}>
                            <FormLabel>{t('controller.bridge.logLevel')}</FormLabel>
                        </Grid>
                        <Grid item xs={6} sm={8}>
                            <Typography>{controllerInfo?.logLevel || t('common.unknown')}</Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            
            {/* Restart Confirmation Dialog */}
            <Dialog
                open={restartDialogOpen}
                onClose={() => setRestartDialogOpen(false)}
            >
                <DialogTitle>{t('controller.restart.confirmTitle')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('controller.restart.confirmMessage')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRestartDialogOpen(false)}>{t('common.cancel')}</Button>
                    <Button onClick={handleRestartController} color="warning" autoFocus>
                        {t('controller.restart.button')}
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
        </PageContainer>
    );
}

export default ControllerInfoPage;
