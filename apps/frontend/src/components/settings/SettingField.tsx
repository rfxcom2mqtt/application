import React from 'react';
import { Box, TextField, Typography, InputAdornment, Tooltip, IconButton } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

interface SettingFieldProps {
  id: string;
  label: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  helperText?: string;
  type?: 'text' | 'number' | 'url' | 'email';
  required?: boolean;
  placeholder?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
}

function SettingField({
  id,
  label,
  value,
  onChange,
  helperText,
  type = 'text',
  required = false,
  placeholder,
  startAdornment,
  endAdornment,
  multiline = false,
  rows = 1,
  disabled = false,
}: SettingFieldProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography
          variant="subtitle2"
          component="label"
          htmlFor={id}
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          {label}
          {required && (
            <Typography component="span" sx={{ color: 'error.main' }}>
              *
            </Typography>
          )}
        </Typography>
        {helperText && (
          <Tooltip title={helperText} placement="top">
            <IconButton size="small" sx={{ ml: 0.5, p: 0.25 }}>
              <InfoIcon fontSize="small" color="action" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <TextField
        id={id}
        fullWidth
        variant="outlined"
        type={type}
        value={value || ''}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          onChange(event.target.value);
        }}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        multiline={multiline}
        rows={multiline ? rows : undefined}
        InputProps={{
          startAdornment: startAdornment ? (
            <InputAdornment position="start">{startAdornment}</InputAdornment>
          ) : undefined,
          endAdornment: endAdornment ? (
            <InputAdornment position="end">{endAdornment}</InputAdornment>
          ) : undefined,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'background.paper',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
            '&.Mui-focused': {
              backgroundColor: 'background.paper',
            },
          },
        }}
      />

      {helperText && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            mt: 0.5,
            display: 'block',
            lineHeight: 1.4,
          }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
}

export default SettingField;
