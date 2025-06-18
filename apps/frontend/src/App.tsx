import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './i18n'; // Initialize i18n
import Header from './components/Header';
import config from './utils/config';
import { Box, CircularProgress, Alert } from '@mui/material';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './components/common/Toast';
import { useTranslation } from 'react-i18next';

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
                <ErrorBoundaryContent error={this.state.error} />
            );
        }

        return this.props.children;
    }
}

// Error Boundary Content Component (functional component to use hooks)
const ErrorBoundaryContent = ({ error }: { error: Error | null }) => {
    const { t } = useTranslation();
    
    return (
        <Box sx={{ p: 3 }}>
            <Alert severity="error">
                <strong>{t('errors.somethingWentWrong')}</strong>
                <p>{t('errors.tryRefreshing')}</p>
                <p>{error?.message}</p>
            </Alert>
        </Box>
    );
};

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
const NotFoundPage = () => {
    const { t } = useTranslation();
    
    return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
            <Alert severity="warning">
                <strong>{t('errors.pageNotFound')}</strong>
                <p>{t('errors.pageNotFoundDescription')}</p>
            </Alert>
        </Box>
    );
};

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
