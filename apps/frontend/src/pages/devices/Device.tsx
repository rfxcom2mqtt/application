import React from 'react';
import {
    Box,
    Grid,
    Alert,
    Card,
    CardContent,
    Typography,
    Divider,
    Paper,
    Skeleton,
} from '@mui/material';
import { Code } from '@mui/icons-material';

// Components
import DeviceHeader from '../../components/device/DeviceHeader';
import DeviceInfo from '../../components/device/DeviceInfo';
import {
    SensorsSection,
    SwitchesSection,
    BinarySensorsSection,
    CoversSection,
    SelectsSection,
} from '../../components/device/EntitySection';
import ConfirmationDialogTextfield, {
    DialogTextfieldState,
    closedDialogTextfieldState,
} from '../../components/ConfirmationDialogTextfield';

// Hooks
import { useDevice } from '../../hooks/useDevice';

function DevicePage() {
    const {
        device,
        state,
        loading,
        refresh,
        handleSwitchAction,
        handleSensorRename,
        handleSwitchRename,
        handleDeviceRename,
        getEntityCount,
        getEntityCounts,
    } = useDevice();

    const [dialogProps, setDialogProps] = React.useState<DialogTextfieldState>(closedDialogTextfieldState);

    const handleRenameDevice = () => {
        const action = (deviceName: string) => {
            handleDeviceRename(deviceName);
        };
        setDialogProps({
            open: true,
            action,
            message: 'Rename device',
        });
    };

    const handleSensorRenameAction = (entity: any) => {
        const action = (name: string) => {
            handleSensorRename(entity, name);
        };
        setDialogProps({
            open: true,
            action,
            message: 'Rename sensor',
        });
    };

    const handleSwitchRenameAction = (entity: any) => {
        const action = (name: string) => {
            handleSwitchRename(entity, name);
        };
        setDialogProps({
            open: true,
            action,
            message: 'Rename switch',
        });
    };

    const dialogOnContinue = (value: string) => {
        if (dialogProps.action) {
            dialogProps.action(value);
        }
        setDialogProps({ ...dialogProps, open: false });
    };

    const dialogOnCancel = () => {
        setDialogProps({ ...dialogProps, open: false });
    };

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Card>
                            <CardContent>
                                <Skeleton variant="text" width="60%" height={32} />
                                <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
                                <Skeleton variant="rectangular" height={200} />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Skeleton variant="text" width="80%" height={24} />
                                <Skeleton variant="text" width="60%" height={20} />
                                <Skeleton variant="text" width="70%" height={20} />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    if (!device) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">
                    Device not found or failed to load.
                </Alert>
            </Box>
        );
    }

    const entityCounts = getEntityCounts();

    return (
        <Box sx={{ p: 3 }}>
            <DeviceHeader
                device={device}
                entityCount={getEntityCount()}
                onRename={handleRenameDevice}
                onRefresh={refresh}
            />

            <Grid container spacing={3}>
                {/* Device Information */}
                <Grid item xs={12} lg={4}>
                    <DeviceInfo
                        device={device}
                        entityCounts={entityCounts}
                    />
                </Grid>

                {/* Device Entities */}
                <Grid item xs={12} lg={8}>
                    {/* Sensors */}
                    {device.sensors && state && (
                        <SensorsSection
                            sensors={device.sensors}
                            state={state}
                            onRename={handleSensorRenameAction}
                        />
                    )}

                    {/* Switches */}
                    {device.switchs && state && (
                        <SwitchesSection
                            switches={device.switchs}
                            state={state}
                            onAction={handleSwitchAction}
                            onRename={handleSwitchRenameAction}
                        />
                    )}

                    {/* Binary Sensors */}
                    {device.binarysensors && state && (
                        <BinarySensorsSection
                            binarySensors={device.binarysensors}
                            state={state}
                        />
                    )}

                    {/* Covers */}
                    {device.covers && state && (
                        <CoversSection
                            covers={device.covers}
                            state={state}
                        />
                    )}

                    {/* Selects */}
                    {device.selects && state && (
                        <SelectsSection
                            selects={device.selects}
                            state={state}
                        />
                    )}

                    {/* Raw State (Debug) */}
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <Code sx={{ mr: 1 }} />
                                Raw State (Debug)
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            
                            <Paper sx={{ p: 2, bgcolor: 'grey.100', maxHeight: 400, overflow: 'auto', borderRadius: 2 }}>
                                <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                                    {JSON.stringify(state, null, 2)}
                                </pre>
                            </Paper>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <ConfirmationDialogTextfield
                open={dialogProps.open}
                onContinue={dialogOnContinue}
                onCancel={dialogOnCancel}
                customMessage={dialogProps.message}
            />
        </Box>
    );
}

export default DevicePage;
