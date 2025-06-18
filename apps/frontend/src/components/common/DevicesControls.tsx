import React from 'react';
import {
    Card,
    CardContent,
    Grid,
    TextField,
    InputAdornment,
    IconButton,
    Button,
    Stack,
    Tooltip,
} from '@mui/material';
import {
    Search,
    Refresh,
    RestartAlt,
    DeleteSweep,
    GridView,
    ViewList,
} from '@mui/icons-material';

interface DevicesControlsProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filterType: string;
    onFilterChange: (value: string) => void;
    viewMode: 'grid' | 'list';
    onViewModeChange: () => void;
    onRefresh: () => void;
    onResetState: () => void;
    onResetDevices: () => void;
    deviceTypes: string[];
}

function DevicesControls({
    searchTerm,
    onSearchChange,
    filterType,
    onFilterChange,
    viewMode,
    onViewModeChange,
    onRefresh,
    onResetState,
    onResetDevices,
    deviceTypes,
}: DevicesControlsProps) {
    return (
        <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent>
                <Grid container spacing={2} alignItems="center">
                    {/* Search */}
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            placeholder="Search devices..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            }}
                            size="small"
                        />
                    </Grid>

                    {/* Filter */}
                    <Grid item xs={12} md={3}>
                        <TextField
                            select
                            fullWidth
                            label="Filter by type"
                            value={filterType}
                            onChange={(e) => onFilterChange(e.target.value)}
                            SelectProps={{ native: true }}
                            size="small"
                        >
                            <option value="all">All Types</option>
                            {deviceTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Actions */}
                    <Grid item xs={12} md={5}>
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="Toggle view mode">
                                <IconButton 
                                    onClick={onViewModeChange}
                                    color={viewMode === 'grid' ? 'primary' : 'default'}
                                >
                                    {viewMode === 'grid' ? <GridView /> : <ViewList />}
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Refresh devices">
                                <IconButton onClick={onRefresh} color="primary">
                                    <Refresh />
                                </IconButton>
                            </Tooltip>
                            <Button
                                variant="outlined"
                                startIcon={<RestartAlt />}
                                onClick={onResetState}
                                size="small"
                            >
                                Reset State
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<DeleteSweep />}
                                onClick={onResetDevices}
                                size="small"
                                color="warning"
                            >
                                Reset Devices
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}

export default DevicesControls;
