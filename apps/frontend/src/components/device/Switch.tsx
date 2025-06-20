import * as React from 'react';
import {
  Switch,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Stack,
  Chip,
} from '@mui/material';
import { Edit, PowerSettingsNew, ToggleOn, ToggleOff } from '@mui/icons-material';
import { DeviceSwitch, KeyValue } from '../../models/shared';

interface SwitchProps {
  item: DeviceSwitch;
  value: KeyValue[];
  action: (item: DeviceSwitch, action: string) => void;
  renameAction?: (item: DeviceSwitch) => void;
}

function SwitchItem(props: SwitchProps) {
  const { item, value, action, renameAction } = props;

  const getSwitchValue = (): boolean => {
    const property = item.property;
    const id = item.id;

    for (const entity of value) {
      if (entity.entityId === id) {
        return entity[property] === item.value_on;
      }
    }

    // Fallback to first entity if no match found
    if (value.length > 0) {
      return value[0][property] === item.value_on;
    }

    return false;
  };

  const [switchValue, setSwitchValue] = React.useState<boolean>(getSwitchValue());

  React.useEffect(() => {
    setSwitchValue(getSwitchValue());
  }, [value, item]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    const actionValue = newValue ? item.value_on : item.value_off;

    setSwitchValue(newValue);
    action(item, actionValue);
  };

  const handleRename = () => {
    if (renameAction) {
      renameAction(item);
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 2,
        },
        border: switchValue ? '2px solid' : '1px solid',
        borderColor: switchValue ? 'primary.main' : 'divider',
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box
          sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}
        >
          <Box sx={{ flexGrow: 1, mr: 1 }}>
            <Typography
              variant="h6"
              component="h3"
              gutterBottom
              sx={{ fontSize: '1rem', fontWeight: 600 }}
            >
              {item.name}
            </Typography>
            {item.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {item.description}
              </Typography>
            )}
          </Box>

          {renameAction && (
            <Tooltip title="Rename switch">
              <IconButton
                onClick={handleRename}
                size="small"
                sx={{
                  opacity: 0.7,
                  '&:hover': { opacity: 1 },
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {switchValue ? (
                <ToggleOn sx={{ color: 'primary.main', fontSize: 28 }} />
              ) : (
                <ToggleOff sx={{ color: 'text.disabled', fontSize: 28 }} />
              )}
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <Chip
                label={switchValue ? 'ON' : 'OFF'}
                color={switchValue ? 'success' : 'default'}
                size="small"
                variant={switchValue ? 'filled' : 'outlined'}
              />
            </Box>
          </Stack>

          <Switch
            checked={switchValue}
            onChange={handleChange}
            color="primary"
            size="medium"
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: 'primary.main',
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: 'primary.main',
              },
            }}
          />
        </Box>

        {/* Additional info */}
        <Box sx={{ mt: 2, pt: 1 }}>
          <Stack direction="row" spacing={2} sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            <Typography variant="caption">ON: {item.value_on}</Typography>
            <Typography variant="caption">OFF: {item.value_off}</Typography>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}

export default SwitchItem;
