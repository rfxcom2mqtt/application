import * as React from 'react';
import { SettingRfxcom } from '../../models/shared';
import SettingField from './SettingField';
import SettingSwitch from './SettingSwitch';

interface RfxcomProps {
  settings: SettingRfxcom;
  handleChange: (rfxcom: SettingRfxcom) => void;
}

function SettingRfxcomEditor(props: RfxcomProps) {
  const updateField = (field: keyof SettingRfxcom, value: string | boolean) => {
    props.handleChange({ ...props.settings, [field]: value });
  };

  return (
    <>
      <SettingField
        id="rfxcom-port"
        label="Port"
        value={props.settings.usbport}
        onChange={value => updateField('usbport', value)}
        helperText="Location of the adapter."
      />

      <SettingSwitch
        id="rfxcom-debug"
        label="Debug"
        checked={props.settings.debug}
        onChange={checked => updateField('debug', checked)}
        helperText="Enable rfxcom debug"
      />
    </>
  );
}
export default SettingRfxcomEditor;
