import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import './UserProfile.css';

const UserProfile: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const getInitials = (name?: string, email?: string): string => {
    if (name) {
      return name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return '?';
  };

  const getDisplayName = (): string => {
    return user.name || user.email || 'User';
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

  return (
    <div className="user-profile">
      <div className="profile-trigger" onClick={toggleDropdown}>
        <div className="avatar">
          {getInitials(user.name, user.email)}
        </div>
        <span className="username">{getDisplayName()}</span>
        <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>
          ▼
        </span>
      </div>

      {isDropdownOpen && (
        <div className="profile-dropdown">
          <div className="dropdown-header">
            <div className="avatar-large">
              {getInitials(user.name, user.email)}
            </div>
            <div className="user-info">
              <div className="user-name">{user.name || 'Unknown User'}</div>
              <div className="user-email">{user.email || 'No email'}</div>
              <div className="user-provider">
                <span className="provider-icon">
                  {getProviderIcon(user.provider)}
                </span>
                <span className="provider-text">
                  via {user.provider.charAt(0).toUpperCase() + user.provider.slice(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="dropdown-divider"></div>

          <div className="dropdown-actions">
            <button
              className="logout-button"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <span className="logout-spinner"></span>
                  <span>Signing out...</span>
                </>
              ) : (
                <>
                  <span className="logout-icon">🚪</span>
                  <span>Sign out</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {isDropdownOpen && (
        <div 
          className="dropdown-overlay" 
          onClick={() => setIsDropdownOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default UserProfile;
