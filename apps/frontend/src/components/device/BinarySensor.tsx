import * as React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    IconButton,
    Tooltip,
    Stack,
    Chip,
} from '@mui/material';
import {
    Edit,
    CheckCircle,
    Cancel,
    Sensors,
    Security,
    DoorFront,
    Window,
    DirectionsRun,
    WaterDrop,
} from '@mui/icons-material';
import { DeviceBinarySensor, KeyValue } from '../../models/shared';

interface BinarySensorProps {
    item: DeviceBinarySensor;
    value: KeyValue[];
    renameAction?: (item: DeviceBinarySensor) => void;
}

function BinarySensor(props: BinarySensorProps) {
    const { item, value, renameAction } = props;

    const getValue = (): boolean => {
        const property = item.property;
        const id = item.id;
        
        for (const entity of value) {
            if (entity.entityId === id) {
                const val = entity[property];
                return val === item.value_on || val === true;
            }
        }
        
        // Fallback to first entity if no match found
        if (value.length > 0) {
            const val = value[0][property];
            return val === item.value_on || val === true;
        }
        
        return false;
    };

    const handleRename = () => {
        if (renameAction) {
            renameAction(item);
        }
    };

    const getSensorIcon = (name: string, type?: string) => {
        const lowerName = name.toLowerCase();
        const lowerType = type?.toLowerCase() || '';
        
        if (lowerName.includes('door') || lowerType.includes('door')) {
            return <DoorFront />;
        }
        if (lowerName.includes('window') || lowerType.includes('window')) {
            return <Window />;
        }
        if (lowerName.includes('motion') || lowerName.includes('movement') || lowerType.includes('motion')) {
            return <DirectionsRun />;
        }
        if (lowerName.includes('water') || lowerName.includes('leak') || lowerType.includes('moisture')) {
            return <WaterDrop />;
        }
        if (lowerName.includes('security') || lowerName.includes('alarm') || lowerType.includes('security')) {
            return <Security />;
        }
        
        return <Sensors />;
    };

    const getStatusInfo = (isActive: boolean, name: string) => {
        const lowerName = name.toLowerCase();
        
        // Door/Window sensors
        if (lowerName.includes('door') || lowerName.includes('window')) {
            return {
                label: isActive ? 'Open' : 'Closed',
                color: isActive ? 'warning' : 'success',
                icon: isActive ? <DoorFront /> : <DoorFront />
            };
        }
        
        // Motion sensors
        if (lowerName.includes('motion') || lowerName.includes('movement')) {
            return {
                label: isActive ? 'Motion Detected' : 'No Motion',
                color: isActive ? 'error' : 'success',
                icon: isActive ? <DirectionsRun /> : <DirectionsRun />
            };
        }
        
        // Water/Leak sensors
        if (lowerName.includes('water') || lowerName.includes('leak')) {
            return {
                label: isActive ? 'Water Detected' : 'Dry',
                color: isActive ? 'error' : 'success',
                icon: isActive ? <WaterDrop /> : <WaterDrop />
            };
        }
        
        // Security/Alarm sensors
        if (lowerName.includes('security') || lowerName.includes('alarm')) {
            return {
                label: isActive ? 'Triggered' : 'Normal',
                color: isActive ? 'error' : 'success',
                icon: isActive ? <Security /> : <Security />
            };
        }
        
        // Generic binary sensor
        return {
            label: isActive ? 'Active' : 'Inactive',
            color: isActive ? 'primary' : 'default',
            icon: isActive ? <CheckCircle /> : <Cancel />
        };
    };

    const currentValue = getValue();
    const statusInfo = getStatusInfo(currentValue, item.name);

    return (
        <Card 
            sx={{ 
                height: '100%',
                transition: 'all 0.2s ease',
                '&:hover': {
                    boxShadow: 2,
                },
                border: currentValue ? '2px solid' : '1px solid',
                borderColor: currentValue ? `${statusInfo.color}.main` : 'divider',
            }}
        >
            <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, mr: 1 }}>
                        <Box sx={{ mr: 1.5, color: currentValue ? `${statusInfo.color}.main` : 'text.disabled' }}>
                            {getSensorIcon(item.name, item.type)}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" component="h3" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600 }}>
                                {item.name}
                            </Typography>
                            {item.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {item.description}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    
                    {renameAction && (
                        <Tooltip title="Rename binary sensor">
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

                {/* Status Display */}
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                        <Box sx={{ 
                            color: currentValue ? `${statusInfo.color}.main` : 'text.disabled',
                            fontSize: 48,
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            {statusInfo.icon}
                        </Box>
                    </Box>
                    
                    <Chip 
                        label={statusInfo.label}
                        color={statusInfo.color as any}
                        variant={currentValue ? 'filled' : 'outlined'}
                        sx={{ 
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                            minWidth: 100
                        }}
                    />
                </Box>

                {/* Additional Info */}
                <Box sx={{ pt: 1 }}>
                    <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                        {item.type && (
                            <Chip 
                                label={item.type}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                            />
                        )}
                        
                        <Typography variant="caption" color="text.secondary">
                            ID: {item.id}
                        </Typography>
                    </Stack>
                    
                    <Stack direction="row" spacing={2} sx={{ mt: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
                        <Typography variant="caption">
                            ON: {item.value_on.toString()}
                        </Typography>
                        <Typography variant="caption">
                            OFF: {item.value_off.toString()}
                        </Typography>
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
}

export default BinarySensor;
