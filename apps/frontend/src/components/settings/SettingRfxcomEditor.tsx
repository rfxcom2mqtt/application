import * as React from 'react';
import { SettingRfxcom } from '../../models/shared';
import SettingField from './SettingField';
import SettingSwitch from './SettingSwitch';

interface RfxcomProps {
    settings: SettingRfxcom;
    handleChange: (rfxcom: SettingRfxcom) => void;
}

function SettingRfxcomEditor(props: RfxcomProps) {
    const [state, setState] = React.useState<SettingRfxcom>();

    React.useEffect(() => {
        setState(props.settings);
    }, [props.settings]);

    React.useEffect(() => {
        if (state !== undefined) {
            props.handleChange(state);
        }
    }, [state, props]);

    const updateField = (field: keyof SettingRfxcom, value: string | boolean) => {
        setState(prevState => prevState ? { ...prevState, [field]: value } : undefined);
    };

    if (!state) {
        return null;
    }

    return (
        <>
            <SettingField
                id="rfxcom-port"
                label="Port"
                value={state.usbport}
                onChange={(value) => updateField('usbport', value)}
                helperText="Location of the adapter."
            />
            
            <SettingSwitch
                id="rfxcom-debug"
                label="Debug"
                checked={state.debug}
                onChange={(checked) => updateField('debug', checked)}
                helperText="Enable rfxcom debug"
            />
        </>
    );
}
export default SettingRfxcomEditor;
