import express, { Request, Response } from 'express';
import { Server } from 'http';
import { settingsService } from '../config/settings';
import { logger } from '../utils/logger';
import { metricsService } from '../core/services/metrics.service';

/**
 * Prometheus metrics server
 *
 * This server runs separately from the main application server and exposes
 * Prometheus metrics on a dedicated port. This separation allows for:
 * - Independent scaling and monitoring
 * - Security isolation (metrics endpoint can be internal-only)
 * - Different authentication/authorization if needed
 */
export default class PrometheusServer {
  private app?: express.Express;
  private server?: Server;
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Start the Prometheus metrics server
   */
  async start(): Promise<void> {
    const config = settingsService.get().prometheus;

    if (!config.enabled) {
      logger.debug('Prometheus metrics server disabled');
      return;
    }

    logger.info('Starting Prometheus metrics server');

    this.app = express();

    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'healthy',
        uptime: Math.floor((Date.now() - this.startTime) / 1000),
        timestamp: new Date().toISOString(),
      });
    });

    // Metrics endpoint
    this.app.get(config.path, async (req: Request, res: Response) => {
      try {
        // Update bridge uptime before serving metrics
        const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        metricsService.updateBridgeUptime(uptimeSeconds);

        const metrics = await metricsService.getMetrics();
        res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
        res.status(200).send(metrics);
      } catch (error) {
        logger.error(
          `Failed to serve metrics: ${error instanceof Error ? error.message : String(error)}`
        );
        res.status(500).json({
          error: 'Failed to generate metrics',
          message: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // 404 handler for unknown routes
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        availableEndpoints: [`GET ${config.path}`, 'GET /health'],
      });
    });

    // Error handler
    this.app.use((err: Error, req: Request, res: Response, next: any) => {
      logger.error(`Prometheus server error: ${err.message}`);
      res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
      });
    });

    // Start the server
    await this.startServer(config.host, config.port);
  }

  /**
   * Start the HTTP server
   */
  private async startServer(host: string, port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.app) {
        reject(new Error('Express app not initialized'));
        return;
      }

      this.server = this.app.listen(port, host, () => {
        logger.info(`Prometheus metrics server started on ${host}:${port}`);
        resolve();
      });

      this.server.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          logger.error(`Prometheus metrics port ${port} is already in use`);
          reject(new Error(`Port ${port} is already in use`));
        } else if (error.code === 'EACCES') {
          logger.error(`Permission denied to bind to port ${port}`);
          reject(new Error(`Permission denied to bind to port ${port}`));
        } else {
          logger.error(`Failed to start Prometheus metrics server: ${error.message}`);
          reject(error);
        }
      });
    });
  }

  /**
   * Stop the Prometheus metrics server
   */
  async stop(): Promise<void> {
    const config = settingsService.get().prometheus;

    if (!config.enabled || !this.server) {
      logger.debug('Prometheus metrics server not running');
      return;
    }

    logger.info('Stopping Prometheus metrics server');

    return new Promise(resolve => {
      if (this.server) {
        this.server.close(() => {
          logger.info('Prometheus metrics server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Get server status information
   */
  getStatus(): { running: boolean; uptime?: number; config?: any } {
    const config = settingsService.get().prometheus;

    return {
      running: !!this.server && config.enabled,
      uptime: this.server ? Math.floor((Date.now() - this.startTime) / 1000) : undefined,
      config: config.enabled
        ? {
            host: config.host,
            port: config.port,
            path: config.path,
          }
        : undefined,
    };
  }
}
