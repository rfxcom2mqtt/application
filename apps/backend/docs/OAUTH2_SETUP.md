# OAuth2 Authentication Setup Guide

This guide explains how to configure OAuth2 authentication for your rfxcom2mqtt application.

## Overview

The OAuth2 implementation provides secure authentication using external OAuth2 providers such as:
- Google OAuth2
- GitHub OAuth2
- Microsoft Azure AD
- Auth0
- Keycloak
- Any OAuth2-compliant provider

## Configuration

### 1. Basic Configuration

Add the following configuration to your `config.yml` file:

```yaml
frontend:
  enabled: true
  port: 8080
  host: '0.0.0.0'
  oauth2:
    enabled: true
    provider: 'google'  # or 'github', 'azure', 'auth0', 'generic'
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
      - 'user@example.com'
      - 'admin@example.com'
    allowedDomains:
      - 'example.com'
```

### 2. Provider-Specific Configurations

#### Google OAuth2

```yaml
frontend:
  oauth2:
    enabled: true
    provider: 'google'
    clientId: 'your-google-client-id.apps.googleusercontent.com'
    clientSecret: 'your-google-client-secret'
    authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth'
    tokenURL: 'https://oauth2.googleapis.com/token'
    userInfoURL: 'https://www.googleapis.com/oauth2/v2/userinfo'
    scope:
      - 'openid'
      - 'profile'
      - 'email'
    callbackURL: 'http://localhost:8080/auth/callback'
    sessionSecret: 'your-random-session-secret'
```

**Setup Steps for Google:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URI: `http://localhost:8080/auth/callback`
7. Copy Client ID and Client Secret

#### GitHub OAuth2

```yaml
frontend:
  oauth2:
    enabled: true
    provider: 'github'
    clientId: 'your-github-client-id'
    clientSecret: 'your-github-client-secret'
    authorizationURL: 'https://github.com/login/oauth/authorize'
    tokenURL: 'https://github.com/login/oauth/access_token'
    userInfoURL: 'https://api.github.com/user'
    scope:
      - 'user:email'
    callbackURL: 'http://localhost:8080/auth/callback'
    sessionSecret: 'your-random-session-secret'
```

**Setup Steps for GitHub:**
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Set Authorization callback URL: `http://localhost:8080/auth/callback`
4. Copy Client ID and Client Secret

#### Microsoft Azure AD

```yaml
frontend:
  oauth2:
    enabled: true
    provider: 'azure'
    clientId: 'your-azure-client-id'
    clientSecret: 'your-azure-client-secret'
    authorizationURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
    tokenURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
    userInfoURL: 'https://graph.microsoft.com/v1.0/me'
    scope:
      - 'openid'
      - 'profile'
      - 'email'
    callbackURL: 'http://localhost:8080/auth/callback'
    sessionSecret: 'your-random-session-secret'
```

#### Auth0

```yaml
frontend:
  oauth2:
    enabled: true
    provider: 'auth0'
    clientId: 'your-auth0-client-id'
    clientSecret: 'your-auth0-client-secret'
    authorizationURL: 'https://your-domain.auth0.com/authorize'
    tokenURL: 'https://your-domain.auth0.com/oauth/token'
    userInfoURL: 'https://your-domain.auth0.com/userinfo'
    scope:
      - 'openid'
      - 'profile'
      - 'email'
    callbackURL: 'http://localhost:8080/auth/callback'
    sessionSecret: 'your-random-session-secret'
```

### 3. Access Control

#### Allowed Users
Restrict access to specific email addresses:

```yaml
frontend:
  oauth2:
    allowedUsers:
      - 'admin@company.com'
      - 'user1@company.com'
      - 'user2@company.com'
```

#### Allowed Domains
Allow all users from specific domains:

```yaml
frontend:
  oauth2:
    allowedDomains:
      - 'company.com'
      - 'subsidiary.com'
```

#### Combined Access Control
You can use both `allowedUsers` and `allowedDomains`. Users will be granted access if they match either criteria.

## Security Considerations

### 1. Session Secret
Generate a strong, random session secret:

```bash
# Generate a random 32-character string
openssl rand -hex 32
```

### 2. HTTPS in Production
Always use HTTPS in production environments:

```yaml
frontend:
  sslCert: '/path/to/certificate.crt'
  sslKey: '/path/to/private.key'
  oauth2:
    callbackURL: 'https://your-domain.com/auth/callback'
```

### 3. Environment Variables
Store sensitive information in environment variables:

```yaml
frontend:
  oauth2:
    clientId: !env OAUTH2_CLIENT_ID
    clientSecret: !env OAUTH2_CLIENT_SECRET
    sessionSecret: !env SESSION_SECRET
```

## API Endpoints

The OAuth2 implementation provides the following endpoints:

- `GET /auth/login` - Initiate OAuth2 login
- `GET /auth/callback` - OAuth2 callback handler
- `POST /auth/logout` - Logout user
- `GET /auth/user` - Get current user information
- `GET /auth/status` - Get authentication status

## Frontend Integration

### Check Authentication Status

```javascript
fetch('/auth/status')
  .then(response => response.json())
  .then(data => {
    if (data.authenticated) {
      // User is authenticated
      console.log('User is logged in');
    } else {
      // Redirect to login
      window.location.href = '/auth/login';
    }
  });
```

### Get User Information

```javascript
fetch('/auth/user')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('User:', data.user);
    }
  });
```

### Logout

```javascript
fetch('/auth/logout', { method: 'POST' })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      window.location.reload();
    }
  });
```

## Troubleshooting

### Common Issues

1. **Invalid Redirect URI**
   - Ensure the callback URL in your OAuth2 provider matches exactly
   - Check for trailing slashes and protocol (http vs https)

2. **Access Denied**
   - Verify user email is in `allowedUsers` or domain is in `allowedDomains`
   - Check OAuth2 provider user info response format

3. **Session Issues**
   - Ensure `sessionSecret` is set and consistent
   - Check cookie settings for HTTPS environments

### Debug Mode

Enable debug logging to troubleshoot issues:

```yaml
loglevel: 'debug'
```

### Testing Configuration

Test your OAuth2 configuration:

```bash
# Start the application
npm run dev

# Navigate to the login page
curl -I http://localhost:8080/auth/login
```

## Migration from Token Authentication

If you're migrating from the legacy token authentication:

1. Keep the existing `authToken` configuration for backward compatibility
2. Enable OAuth2 gradually by setting `oauth2.enabled: true`
3. The system will prefer OAuth2 when enabled, falling back to token auth if OAuth2 fails
4. Remove `authToken` once OAuth2 is fully tested and working

## Example Complete Configuration

```yaml
loglevel: 'info'

frontend:
  enabled: true
  port: 8080
  host: '0.0.0.0'
  sslCert: '/etc/ssl/certs/rfxcom2mqtt.crt'
  sslKey: '/etc/ssl/private/rfxcom2mqtt.key'
  oauth2:
    enabled: true
    provider: 'google'
    clientId: !env GOOGLE_CLIENT_ID
    clientSecret: !env GOOGLE_CLIENT_SECRET
    authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth'
    tokenURL: 'https://oauth2.googleapis.com/token'
    userInfoURL: 'https://www.googleapis.com/oauth2/v2/userinfo'
    scope:
      - 'openid'
      - 'profile'
      - 'email'
    callbackURL: 'https://rfxcom2mqtt.example.com/auth/callback'
    sessionSecret: !env SESSION_SECRET
    allowedDomains:
      - 'example.com'

# ... rest of your configuration
```

## Support

For additional help:
- Check the application logs for detailed error messages
- Verify your OAuth2 provider configuration
- Ensure network connectivity to the OAuth2 provider
- Test with a simple OAuth2 client first to verify provider setup
