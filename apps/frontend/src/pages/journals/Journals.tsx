import React, { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import Messages from './Messages';
import config from '../../utils/config';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';

/**
 * Journals page component for displaying system logs
 * Uses WebSocket connection to receive real-time logs
 */
function JournalsPage() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [connecting, setConnecting] = useState<boolean>(true);

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
        <Box sx={{ padding: 2 }}>
            <Typography variant="h5" component="h3" gutterBottom>
                Journals
            </Typography>
            
            {connecting && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
                    <CircularProgress size={20} />
                    <Typography>Connecting to server...</Typography>
                </Box>
            )}
            
            {connectionError && (
                <Alert severity="error" sx={{ my: 2 }}>
                    {connectionError}
                </Alert>
            )}
            
            {socket ? (
                <Box className="logs-container" sx={{ mt: 2 }}>
                    <Messages socket={socket} />
                </Box>
            ) : !connecting && (
                <Alert severity="warning" sx={{ my: 2 }}>
                    Not connected to server. Please check your network connection and server status.
                </Alert>
            )}
        </Box>
    );
}

export default JournalsPage;
