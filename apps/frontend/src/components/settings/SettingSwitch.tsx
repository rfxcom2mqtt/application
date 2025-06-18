import React from 'react';
import { 
    Box, 
    Typography, 
    Switch, 
    FormControlLabel,
    Tooltip,
    IconButton,
    Paper,
    alpha,
    useTheme
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

interface SettingSwitchProps {
    id: string;
    label: string;
    checked: boolean | undefined;
    onChange: (checked: boolean) => void;
    helperText?: string;
    disabled?: boolean;
}

function SettingSwitch({ id, label, checked, onChange, helperText, disabled = false }: SettingSwitchProps) {
    const theme = useTheme();
    
    return (
        <Box sx={{ mb: 3 }}>
            <Paper 
                variant="outlined" 
                sx={{ 
                    p: 2.5,
                    backgroundColor: checked ? alpha(theme.palette.primary.main, 0.04) : 'background.paper',
                    borderColor: checked ? alpha(theme.palette.primary.main, 0.2) : 'divider',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        backgroundColor: checked 
                            ? alpha(theme.palette.primary.main, 0.06) 
                            : alpha(theme.palette.action.hover, 0.04),
                        borderColor: checked 
                            ? alpha(theme.palette.primary.main, 0.3) 
                            : alpha(theme.palette.action.hover, 0.2),
                    }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: helperText ? 0.5 : 0 }}>
                                <Typography 
                                    variant="subtitle2" 
                                    component="label" 
                                    htmlFor={id}
                                    sx={{ 
                                        fontWeight: 600,
                                        color: 'text.primary',
                                        cursor: disabled ? 'default' : 'pointer'
                                    }}
                                >
                                    {label}
                                </Typography>
                                {helperText && (
                                    <Tooltip title={helperText} placement="top">
                                        <IconButton size="small" sx={{ ml: 0.5, p: 0.25 }}>
                                            <InfoIcon fontSize="small" color="action" />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Box>
                            
                            {helperText && (
                                <Typography 
                                    variant="caption" 
                                    color="text.secondary" 
                                    sx={{ 
                                        display: 'block',
                                        lineHeight: 1.4,
                                        maxWidth: '80%'
                                    }}
                                >
                                    {helperText}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    
                    <FormControlLabel
                        control={
                            <Switch
                                id={id}
                                checked={checked || false}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    onChange(event.target.checked);
                                }}
                                disabled={disabled}
                                color="primary"
                                size="medium"
                            />
                        }
                        label=""
                        sx={{ 
                            m: 0,
                            '& .MuiSwitch-root': {
                                ml: 1
                            }
                        }}
                    />
                </Box>
            </Paper>
        </Box>
    );
}

export default SettingSwitch;
