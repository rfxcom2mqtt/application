import React from 'react';
import { 
    Box, 
    Typography, 
    Divider, 
    Paper,
    Select,
    MenuItem,
    SelectChangeEvent,
    FormControl,
    Alert,
    Chip
} from '@mui/material';
import { 
    BugReport as DebugIcon,
    Info as InfoIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    Settings as AdvancedIcon
} from '@mui/icons-material';

interface AdvancedSettingsProps {
    logLevel: string;
    onChange: (logLevel: string) => void;
}

const logLevels = [
    { 
        value: 'debug', 
        label: 'DEBUG', 
        description: 'Detailed information for diagnosing problems',
        icon: <DebugIcon />,
        color: 'info' as const
    },
    { 
        value: 'info', 
        label: 'INFO', 
        description: 'General information about system operation',
        icon: <InfoIcon />,
        color: 'success' as const
    },
    { 
        value: 'warn', 
        label: 'WARN', 
        description: 'Warning messages for potential issues',
        icon: <WarningIcon />,
        color: 'warning' as const
    },
    { 
        value: 'error', 
        label: 'ERROR', 
        description: 'Error messages for serious problems',
        icon: <ErrorIcon />,
        color: 'error' as const
    }
];

function AdvancedSettings({ logLevel, onChange }: AdvancedSettingsProps) {
    const currentLogLevel = logLevels.find(level => level.value === logLevel) || logLevels[1];

    const SettingGroup = ({ 
        title, 
        icon, 
        children, 
        description 
    }: { 
        title: string; 
        icon: React.ReactNode; 
        children: React.ReactNode;
        description?: string;
    }) => (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    color: 'primary.main',
                    mr: 1
                }}>
                    {icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {title}
                </Typography>
            </Box>
            {description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {description}
                </Typography>
            )}
            <Divider sx={{ mb: 3 }} />
            {children}
        </Paper>
    );

    return (
        <Box>
            <SettingGroup
                title="Logging Configuration"
                icon={<AdvancedIcon />}
                description="Configure the verbosity of system logging for troubleshooting and monitoring"
            >
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography 
                            variant="subtitle2" 
                            component="label" 
                            htmlFor="logLevel"
                            sx={{ 
                                fontWeight: 600,
                                color: 'text.primary',
                                mr: 2
                            }}
                        >
                            Log Level
                        </Typography>
                        <Chip 
                            icon={currentLogLevel.icon}
                            label={currentLogLevel.label}
                            color={currentLogLevel.color}
                            size="small"
                            variant="outlined"
                        />
                    </Box>

                    <FormControl fullWidth>
                        <Select
                            value={logLevel}
                            id="logLevel"
                            onChange={(event: SelectChangeEvent) => {
                                onChange(event.target.value);
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'background.paper',
                                }
                            }}
                        >
                            {logLevels.map((level) => (
                                <MenuItem key={level.value} value={level.value}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            color: `${level.color}.main`,
                                            mr: 2
                                        }}>
                                            {level.icon}
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                {level.label}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {level.description}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{ 
                            mt: 1, 
                            display: 'block',
                            lineHeight: 1.4
                        }}
                    >
                        {currentLogLevel.description}
                    </Typography>
                </Box>

                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Log Level Guidelines:</strong>
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                        <li><strong>DEBUG:</strong> Use for development and detailed troubleshooting</li>
                        <li><strong>INFO:</strong> Recommended for normal operation</li>
                        <li><strong>WARN:</strong> Use to reduce log verbosity while catching issues</li>
                        <li><strong>ERROR:</strong> Only log serious errors and failures</li>
                    </Box>
                </Alert>

                {logLevel === 'debug' && (
                    <Alert severity="warning">
                        <Typography variant="body2">
                            <strong>Debug mode enabled:</strong> This will generate verbose logs that may impact performance. 
                            Consider using INFO level for production environments.
                        </Typography>
                    </Alert>
                )}

                {logLevel === 'error' && (
                    <Alert severity="warning">
                        <Typography variant="body2">
                            <strong>Error-only logging:</strong> Only critical errors will be logged. 
                            This may make troubleshooting difficult if issues arise.
                        </Typography>
                    </Alert>
                )}
            </SettingGroup>

            <SettingGroup
                title="System Information"
                icon={<InfoIcon />}
                description="Additional system configuration and maintenance options"
            >
                <Alert severity="info">
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Configuration Notes:</strong>
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                        <li>Log level changes take effect immediately</li>
                        <li>Logs are written to the system console and log files</li>
                        <li>Consider log rotation for long-running systems</li>
                        <li>Higher verbosity levels may impact system performance</li>
                    </Box>
                </Alert>
            </SettingGroup>
        </Box>
    );
}

export default AdvancedSettings;
