# OAuth2 Authentication Implementation for RFXCOM2MQTT

This document describes the OAuth2 authentication feature that has been implemented for the RFXCOM2MQTT application.

## Overview

The OAuth2 implementation provides secure authentication using external OAuth2 providers, replacing or supplementing the basic token-based authentication. This feature allows users to authenticate using their existing accounts from popular providers like Google, GitHub, Microsoft Azure AD, Auth0, and other OAuth2-compliant services.

## Features

### ✅ Implemented Features

1. **OAuth2 Authentication Service** (`apps/backend/src/application/auth/OAuth2Service.ts`)
   - Complete OAuth2 flow implementation using Passport.js
   - Support for multiple OAuth2 providers
   - JWT token generation and validation
   - Session management with express-session
   - User authorization based on email addresses and domains

2. **Configuration System**
   - Extended configuration types to support OAuth2 settings
   - Configuration validation for OAuth2 parameters
   - Support for environment variables and secrets
   - Backward compatibility with existing token authentication

3. **Backend Integration**
   - Integrated OAuth2 service into the main server application
   - Authentication middleware that supports both OAuth2 and legacy token auth
   - API endpoints for authentication flow
   - Proper error handling and logging

4. **Frontend Components**
   - React authentication provider (`AuthProvider.tsx`)
   - Login page component with provider-specific styling
   - User profile component with logout functionality
   - Responsive design with dark mode support

5. **Security Features**
   - User access control via allowed users and domains
   - Secure session management
   - HTTPS support for production environments
   - CSRF protection through SameSite cookies

6. **Documentation**
   - Comprehensive setup guide with provider-specific instructions
   - Configuration examples for popular OAuth2 providers
   - Troubleshooting guide
   - Migration instructions from token authentication

## Architecture

### Backend Components

```
apps/backend/src/
├── application/
│   ├── auth/
│   │   └── OAuth2Service.ts          # Main OAuth2 service
│   └── index.ts                      # Server with OAuth2 integration
├── config/
│   └── settings/
│       ├── index.ts                  # Extended configuration types
│       └── config.validation.ts     # OAuth2 validation
└── docs/
    └── OAUTH2_SETUP.md              # Setup documentation
```

### Frontend Components

```
apps/frontend/src/
└── components/
    └── auth/
        ├── AuthProvider.tsx         # Authentication context
        ├── LoginPage.tsx           # Login interface
        ├── LoginPage.css          # Login styling
        ├── UserProfile.tsx        # User profile dropdown
        └── UserProfile.css        # Profile styling
```

## Configuration

### Basic OAuth2 Configuration

Add to your `config.yml`:

```yaml
frontend:
  enabled: true
  port: 8080
  oauth2:
    enabled: true
    provider: 'google'
    clientId: 'your-client-id'
    clientSecret: 'your-client-secret'
    authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth'
    tokenURL: 'https://oauth2.googleapis.com/token'
    userInfoURL: 'https://www.googleapis.com/oauth2/v2/userinfo'
    scope:
      - 'openid'
      - 'profile'
      - 'email'
    callbackURL: 'http://localhost:8080/auth/callback'
    sessionSecret: 'your-random-session-secret'
    allowedUsers:
      - 'admin@example.com'
    allowedDomains:
      - 'example.com'
```

### Supported Providers

The implementation supports any OAuth2-compliant provider. Pre-configured examples include:

- **Google OAuth2**: Complete setup instructions and URLs
- **GitHub OAuth2**: Developer app configuration
- **Microsoft Azure AD**: Enterprise authentication
- **Auth0**: Third-party authentication service
- **Generic OAuth2**: For custom providers

## API Endpoints

The OAuth2 implementation provides these endpoints:

- `GET /auth/login` - Initiate OAuth2 authentication
- `GET /auth/callback` - Handle OAuth2 provider callback
- `POST /auth/logout` - Logout current user
- `GET /auth/user` - Get current user information
- `GET /auth/status` - Check authentication status

## Security Considerations

### Access Control

1. **Allowed Users**: Restrict access to specific email addresses
2. **Allowed Domains**: Allow all users from specific domains
3. **Combined Control**: Users granted access if they match either criteria

### Session Security

- HTTP-only cookies for session tokens
- Secure cookies in production (HTTPS)
- SameSite cookie protection
- Configurable session expiration

### Production Deployment

- HTTPS enforcement for OAuth2 callbacks
- Secure session secret generation
- Environment variable support for sensitive data
- Proper CORS configuration

## Migration Guide

### From Token Authentication

1. **Gradual Migration**:
   - Keep existing `authToken` configuration
   - Enable OAuth2 with `oauth2.enabled: true`
   - System prefers OAuth2 when available
   - Remove token auth after testing

2. **Testing Process**:
   - Configure OAuth2 provider
   - Test authentication flow
   - Verify user access control
   - Validate API access with OAuth2 tokens

## Dependencies Added

### Backend Dependencies
```json
{
  "passport": "^0.7.0",
  "passport-oauth2": "^1.8.0",
  "express-session": "^1.18.1",
  "jsonwebtoken": "^9.0.2",
  "@types/passport": "^1.0.17",
  "@types/passport-oauth2": "^1.4.17",
  "@types/express-session": "^1.18.2",
  "@types/jsonwebtoken": "^9.0.10"
}
```

## Usage Examples

### Frontend Integration

```typescript
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import LoginPage from './components/auth/LoginPage';
import UserProfile from './components/auth/UserProfile';

// Wrap your app with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

// Use authentication in components
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <LoginPage />;
  
  return (
    <div>
      <header>
        <UserProfile />
      </header>
      {/* Your app content */}
    </div>
  );
}
```

### API Usage

```javascript
// Check authentication status
const response = await fetch('/auth/status');
const { authenticated, oauth2Enabled } = await response.json();

// Get user information
const userResponse = await fetch('/auth/user');
const { user } = await userResponse.json();

// Logout
await fetch('/auth/logout', { method: 'POST' });
```

## Troubleshooting

### Common Issues

1. **Invalid Redirect URI**
   - Ensure callback URL matches OAuth2 provider configuration
   - Check for trailing slashes and protocol differences

2. **Access Denied**
   - Verify user email in `allowedUsers` or domain in `allowedDomains`
   - Check OAuth2 provider user info response format

3. **Session Issues**
   - Ensure `sessionSecret` is set and consistent
   - Verify cookie settings for HTTPS environments

### Debug Mode

Enable debug logging:
```yaml
loglevel: 'debug'
```

## Testing

### Manual Testing

1. Start the application with OAuth2 enabled
2. Navigate to the application URL
3. Click "Sign in with [Provider]"
4. Complete OAuth2 flow with provider
5. Verify successful authentication and user profile display
6. Test logout functionality

### Provider Setup Testing

Test OAuth2 configuration with curl:
```bash
# Test login redirect
curl -I http://localhost:8080/auth/login

# Should return 302 redirect to OAuth2 provider
```

## Future Enhancements

Potential improvements for future versions:

1. **Multi-Provider Support**: Allow multiple OAuth2 providers simultaneously
2. **Role-Based Access Control**: Implement user roles and permissions
3. **SSO Integration**: Support for SAML and other SSO protocols
4. **Audit Logging**: Track authentication events and user actions
5. **Session Management**: Admin interface for managing user sessions

## Support

For issues and questions:

1. Check the application logs for detailed error messages
2. Verify OAuth2 provider configuration
3. Review the setup documentation in `apps/backend/docs/OAUTH2_SETUP.md`
4. Test with a simple OAuth2 client to verify provider setup

## License

This OAuth2 implementation is part of the RFXCOM2MQTT project and follows the same license terms.
