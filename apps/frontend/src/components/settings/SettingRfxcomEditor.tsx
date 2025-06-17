import * as React from 'react';

import FormGroup from '@mui/material/FormGroup';
import { FormLabel } from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import { SettingRfxcom } from '../../models/shared';

interface RfxcomProps {
    settings: SettingRfxcom;
    handleChange: (rfxcom: SettingRfxcom) => void;
}

function SettingRfxcomEditor(props: RfxcomProps) {
    const rfxcomDebuglabel = { inputProps: { 'aria-label': 'Debug' } };
    const [state, setState] = React.useState<SettingRfxcom>();

    React.useEffect(() => {
        setState(props.settings);
    }, []);

    React.useEffect(() => {
        if (state !== undefined) {
            props.handleChange(state);
        }
    }, [state]);

    return (
        <>
            {state !== undefined && (
                <div>
                    <FormGroup>
                        <FormLabel>Port : </FormLabel>
                        <TextField
                            id="rfxcom-port"
                            variant="outlined"
                            value={state.usbport}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setState({ ...state, usbport: event.target.value });
                            }}
                        />
                        <FormHelperText>Location of the adapter.</FormHelperText>
                        <FormLabel>Debug : </FormLabel>
                        <Switch
                            {...rfxcomDebuglabel}
                            checked={state.debug}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setState({ ...state, debug: event.target.checked });
                            }}
                        />
                        <FormHelperText>Enable rfxcom debug</FormHelperText>
                    </FormGroup>
                </div>
            )}
        </>
    );
}
export default SettingRfxcomEditor;
