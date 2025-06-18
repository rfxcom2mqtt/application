import React from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
    
    return (
        <>
            {/* Device Information */}
            <Card sx={{ mb: 3, borderRadius: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <Info sx={{ mr: 1 }} />
                        {t('deviceInfo.title')}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <List dense>
                        <ListItem>
                            <ListItemText 
                                primary={t('deviceInfo.name')} 
                                secondary={device.name}
                            />
                        </ListItem>
                        
                        {device.name !== device.originalName && device.originalName && (
                            <ListItem>
                                <ListItemText 
                                    primary={t('deviceInfo.originalName')} 
                                    secondary={device.originalName}
                                />
                            </ListItem>
                        )}
                        
                        <ListItem>
                            <ListItemText 
                                primary={t('deviceInfo.rfxcomId')} 
                                secondary={device.id}
                            />
                        </ListItem>
                        
                        <ListItem>
                            <ListItemText 
                                primary={t('deviceInfo.manufacturer')} 
                                secondary={device.manufacturer || t('common.unknown')}
                            />
                        </ListItem>
                        
                        <ListItem>
                            <ListItemText 
                                primary={t('deviceInfo.type')} 
                                secondary={device.type}
                            />
                        </ListItem>
                        
                        <ListItem>
                            <ListItemText 
                                primary={t('deviceInfo.subtype')} 
                                secondary={device.subTypeValue || t('deviceInfo.notApplicable')}
                            />
                        </ListItem>
                        
                        <ListItem>
                            <ListItemText 
                                primary={t('deviceInfo.entities')} 
                                secondary={t('deviceInfo.totalEntities', { count: entityCounts.total })}
                            />
                        </ListItem>
                    </List>
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        {t('deviceInfo.quickStats')}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2}>
                        {Number(entityCounts.sensors) > 0 && (
                            <Grid item xs={6}>
                                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white', borderRadius: 2 }}>
                                    <Typography variant="h4">{Number(entityCounts.sensors)}</Typography>
                                    <Typography variant="body2">{t('deviceInfo.sensors')}</Typography>
                                </Paper>
                            </Grid>
                        )}
                        
                        {Number(entityCounts.switches) > 0 && (
                            <Grid item xs={6}>
                                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light', color: 'white', borderRadius: 2 }}>
                                    <Typography variant="h4">{Number(entityCounts.switches)}</Typography>
                                    <Typography variant="body2">{t('deviceInfo.switches')}</Typography>
                                </Paper>
                            </Grid>
                        )}
                        
                        {Number(entityCounts.binarySensors) > 0 && (
                            <Grid item xs={6}>
                                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white', borderRadius: 2 }}>
                                    <Typography variant="h4">{Number(entityCounts.binarySensors)}</Typography>
                                    <Typography variant="body2">{t('deviceInfo.binarySensors')}</Typography>
                                </Paper>
                            </Grid>
                        )}
                        
                        {Number(entityCounts.covers) > 0 && (
                            <Grid item xs={6}>
                                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'white', borderRadius: 2 }}>
                                    <Typography variant="h4">{Number(entityCounts.covers)}</Typography>
                                    <Typography variant="body2">{t('deviceInfo.covers')}</Typography>
                                </Paper>
                            </Grid>
                        )}

                        {Number(entityCounts.selects) > 0 && (
                            <Grid item xs={6}>
                                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'white', borderRadius: 2 }}>
                                    <Typography variant="h4">{Number(entityCounts.selects)}</Typography>
                                    <Typography variant="body2">{t('deviceInfo.selects')}</Typography>
                                </Paper>
                            </Grid>
                        )}
                        
                        {/* Show message when no entities are available */}
                        {Number(entityCounts.total) === 0 && (
                            <Grid item xs={12}>
                                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.100', borderRadius: 2 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        {t('deviceInfo.noEntities')}
                                    </Typography>
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
