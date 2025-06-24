import { Injectable, Logger } from '@nestjs/common';
import { Response, Request } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class FrontendService {
  private readonly logger = new Logger(FrontendService.name);
  private readonly frontendBuildPath = join(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    '..',
    'frontend',
    'dist'
  );
  private readonly indexPath = join(this.frontendBuildPath, 'index.html');

  async serveFrontend(req: Request, res: Response): Promise<void> {
    this.logger.debug('frontend path ', this.frontendBuildPath);
    try {
      // Check if frontend build exists
      if (!existsSync(this.frontendBuildPath) || !existsSync(this.indexPath)) {
        this.logger.debug('Frontend build not found, serving fallback message');
        return this.serveFallback(res);
      }

      // For SPA routing, serve index.html for all non-API routes
      res.sendFile(this.indexPath, err => {
        if (err) {
          this.logger.error(`Error serving frontend: ${err.message}`);
          this.serveFallback(res);
        }
      });
    } catch (error: any) {
      this.logger.error(`Frontend service error: ${error.message}`);
      this.serveFallback(res);
    }
  }

  private serveFallback(res: Response): void {
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RFXCOM2MQTT</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }
          h1 { margin: 0 0 20px 0; font-size: 2.5em; }
          p { margin: 10px 0; opacity: 0.9; }
          .api-link {
            display: inline-block;
            margin: 20px 10px;
            padding: 12px 24px;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            transition: all 0.3s ease;
          }
          .api-link:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
          }
          .status { 
            color: #4ade80; 
            font-weight: bold; 
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🏠 RFXCOM2MQTT</h1>
          <div class="status">✅ NestJS Backend Running</div>
          <p>The backend API is running successfully!</p>
          <p>Frontend build not found. Build the frontend to access the web interface.</p>
          
          <div>
            <a href="/api/docs" class="api-link">📚 API Documentation</a>
            <a href="/api/health" class="api-link">💚 Health Check</a>
          </div>
          
          <p style="margin-top: 30px; font-size: 0.9em; opacity: 0.7;">
            To build the frontend: <code>cd apps/frontend && pnpm run build</code>
          </p>
        </div>
      </body>
      </html>
    `);
  }
}
