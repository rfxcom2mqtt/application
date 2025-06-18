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
    Fade,
    useTheme,
    Chip
} from '@mui/material';
import { 
    WifiOff as WifiOffIcon,
    Wifi as WifiIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import PageContainer from '../../components/common/PageContainer';

/**
 * Journals page component for displaying system logs
 * Uses WebSocket connection to receive real-time logs
 */
function JournalsPage() {
    const { t } = useTranslation();
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

    const connectionStatusActions = (
        <Chip
            icon={connecting ? <CircularProgress size={16} /> : socket ? <WifiIcon /> : <WifiOffIcon />}
            label={connecting ? t('journals.connection.connecting') : socket ? t('journals.connection.connected') : t('journals.connection.disconnected')}
            color={connecting ? 'default' : socket ? 'success' : 'error'}
            variant="outlined"
        />
    );

    return (
        <PageContainer
            title={t('journals.title')}
            subtitle={t('journals.subtitle')}
            actions={connectionStatusActions}
            maxWidth="xl"
        >

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
                                {t('journals.connection.establishingConnection')}
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
                                {t('journals.connection.connectionFailed')}
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
                                {t('journals.connection.noConnectionAvailable')}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {t('journals.connection.checkNetworkConnection')}
                            </Typography>
                        </Alert>
                    </Box>
                </Fade>
            )}
        </PageContainer>
    );
}

export default JournalsPage;
