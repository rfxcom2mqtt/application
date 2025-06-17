import * as React from 'react';

import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import { FormLabel } from '@mui/material';
import Grid from '@mui/material/Grid';
import CardHeader from '@mui/material/CardHeader';
import { DeviceSwitch, KeyValue } from '../../models/shared';
import { Button } from '@mui/material';

import { Description } from '@mui/icons-material';

interface SwitchProps {
    item: DeviceSwitch;
    value: KeyValue[];
    action: any;
    renameAction?: any;
}

function SwitchItem(props: SwitchProps) {
    const item = props.item;

    const styles = {
        value: {
            display: 'flex',
            webkitBoxAlign: 'center',
            alignItems: 'center',
            padding: '16px',
            marginBottom: '24px',
        },
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.action(item, event.target.checked ? item.value_on : item.value_off);
        setValue(event.target.checked);
    };

    const handleRename = () => {
        props.renameAction(item);
    };

    const getSwitchValue = (props: SwitchProps) => {
        const property = props.item.property;
        const id = props.item.id;
        let value;
        let found = false;
        for (const entity in props.value) {
            if (props.value[entity].entityId === id) {
                value = props.value[entity][property];
                found = true;
            }
        }
        if (!found) {
            value = props.value[0][property];
        }
        return value;
    };
    const [value, setValue] = React.useState<boolean>(getSwitchValue(props) === item.value_on);

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <CardHeader
                        title={item.name}
                        subheader={item.description}
                        sx={{ mb: 3 }}
                        avatar={
                            props.renameAction !== undefined && (
                                <Button onClick={handleRename}>
                                    {' '}
                                    <Description />
                                </Button>
                            )
                        }
                    />
                </Grid>
                <Grid item xs={6}>
                    <FormLabel style={styles.value}>
                        <Switch checked={value} onChange={handleChange} />
                    </FormLabel>
                </Grid>
            </Grid>
            <Divider />
        </>
    );
}
export default SwitchItem;
