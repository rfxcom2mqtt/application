import passport from 'passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { settingsService, SettingOAuth2 } from '../../config/settings';
import { logger } from '../../utils/logger';

export interface User {
  id: string;
  email?: string;
  name?: string;
  provider: string;
  profile?: any;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

/**
 * OAuth2 Authentication Service
 * 
 * This service handles OAuth2 authentication using Passport.js
 * It supports external OAuth2 providers and includes user authorization
 * based on allowed users and domains configured in the settings.
 */
export class OAuth2Service {
  private config: SettingOAuth2;
  private jwtSecret: string;

  constructor() {
    const settings = settingsService.get();
    if (!settings.frontend.oauth2) {
      throw new Error('OAuth2 configuration not found');
    }
    this.config = settings.frontend.oauth2;
    this.jwtSecret = this.config.sessionSecret;
    
    this.initializePassport();
  }

  /**
   * Initialize Passport.js with OAuth2 strategy
   */
  private initializePassport(): void {
    // Serialize user for session
    passport.serializeUser((user: any, done) => {
      done(null, user);
    });

    // Deserialize user from session
    passport.deserializeUser((user: any, done) => {
      done(null, user);
    });

    // Configure OAuth2 strategy
    passport.use('oauth2', new OAuth2Strategy({
      authorizationURL: this.config.authorizationURL,
      tokenURL: this.config.tokenURL,
      clientID: this.config.clientId,
      clientSecret: this.config.clientSecret,
      callbackURL: this.config.callbackURL,
      scope: this.config.scope || ['openid', 'profile', 'email'],
    }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        // Get user info from the OAuth2 provider
        const userInfo = await this.getUserInfo(accessToken);
        
        // Create user object
        const user: User = {
          id: userInfo.id || userInfo.sub,
          email: userInfo.email,
          name: userInfo.name || userInfo.display_name,
          provider: this.config.provider,
          profile: userInfo
        };

        // Check if user is authorized
        if (this.isUserAuthorized(user)) {
          logger.info(`User ${user.email || user.id} authenticated successfully via OAuth2`);
          return done(null, user);
        } else {
          logger.warn(`User ${user.email || user.id} authentication denied - not in allowed users/domains`);
          return done(null, false, { message: 'Access denied: User not authorized' });
        }
      } catch (error) {
        logger.error(`OAuth2 authentication error: ${error instanceof Error ? error.message : String(error)}`);
        return done(error, false);
      }
    }));
  }

  /**
   * Get user information from OAuth2 provider
   */
  private async getUserInfo(accessToken: string): Promise<any> {
    if (!this.config.userInfoURL) {
      throw new Error('User info URL not configured');
    }

    const response = await fetch(this.config.userInfoURL, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Check if user is authorized based on configuration
   */
  private isUserAuthorized(user: User): boolean {
    // If no restrictions are configured, allow all authenticated users
    if (!this.config.allowedUsers && !this.config.allowedDomains) {
      return true;
    }

    // Check allowed users
    if (this.config.allowedUsers && this.config.allowedUsers.length > 0) {
      const userIdentifier = user.email || user.id;
      if (this.config.allowedUsers.includes(userIdentifier)) {
        return true;
      }
    }

    // Check allowed domains
    if (this.config.allowedDomains && this.config.allowedDomains.length > 0 && user.email) {
      const emailDomain = user.email.split('@')[1];
      if (this.config.allowedDomains.includes(emailDomain)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate JWT token for authenticated user
   */
  generateToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider
      },
      this.jwtSecret,
      { expiresIn: '24h' }
    );
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): User | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      return {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        provider: decoded.provider
      };
    } catch (error) {
      logger.debug(`Token verification failed: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  /**
   * Middleware to check if user is authenticated
   */
  requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // Check for JWT token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const user = this.verifyToken(token);
      
      if (user) {
        req.user = user;
        return next();
      }
    }

    // Check for JWT token in cookies
    const cookieToken = req.cookies?.auth_token;
    if (cookieToken) {
      const user = this.verifyToken(cookieToken);
      if (user) {
        req.user = user;
        return next();
      }
    }

    // Check for session-based authentication (Passport.js)
    if (req.isAuthenticated && req.isAuthenticated()) {
      return next();
    }

    // If no valid authentication found, return unauthorized
    res.status(401).json({ 
      success: false, 
      message: 'Authentication required',
      redirectUrl: '/auth/login'
    });
  };

  /**
   * Get authentication routes for Express
   */
  getAuthRoutes() {
    const express = require('express');
    const router = express.Router();

    // Login route - redirect to OAuth2 provider
    router.get('/login', passport.authenticate('oauth2'));

    // Callback route - handle OAuth2 callback
    router.get('/callback', 
      passport.authenticate('oauth2', { failureRedirect: '/auth/login?error=auth_failed' }),
      (req: AuthenticatedRequest, res: Response) => {
        if (req.user) {
          // Generate JWT token
          const token = this.generateToken(req.user);
          
          // Set token as HTTP-only cookie
          res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
          });

          // Redirect to frontend
          res.redirect('/?auth=success');
        } else {
          res.redirect('/auth/login?error=auth_failed');
        }
      }
    );

    // Logout route
    router.post('/logout', (req: Request, res: Response) => {
      req.logout((err) => {
        if (err) {
          logger.error(`Logout error: ${err.message}`);
          return res.status(500).json({ success: false, message: 'Logout failed' });
        }
        
        // Clear auth token cookie
        res.clearCookie('auth_token');
        res.json({ success: true, message: 'Logged out successfully' });
      });
    });

    // User info route
    router.get('/user', this.requireAuth, (req: AuthenticatedRequest, res: Response) => {
      res.json({
        success: true,
        user: {
          id: req.user?.id,
          email: req.user?.email,
          name: req.user?.name,
          provider: req.user?.provider
        }
      });
    });

    // Status route
    router.get('/status', (req: AuthenticatedRequest, res: Response) => {
      const isAuthenticated = req.isAuthenticated && req.isAuthenticated();
      res.json({
        authenticated: isAuthenticated,
        oauth2Enabled: this.config.enabled,
        provider: this.config.provider
      });
    });

    return router;
  }

  /**
   * Check if OAuth2 is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Get OAuth2 configuration (without sensitive data)
   */
  getPublicConfig() {
    return {
      enabled: this.config.enabled,
      provider: this.config.provider,
      loginUrl: '/auth/login',
      callbackUrl: this.config.callbackURL
    };
  }
}
