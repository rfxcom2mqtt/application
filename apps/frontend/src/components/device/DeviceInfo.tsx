import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Divider,
    List,
    ListItem,
    ListItemText,
    Grid,
    Paper,
} from '@mui/material';
import { Info } from '@mui/icons-material';

interface DeviceInfoProps {
    device: {
        id: string;
        name: string;
        originalName?: string;
        manufacturer?: string;
        type: string;
        subTypeValue?: string;
    };
    entityCounts: {
        sensors?: number;
        switches?: number;
        binarySensors?: number;
        covers?: number;
        selects?: number;
        total: number;
    };
}

function DeviceInfo({ device, entityCounts }: DeviceInfoProps) {
    return (
        <>
            {/* Device Information */}
            <Card sx={{ mb: 3, borderRadius: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <Info sx={{ mr: 1 }} />
                        Device Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <List dense>
                        <ListItem>
                            <ListItemText 
                                primary="Name" 
                                secondary={device.name}
                            />
                        </ListItem>
                        
                        {device.name !== device.originalName && device.originalName && (
                            <ListItem>
                                <ListItemText 
                                    primary="Original Name" 
                                    secondary={device.originalName}
                                />
                            </ListItem>
                        )}
                        
                        <ListItem>
                            <ListItemText 
                                primary="RFXCOM ID" 
                                secondary={device.id}
                            />
                        </ListItem>
                        
                        <ListItem>
                            <ListItemText 
                                primary="Manufacturer" 
                                secondary={device.manufacturer || 'Unknown'}
                            />
                        </ListItem>
                        
                        <ListItem>
                            <ListItemText 
                                primary="Type" 
                                secondary={device.type}
                            />
                        </ListItem>
                        
                        <ListItem>
                            <ListItemText 
                                primary="Subtype" 
                                secondary={device.subTypeValue || 'N/A'}
                            />
                        </ListItem>
                        
                        <ListItem>
                            <ListItemText 
                                primary="Entities" 
                                secondary={`${entityCounts.total} total entities`}
                            />
                        </ListItem>
                    </List>
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Quick Stats
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2}>
                        {entityCounts.sensors && entityCounts.sensors > 0 && (
                            <Grid item xs={6}>
                                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white', borderRadius: 2 }}>
                                    <Typography variant="h4">{entityCounts.sensors}</Typography>
                                    <Typography variant="body2">Sensors</Typography>
                                </Paper>
                            </Grid>
                        )}
                        
                        {entityCounts.switches && entityCounts.switches > 0 && (
                            <Grid item xs={6}>
                                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light', color: 'white', borderRadius: 2 }}>
                                    <Typography variant="h4">{entityCounts.switches}</Typography>
                                    <Typography variant="body2">Switches</Typography>
                                </Paper>
                            </Grid>
                        )}
                        
                        {entityCounts.binarySensors && entityCounts.binarySensors > 0 && (
                            <Grid item xs={6}>
                                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white', borderRadius: 2 }}>
                                    <Typography variant="h4">{entityCounts.binarySensors}</Typography>
                                    <Typography variant="body2">Binary Sensors</Typography>
                                </Paper>
                            </Grid>
                        )}
                        
                        {entityCounts.covers && entityCounts.covers > 0 && (
                            <Grid item xs={6}>
                                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'white', borderRadius: 2 }}>
                                    <Typography variant="h4">{entityCounts.covers}</Typography>
                                    <Typography variant="body2">Covers</Typography>
                                </Paper>
                            </Grid>
                        )}

                        {entityCounts.selects && entityCounts.selects > 0 && (
                            <Grid item xs={6}>
                                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'white', borderRadius: 2 }}>
                                    <Typography variant="h4">{entityCounts.selects}</Typography>
                                    <Typography variant="body2">Selects</Typography>
                                </Paper>
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </Card>
        </>
    );
}

export default DeviceInfo;
