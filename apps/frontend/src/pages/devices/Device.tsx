import * as React from 'react';
import { DeviceInfo, KeyValue, DeviceSwitch, DeviceSensor, DeviceBinarySensor } from '../../models/shared';
import { FormLabel } from '@mui/material';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useParams } from 'react-router-dom';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Button } from '@mui/material';

import { Description } from '@mui/icons-material';

import Cover from '../../components/device/Cover';
import BinarySensor from '../../components/device/BinarySensor';
import Sensor from '../../components/device/Sensor';
import Select from '../../components/device/Select';
import SwitchItem from '../../components/device/Switch';

import ConfirmationDialogTextfield, {
    DialogTextfieldState,
    closedDialogTextfieldState,
} from '../../components/ConfirmationDialogTextfield';

import deviceApi from '../../api/DeviceApi';

function DevicePage() {
    const { id } = useParams();
    const [device, setDevice] = React.useState<DeviceInfo>();
    const [state, setDeviceState] = React.useState<KeyValue[]>();
    const [tabValue, setTabValue] = React.useState<string>('1');
    const [dialogProps, setDialogProps] = React.useState<DialogTextfieldState>(closedDialogTextfieldState);

    React.useEffect(() => {
        console.log('get device :' + id);
        refresh();
    }, []);

    const refresh = () => {
        deviceApi.getDeviceState(id!!).then((response) => {
            setDeviceState(response);
        });
        deviceApi.getDevice(id!!).then((response) => {
            setDevice(response);
        });
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setTabValue(newValue);
    };

    const handleSwitchAction = (entity: DeviceSwitch, action: string) => {
        console.log('send action ' + entity.id + ' ' + action);
        deviceApi.deviceAction(id!!, entity.id, action).then((response) => {
            console.log('sended action ' + entity.id + ' ' + action);
            for (const item in state!!) {
                if (state[item].entityId === id) {
                    state[item][entity.property] = action;
                }
            }
            setDeviceState(state);
        });
    };

    const handleSensorRenameAction = (entity: DeviceSensor) => {
        const action = (name: string) => {
            deviceApi.updateSensorName(id!!, entity.id, name).then((response) => {
                refresh();
            });
        };
        setDialogProps({
            open: true,
            action,
            message: 'rename sensor',
        });
    };

    const handleSwitchRenameAction = (entity: DeviceSwitch) => {
        const action = (name: string) => {
            deviceApi.updateSwitchName(id!!, entity, name).then((response) => {
                refresh();
            });
        };
        setDialogProps({
            open: true,
            action,
            message: 'rename switch',
        });
    };

    const handleRenameDevice = () => {
        const action = (deviceName: string) => {
            deviceApi.updateDeviceName(id!!, deviceName).then((response) => {
                refresh();
            });
        };
        setDialogProps({
            open: true,
            action,
            message: 'rename device',
        });
    };

    const dialogOnContinue = (deviceName: string) => {
        if (dialogProps.action) {
            dialogProps.action(deviceName);
        }
        setDialogProps({ ...dialogProps, open: false });
    };

    const dialogOnCancel = () => {
        setDialogProps({ ...dialogProps, open: false });
    };

    return (
        <Box component="span" sx={{ width: '100%' }}>
            <h3>
                {device?.name}
                <Button onClick={handleRenameDevice}>
                    <Description />
                </Button>
            </h3>
            <TabContext value={tabValue}>
                <TabList onChange={handleTabChange}>
                    <Tab label="Info" value="1" />
                    <Tab label="Exposed" value="2" />
                    <Tab label="State" value="3" />
                </TabList>
                <TabPanel value="1">
                    <Card sx={{ width: '100%' }}>
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <FormLabel>Name</FormLabel>{' '}
                                </Grid>
                                <Grid item xs={6}>
                                    <FormLabel>{device?.name}</FormLabel>
                                </Grid>
                                {device?.name !== device?.originalName && (
                                    <>
                                        <Grid item xs={6}>
                                            <FormLabel>Original name</FormLabel>{' '}
                                        </Grid>
                                        <Grid item xs={6}>
                                            <FormLabel>{device?.originalName}</FormLabel>
                                        </Grid>
                                    </>
                                )}
                                <Grid item xs={6}>
                                    <FormLabel>Rfxcom Id</FormLabel>{' '}
                                </Grid>
                                <Grid item xs={6}>
                                    <FormLabel>{device?.id}</FormLabel>
                                </Grid>
                                <Grid item xs={6}>
                                    <FormLabel>Manufacturer</FormLabel>{' '}
                                </Grid>
                                <Grid item xs={6}>
                                    <FormLabel>{device?.manufacturer}</FormLabel>
                                </Grid>
                                <Grid item xs={6}>
                                    <FormLabel>Type</FormLabel>{' '}
                                </Grid>
                                <Grid item xs={6}>
                                    <FormLabel>{device?.type}</FormLabel>
                                </Grid>
                                <Grid item xs={6}>
                                    <FormLabel>Sub type</FormLabel>{' '}
                                </Grid>
                                <Grid item xs={6}>
                                    <FormLabel>{device?.subTypeValue}</FormLabel>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </TabPanel>
                <TabPanel value="2">
                    <Card sx={{ width: '100%' }}>
                        <CardContent>
                            <Grid container spacing={2}>
                                {device?.entities !== undefined && device?.entities.length > 1 && (
                                    <>
                                        <Grid item xs={6}>
                                            <FormLabel>Entities</FormLabel>{' '}
                                        </Grid>
                                        <Grid item xs={6}>
                                            <List dense={true}>
                                                {device?.entities?.map((value) => {
                                                    return (
                                                        <ListItem key={value}>
                                                            <ListItemText primary={value} />
                                                        </ListItem>
                                                    );
                                                })}
                                            </List>
                                        </Grid>{' '}
                                    </>
                                )}
                                {device?.sensors !== undefined && state !== undefined && (
                                    <>
                                        <Grid item xs={12}>
                                            <FormLabel>Home assistant sensors</FormLabel>{' '}
                                        </Grid>
                                        <Grid item xs={12}>
                                            <List dense={true}>
                                                {Object.keys(device?.sensors).map((key, index) => {
                                                    return (
                                                        <Sensor key={key} sensor={device?.sensors[key]} value={state} />
                                                    );
                                                })}
                                            </List>
                                        </Grid>
                                    </>
                                )}
                                {device?.switchs !== undefined && state !== undefined && (
                                    <>
                                        <Grid item xs={12}>
                                            <FormLabel>Home assistant switchs</FormLabel>{' '}
                                        </Grid>
                                        <Grid item xs={12}>
                                            <List dense={true}>
                                                {Object.keys(device?.switchs).map((key, index) => {
                                                    return (
                                                        <SwitchItem
                                                            key={key}
                                                            item={device?.switchs[key]}
                                                            value={state}
                                                            action={handleSwitchAction}
                                                            renameAction={handleSwitchRenameAction}
                                                        />
                                                    );
                                                })}
                                            </List>
                                        </Grid>
                                    </>
                                )}
                                {device?.binarysensors !== undefined && state !== undefined && (
                                    <>
                                        <Grid item xs={12}>
                                            <FormLabel>Home assistant binary sensors</FormLabel>{' '}
                                        </Grid>
                                        <Grid item xs={12}>
                                            <List dense={true}>
                                                {Object.keys(device?.binarysensors).map((key, index) => {
                                                    return (
                                                        <BinarySensor
                                                            key={key}
                                                            item={device?.binarysensors[key]}
                                                            value={state}
                                                            renameAction={undefined}
                                                        />
                                                    );
                                                })}
                                            </List>
                                        </Grid>
                                    </>
                                )}
                                {device?.covers !== undefined && state !== undefined && (
                                    <>
                                        <Grid item xs={12}>
                                            <FormLabel>Home assistant covers</FormLabel>{' '}
                                        </Grid>
                                        <Grid item xs={12}>
                                            <List dense={true}>
                                                {Object.keys(device?.covers).map((key, index) => {
                                                    return (
                                                        <Cover
                                                            key={key}
                                                            item={device?.covers[key]}
                                                            value={state}
                                                            renameAction={undefined}
                                                        />
                                                    );
                                                })}
                                            </List>
                                        </Grid>
                                    </>
                                )}
                                {device?.selects !== undefined && state !== undefined && (
                                    <>
                                        <Grid item xs={12}>
                                            <FormLabel>Home assistant selects</FormLabel>{' '}
                                        </Grid>
                                        <Grid item xs={12}>
                                            <List dense={true}>
                                                {Object.keys(device?.selects).map((key, index) => {
                                                    return (
                                                        <Select
                                                            key={key}
                                                            item={device?.selects[key]}
                                                            value={state}
                                                            renameAction={undefined}
                                                        />
                                                    );
                                                })}
                                            </List>
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                        </CardContent>
                    </Card>
                </TabPanel>
                <TabPanel value="3">
                    <Card sx={{ width: '100%' }}>
                        <CardContent>
                            <pre>{JSON.stringify(state, null, 2)}</pre>
                        </CardContent>
                    </Card>
                </TabPanel>
            </TabContext>

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
