import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import config from './utils/config';
import { Box, CircularProgress, Alert } from '@mui/material';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './components/common/Toast';

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box sx={{ p: 3 }}>
                    <Alert severity="error">
                        <strong>Something went wrong.</strong>
                        <p>Please try refreshing the page. If the problem persists, please contact support.</p>
                        <p>{this.state.error?.message}</p>
                    </Alert>
                </Box>
            );
        }

        return this.props.children;
    }
}

// Loading component for suspense fallback
const LoadingFallback = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
    </Box>
);

// Lazy-loaded components
const ControllerInfoPage = lazy(() => import('./pages/controller/ControllerInfo'));
const DevicesPage = lazy(() => import('./pages/devices/Devices'));
const DevicePage = lazy(() => import('./pages/devices/Device'));
const SettingsPage = lazy(() => import('./pages/settings/Settings'));
const JournalsPage = lazy(() => import('./pages/journals/Journals'));

// Not Found Page
const NotFoundPage = () => (
    <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="warning">
            <strong>404 - Page Not Found</strong>
            <p>The page you are looking for does not exist.</p>
        </Alert>
    </Box>
);

/**
 * Main Application Component
 * Sets up routing and global error handling
 */
function App() {
    return (
        <ThemeProvider>
            <ToastProvider>
                <ErrorBoundary>
                    <BrowserRouter basename={config.basePath}>
                        <Header />
                        <Suspense fallback={<LoadingFallback />}>
                            <Routes>
                                <Route path="/" element={<ControllerInfoPage />} />
                                <Route path="/devices" element={<DevicesPage />} />
                                <Route path="/devices/:id" element={<DevicePage />} />
                                <Route path="/settings" element={<SettingsPage />} />
                                <Route path="/logs" element={<JournalsPage />} />
                                <Route path="/404" element={<NotFoundPage />} />
                                <Route path="*" element={<Navigate to="/404" replace />} />
                            </Routes>
                        </Suspense>
                    </BrowserRouter>
                </ErrorBoundary>
            </ToastProvider>
        </ThemeProvider>
    );
}

export default App;
