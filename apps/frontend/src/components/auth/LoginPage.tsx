import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import './LoginPage.css';

interface AuthConfig {
  oauth2Enabled: boolean;
  provider: string;
  loginUrl: string;
}

const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [authConfig, setAuthConfig] = useState<AuthConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if there's an error in the URL (from OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    if (errorParam === 'auth_failed') {
      setError('Authentication failed. Please try again.');
    }

    // Fetch auth configuration
    fetch('/auth/status')
      .then(response => response.json())
      .then(data => {
        setAuthConfig({
          oauth2Enabled: data.oauth2Enabled,
          provider: data.provider,
          loginUrl: '/auth/login'
        });
      })
      .catch(err => {
        console.error('Failed to fetch auth config:', err);
        setError('Failed to load authentication configuration.');
      });
  }, []);

  const handleLogin = () => {
    if (authConfig?.oauth2Enabled) {
      login();
    } else {
      setError('OAuth2 authentication is not enabled.');
    }
  };

  const getProviderDisplayName = (provider: string): string => {
    switch (provider.toLowerCase()) {
      case 'google':
        return 'Google';
      case 'github':
        return 'GitHub';
      case 'azure':
        return 'Microsoft';
      case 'auth0':
        return 'Auth0';
      default:
        return provider.charAt(0).toUpperCase() + provider.slice(1);
    }
  };

  const getProviderIcon = (provider: string): string => {
    switch (provider.toLowerCase()) {
      case 'google':
        return '🔍';
      case 'github':
        return '🐙';
      case 'azure':
        return '🪟';
      case 'auth0':
        return '🔐';
      default:
        return '🔑';
    }
  };

  if (isLoading) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>RFXCOM2MQTT</h1>
          <p>Please sign in to continue</p>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <div className="login-content">
          {authConfig?.oauth2Enabled ? (
            <div className="oauth-login">
              <button 
                className="login-button"
                onClick={handleLogin}
                disabled={isLoading}
              >
                <span className="provider-icon">
                  {getProviderIcon(authConfig.provider)}
                </span>
                <span className="login-text">
                  Sign in with {getProviderDisplayName(authConfig.provider)}
                </span>
              </button>
              
              <div className="login-info">
                <p>
                  <span className="info-icon">ℹ️</span>
                  You will be redirected to {getProviderDisplayName(authConfig.provider)} to complete the sign-in process.
                </p>
              </div>
            </div>
          ) : (
            <div className="auth-disabled">
              <div className="disabled-icon">🔒</div>
              <h3>Authentication Required</h3>
              <p>OAuth2 authentication is not configured or enabled.</p>
              <p>Please contact your administrator to set up authentication.</p>
            </div>
          )}
        </div>

        <div className="login-footer">
          <p>
            <span className="security-icon">🛡️</span>
            Your data is protected with industry-standard security measures.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
