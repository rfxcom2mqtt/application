import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Card,
    CardContent,
    Typography,
    Box,
    IconButton,
    Tooltip,
    Stack,
    Chip,
    LinearProgress,
} from '@mui/material';
import {
    Edit,
    ThermostatAuto,
    Speed,
    Battery4Bar,
    Opacity,
    ElectricBolt,
    Sensors,
} from '@mui/icons-material';
import { DeviceSensor, KeyValue } from '../../models/shared';

interface SensorProps {
    sensor: DeviceSensor;
    value: KeyValue[];
    renameAction?: (sensor: DeviceSensor) => void;
}

function Sensor(props: SensorProps) {
    const { t } = useTranslation();
    const { sensor, value, renameAction } = props;

    const getValue = (): string => {
        const property = sensor.property;
        const id = sensor.id;
        
        for (const entity of value) {
            if (entity.entityId === id) {
                return entity[property]?.toString() || t('deviceInfo.notApplicable');
            }
        }
        
        // Fallback to first entity if no match found
        if (value.length > 0) {
            return value[0][property]?.toString() || t('deviceInfo.notApplicable');
        }
        
        return t('deviceInfo.notApplicable');
    };

    const handleRename = () => {
        if (renameAction) {
            renameAction(sensor);
        }
    };

    const getSensorIcon = (name: string, type?: string) => {
        const lowerName = name.toLowerCase();
        const lowerType = type?.toLowerCase() || '';
        
        if (lowerName.includes('temperature') || lowerType.includes('temperature')) {
            return <ThermostatAuto />;
        }
        if (lowerName.includes('humidity') || lowerType.includes('humidity')) {
            return <Opacity />;
        }
        if (lowerName.includes('battery') || lowerType.includes('battery')) {
            return <Battery4Bar />;
        }
        if (lowerName.includes('power') || lowerName.includes('energy') || lowerType.includes('power')) {
            return <ElectricBolt />;
        }
        if (lowerName.includes('speed') || lowerType.includes('speed')) {
            return <Speed />;
        }
        
        return <Sensors />;
    };

    const getValueColor = (val: string, unit?: string) => {
        const numValue = parseFloat(val);
        
        if (isNaN(numValue)) return 'text.primary';
        
        // Temperature color coding
        if (unit?.toLowerCase().includes('°c') || unit?.toLowerCase().includes('celsius')) {
            if (numValue < 0) return 'info.main';
            if (numValue < 15) return 'primary.main';
            if (numValue < 25) return 'success.main';
            if (numValue < 35) return 'warning.main';
            return 'error.main';
        }
        
        // Humidity color coding
        if (unit?.toLowerCase().includes('%') && sensor.name.toLowerCase().includes('humidity')) {
            if (numValue < 30) return 'warning.main';
            if (numValue > 70) return 'info.main';
            return 'success.main';
        }
        
        // Battery color coding
        if (unit?.toLowerCase().includes('%') && sensor.name.toLowerCase().includes('battery')) {
            if (numValue < 20) return 'error.main';
            if (numValue < 50) return 'warning.main';
            return 'success.main';
        }
        
        return 'text.primary';
    };

    const getProgressValue = (val: string, unit?: string): number | null => {
        const numValue = parseFloat(val);
        
        if (isNaN(numValue)) return null;
        
        // Percentage values
        if (unit?.toLowerCase().includes('%')) {
            return Math.min(Math.max(numValue, 0), 100);
        }
        
        // Temperature (assuming -20 to 50°C range)
        if (unit?.toLowerCase().includes('°c')) {
            return Math.min(Math.max(((numValue + 20) / 70) * 100, 0), 100);
        }
        
        return null;
    };

    const currentValue = getValue();
    const progressValue = getProgressValue(currentValue, sensor.unit_of_measurement);
    const valueColor = getValueColor(currentValue, sensor.unit_of_measurement);

    return (
        <Card 
            sx={{ 
                height: '100%',
                transition: 'all 0.2s ease',
                '&:hover': {
                    boxShadow: 2,
                },
            }}
        >
            <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, mr: 1 }}>
                        <Box sx={{ mr: 1.5, color: 'primary.main' }}>
                            {getSensorIcon(sensor.name, sensor.type)}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" component="h3" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600 }}>
                                {sensor.name}
                            </Typography>
                            {sensor.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {sensor.description}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    
                    {renameAction && (
                        <Tooltip title={t('device.actions.renameSensor')}>
                            <IconButton 
                                onClick={handleRename} 
                                size="small"
                                sx={{ 
                                    opacity: 0.7,
                                    '&:hover': { opacity: 1 }
                                }}
                            >
                                <Edit fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>

                {/* Value Display */}
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography 
                        variant="h4" 
                        component="div" 
                        sx={{ 
                            fontWeight: 'bold',
                            color: valueColor,
                            mb: 0.5
                        }}
                    >
                        {currentValue}
                        {sensor.unit_of_measurement && (
                            <Typography 
                                component="span" 
                                variant="h6" 
                                sx={{ ml: 0.5, color: 'text.secondary' }}
                            >
                                {sensor.unit_of_measurement}
                            </Typography>
                        )}
                    </Typography>
                    
                    {/* Progress bar for percentage and temperature values */}
                    {progressValue !== null && (
                        <Box sx={{ mt: 1 }}>
                            <LinearProgress 
                                variant="determinate" 
                                value={progressValue}
                                sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    '& .MuiLinearProgress-bar': {
                                        backgroundColor: valueColor,
                                    }
                                }}
                            />
                        </Box>
                    )}
                </Box>

                {/* Additional Info */}
                <Box sx={{ pt: 1 }}>
                    <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                        {sensor.type && (
                            <Chip 
                                label={sensor.type}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                            />
                        )}
                        
                        <Typography variant="caption" color="text.secondary">
                            {t('sensor.id')}: {sensor.id}
                        </Typography>
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
}

export default Sensor;
