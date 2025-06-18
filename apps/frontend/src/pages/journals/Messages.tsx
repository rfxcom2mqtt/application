import React, { useEffect, useState, useMemo } from 'react';
import { Socket } from 'socket.io-client';
import { WsMessage } from '../../models/shared';
import {
    Box,
    Button,
    Chip,
    Paper,
    Typography,
    Stack,
    IconButton,
    Tooltip,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Badge,
    Divider,
    Card,
    CardContent,
    useTheme,
    alpha,
    Fade,
    Collapse
} from '@mui/material';
import {
    Search as SearchIcon,
    Clear as ClearIcon,
    Refresh as RefreshIcon,
    FilterList as FilterIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Download as DownloadIcon,
    Pause as PauseIcon,
    PlayArrow as PlayIcon,
    BugReport as DebugIcon,
    Info as InfoIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    Schedule as ScheduleIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridToolbar, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import GridCellExpand from './GridCellExpand';
import CustomNoRowsOverlay from './CustomNoRowsOverlay';

interface MessagesProps {
    socket: Socket;
}

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'ALL';

function Messages(props: MessagesProps) {
    const socket = props.socket;
    const theme = useTheme();
    const [messages, setMessages] = useState<{ [s: string]: WsMessage }>({});
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [levelFilter, setLevelFilter] = useState<LogLevel>('ALL');
    const [labelFilter, setLabelFilter] = useState<string>('ALL');
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [autoScroll, setAutoScroll] = useState<boolean>(true);

    useEffect(() => {
        const messageListener = (message: WsMessage) => {
            if (!isPaused) {
                setMessages((prevMessages: { [s: string]: WsMessage }) => {
                    const newMessages: { [s: string]: WsMessage } = { ...prevMessages };
                    newMessages[message.id] = message;
                    return newMessages;
                });
            }
        };

        socket.on('log', messageListener);
        return () => {
            socket.off('log', messageListener);
        };
    }, [socket, isPaused]);

    // Get unique labels for filter dropdown
    const uniqueLabels = useMemo(() => {
        const labels = new Set(Object.values(messages).map(msg => msg.label));
        return Array.from(labels).sort();
    }, [messages]);

    // Filter messages based on search term, level, and label
    const filteredMessages = useMemo(() => {
        return Object.values(messages).filter(message => {
            const matchesSearch = searchTerm === '' || 
                message.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
                message.label.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesLevel = levelFilter === 'ALL' || message.level === levelFilter;
            const matchesLabel = labelFilter === 'ALL' || message.label === labelFilter;
            
            return matchesSearch && matchesLevel && matchesLabel;
        });
    }, [messages, searchTerm, levelFilter, labelFilter]);

    // Count messages by level
    const levelCounts = useMemo(() => {
        const counts = { DEBUG: 0, INFO: 0, WARN: 0, ERROR: 0 };
        Object.values(messages).forEach(msg => {
            if (counts.hasOwnProperty(msg.level)) {
                counts[msg.level as keyof typeof counts]++;
            }
        });
        return counts;
    }, [messages]);

    const clearLogs = () => {
        setMessages({});
    };

    const getAllLogs = () => {
        socket.emit('getAllLogs');
    };

    const exportLogs = () => {
        const logsText = filteredMessages
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
            .map(msg => `[${msg.time}] [${msg.level}] [${msg.label}] ${msg.value}`)
            .join('\n');
        
        const blob = new Blob([logsText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system-logs-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const togglePause = () => {
        setIsPaused(!isPaused);
    };

    function renderCellExpand(params: GridRenderCellParams<any, string>) {
        return <GridCellExpand value={params.value || ''} width={params.colDef.computedWidth} />;
    }

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'DEBUG': return <DebugIcon fontSize="small" />;
            case 'INFO': return <InfoIcon fontSize="small" />;
            case 'WARN': return <WarningIcon fontSize="small" />;
            case 'ERROR': return <ErrorIcon fontSize="small" />;
            default: return <InfoIcon fontSize="small" />;
        }
    };

    const getLevelColor = (level: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
        switch (level) {
            case 'DEBUG': return 'secondary';
            case 'INFO': return 'info';
            case 'WARN': return 'warning';
            case 'ERROR': return 'error';
            default: return 'default';
        }
    };

    const columns: GridColDef[] = [
        {
            field: 'level',
            headerName: 'Level',
            width: 120,
            editable: false,
            renderCell: (params: GridRenderCellParams<any, string>) => (
                <Chip 
                    icon={getLevelIcon(params.value!!)}
                    label={params.value} 
                    color={getLevelColor(params.value!!)} 
                    size="small"
                    variant="outlined"
                />
            ),
        },
        {
            field: 'time',
            headerName: 'Timestamp',
            width: 180,
            editable: false,
            renderCell: (params: GridRenderCellParams<any, number>) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon fontSize="small" color="action" />
                    <Typography variant="body2" fontFamily="monospace">
                        {params.value ? new Date(params.value).toLocaleString() : 'N/A'}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'label',
            headerName: 'Component',
            width: 150,
            editable: false,
            renderCell: (params: GridRenderCellParams<any, string>) => (
                <Chip 
                    label={params.value} 
                    size="small"
                    variant="filled"
                    sx={{ 
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        fontWeight: 'medium'
                    }}
                />
            ),
        },
        {
            field: 'value',
            headerName: 'Message',
            flex: 1,
            minWidth: 400,
            editable: false,
            renderCell: renderCellExpand,
        },
    ];

    return (
        <Box sx={{ height: '100%' }}>
            {/* Header with Controls */}
            <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                        Log Messages
                    </Typography>
                    
                    {/* Status Indicators */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Stack direction="row" spacing={1}>
                            <Badge badgeContent={levelCounts.ERROR} color="error">
                                <Chip icon={<ErrorIcon />} label="Errors" size="small" />
                            </Badge>
                            <Badge badgeContent={levelCounts.WARN} color="warning">
                                <Chip icon={<WarningIcon />} label="Warnings" size="small" />
                            </Badge>
                            <Badge badgeContent={levelCounts.INFO} color="info">
                                <Chip icon={<InfoIcon />} label="Info" size="small" />
                            </Badge>
                        </Stack>
                        
                        <Divider orientation="vertical" flexItem />
                        
                        <Chip 
                            icon={isPaused ? <PauseIcon /> : <PlayIcon />}
                            label={isPaused ? 'Paused' : 'Live'}
                            color={isPaused ? 'warning' : 'success'}
                            size="small"
                        />
                    </Box>
                </Box>

                {/* Search and Filter Controls */}
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: searchTerm && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                                        <ClearIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{ minWidth: 300 }}
                    />
                    
                    <Button
                        variant="outlined"
                        startIcon={<FilterIcon />}
                        endIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        onClick={() => setShowFilters(!showFilters)}
                        size="small"
                    >
                        Filters
                    </Button>
                    
                    <Box sx={{ flex: 1 }} />
                    
                    <Stack direction="row" spacing={1}>
                        <Tooltip title={isPaused ? "Resume live updates" : "Pause live updates"}>
                            <IconButton onClick={togglePause} color={isPaused ? 'warning' : 'success'}>
                                {isPaused ? <PlayIcon /> : <PauseIcon />}
                            </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Refresh all logs">
                            <IconButton onClick={getAllLogs}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Export logs">
                            <IconButton onClick={exportLogs}>
                                <DownloadIcon />
                            </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Clear all logs">
                            <IconButton onClick={clearLogs} color="error">
                                <ClearIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>

                {/* Filter Panel */}
                <Collapse in={showFilters}>
                    <Card variant="outlined" sx={{ mt: 2 }}>
                        <CardContent sx={{ py: 2 }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                    <InputLabel>Log Level</InputLabel>
                                    <Select
                                        value={levelFilter}
                                        label="Log Level"
                                        onChange={(e) => setLevelFilter(e.target.value as LogLevel)}
                                    >
                                        <MenuItem value="ALL">All Levels</MenuItem>
                                        <MenuItem value="DEBUG">Debug</MenuItem>
                                        <MenuItem value="INFO">Info</MenuItem>
                                        <MenuItem value="WARN">Warning</MenuItem>
                                        <MenuItem value="ERROR">Error</MenuItem>
                                    </Select>
                                </FormControl>
                                
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <InputLabel>Component</InputLabel>
                                    <Select
                                        value={labelFilter}
                                        label="Component"
                                        onChange={(e) => setLabelFilter(e.target.value)}
                                    >
                                        <MenuItem value="ALL">All Components</MenuItem>
                                        {uniqueLabels.map(label => (
                                            <MenuItem key={label} value={label}>{label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                
                                <Typography variant="body2" color="text.secondary">
                                    Showing {filteredMessages.length} of {Object.keys(messages).length} messages
                                </Typography>
                            </Stack>
                        </CardContent>
                    </Card>
                </Collapse>
            </Box>

            {/* Data Grid */}
            <Box sx={{ height: 600 }}>
                <DataGrid
                    rows={filteredMessages}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 25,
                            },
                        },
                        sorting: {
                            sortModel: [{ field: 'time', sort: 'desc' }],
                        },
                    }}
                    pageSizeOptions={[10, 25, 50, 100]}
                    disableColumnSelector
                    disableDensitySelector
                    disableRowSelectionOnClick
                    slots={{ 
                        toolbar: GridToolbar, 
                        noRowsOverlay: CustomNoRowsOverlay 
                    }}
                    slotProps={{
                        toolbar: {
                            showQuickFilter: false, // We have our own search
                        },
                    }}
                    getRowClassName={(params: GridRowParams) => {
                        const level = params.row.level;
                        return `log-row-${level.toLowerCase()}`;
                    }}
                    sx={{ 
                        '--DataGrid-overlayHeight': '300px',
                        '& .log-row-error': {
                            backgroundColor: alpha(theme.palette.error.main, 0.05),
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.error.main, 0.1),
                            }
                        },
                        '& .log-row-warn': {
                            backgroundColor: alpha(theme.palette.warning.main, 0.05),
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.warning.main, 0.1),
                            }
                        },
                        '& .log-row-debug': {
                            backgroundColor: alpha(theme.palette.grey[500], 0.05),
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.grey[500], 0.1),
                            }
                        },
                        '& .MuiDataGrid-row:hover': {
                            cursor: 'pointer'
                        }
                    }}
                />
            </Box>
        </Box>
    );
}

export default Messages;
