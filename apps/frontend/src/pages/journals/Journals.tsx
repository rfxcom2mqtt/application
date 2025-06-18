import React, { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import Messages from './Messages';
import config from '../../utils/config';
import { 
    Alert, 
    Box, 
    CircularProgress, 
    Typography, 
    Paper,
    Container,
    Fade,
    useTheme
} from '@mui/material';
import { 
    Article as ArticleIcon,
    WifiOff as WifiOffIcon,
    Wifi as WifiIcon
} from '@mui/icons-material';

/**
 * Journals page component for displaying system logs
 * Uses WebSocket connection to receive real-time logs
 */
function JournalsPage() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [connecting, setConnecting] = useState<boolean>(true);
    const theme = useTheme();

    useEffect(() => {
        // Create socket connection
        let socketUrl = window.location.origin;
        if (config.basePath) {
            socketUrl += config.basePath;
        }

        // Log connection details in development mode
        if (process.env.NODE_ENV === 'development') {
            console.debug('WebSocket connection details:', {
                socketUrl,
                path: config.basePath + '/socket.io',
                wsNamespace: config.wsNamespace
            });
        }

        // Initialize socket with error handling
        try {
            const newSocket: Socket = io(socketUrl, { 
                path: config.basePath + '/socket.io',
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                timeout: 10000
            });

            // Socket event handlers
            newSocket.on('connect', () => {
                setConnectionError(null);
                setConnecting(false);
                console.log('WebSocket connected successfully');
            });

            newSocket.on('connect_error', (err) => {
                console.error('WebSocket connection error:', err);
                setConnectionError(`Connection error: ${err.message}`);
                setConnecting(false);
            });

            newSocket.on('disconnect', (reason) => {
                console.warn('WebSocket disconnected:', reason);
                setConnecting(true);
                if (reason === 'io server disconnect') {
                    // Server disconnected the client, try to reconnect
                    newSocket.connect();
                }
            });

            setSocket(newSocket);

            // Cleanup function to close socket when component unmounts
            return () => {
                newSocket.disconnect();
            };
        } catch (error) {
            console.error('Error initializing WebSocket:', error);
            setConnectionError(`Failed to initialize WebSocket connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setConnecting(false);
        }
    }, []);

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Header Section */}
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 3, 
                    mb: 3, 
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: 2,
                            backgroundColor: theme.palette.primary.main,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <ArticleIcon fontSize="large" />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                            System Journals
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Real-time system logs and application events
                        </Typography>
                    </Box>
                    
                    {/* Connection Status Indicator */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {connecting ? (
                            <CircularProgress size={20} />
                        ) : socket ? (
                            <WifiIcon color="success" />
                        ) : (
                            <WifiOffIcon color="error" />
                        )}
                        <Typography 
                            variant="body2" 
                            color={connecting ? 'text.secondary' : socket ? 'success.main' : 'error.main'}
                            fontWeight="medium"
                        >
                            {connecting ? 'Connecting...' : socket ? 'Connected' : 'Disconnected'}
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {/* Connection Status Messages */}
            <Fade in={connecting} timeout={300}>
                <Box sx={{ mb: 2 }}>
                    {connecting && (
                        <Alert 
                            severity="info" 
                            icon={<CircularProgress size={20} />}
                            sx={{ 
                                borderRadius: 2,
                                '& .MuiAlert-icon': {
                                    alignItems: 'center'
                                }
                            }}
                        >
                            <Typography variant="body2">
                                Establishing connection to server...
                            </Typography>
                        </Alert>
                    )}
                </Box>
            </Fade>
            
            <Fade in={!!connectionError} timeout={300}>
                <Box sx={{ mb: 2 }}>
                    {connectionError && (
                        <Alert 
                            severity="error" 
                            sx={{ borderRadius: 2 }}
                            onClose={() => setConnectionError(null)}
                        >
                            <Typography variant="body2" fontWeight="medium">
                                Connection Failed
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {connectionError}
                            </Typography>
                        </Alert>
                    )}
                </Box>
            </Fade>
            
            {/* Main Content */}
            {socket ? (
                <Fade in={!!socket} timeout={500}>
                    <Paper 
                        elevation={1} 
                        sx={{ 
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: `1px solid ${theme.palette.divider}`
                        }}
                    >
                        <Messages socket={socket} />
                    </Paper>
                </Fade>
            ) : !connecting && (
                <Fade in={!connecting && !socket} timeout={300}>
                    <Box>
                        <Alert 
                            severity="warning" 
                            sx={{ borderRadius: 2 }}
                        >
                            <Typography variant="body2" fontWeight="medium">
                                No Connection Available
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                Please check your network connection and server status. The page will automatically reconnect when the server becomes available.
                            </Typography>
                        </Alert>
                    </Box>
                </Fade>
            )}
        </Container>
    );
}

export default JournalsPage;
