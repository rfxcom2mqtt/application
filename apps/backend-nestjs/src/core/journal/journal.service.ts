import { Injectable, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { WsMessage } from '@rfxcom2mqtt/shared';
import { WebSocketGateway } from '../../application/websocket/websocket.gateway';
import { logger, loggerFactory, LoggerCategories } from '../../utils/logger';

@Injectable()
export class JournalService implements OnModuleInit {
  private readonly logger = loggerFactory.getLogger(LoggerCategories.JOURNAL);
  private logs: Map<string, WsMessage> = new Map();
  private maxLogs = 10000; // Maximum number of logs to keep in memory
  private logCounter = 0;
  private pendingLogs: WsMessage[] = [];
  private broadcastTimer: NodeJS.Timeout | null = null;

  constructor(
    @Inject(forwardRef(() => WebSocketGateway))
    private readonly webSocketGateway: WebSocketGateway
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.info('Journal service initialized');

    // Hook into the logger to capture all log messages
    this.setupLogCapture();
  }

  /**
   * Add a log message to the journal
   */
  addLog(level: string, label: string, message: string): void {
    const logId = `log_${Date.now()}_${++this.logCounter}`;

    const wsMessage: WsMessage = {
      id: logId,
      level: level.toUpperCase(),
      label,
      value: message,
      time: Date.now(),
    };

    // Store the log
    this.logs.set(logId, wsMessage);

    // Maintain max logs limit
    if (this.logs.size > this.maxLogs) {
      const oldestKey = this.logs.keys().next().value;
      if (oldestKey) {
        this.logs.delete(oldestKey);
      }
    }

    // Broadcast to WebSocket clients (like original backend)
    if (this.webSocketGateway && this.webSocketGateway.isRunning()) {
      // Send the log message via Socket.IO (like original backend)
      this.webSocketGateway.sendLog(wsMessage);
      
      // Also emit 'logged' event for compatibility
      setImmediate(() => {
        this.webSocketGateway.broadcastMessage('logged', {
          level: level.toUpperCase(),
          message: message,
          label: label,
          timestamp: Date.now(),
        });
      });
    }
  }

  /**
   * Get all logs
   */
  getAllLogs(): WsMessage[] {
    return Array.from(this.logs.values()).sort((a, b) => b.time - a.time);
  }

  /**
   * Get logs with filtering
   */
  getFilteredLogs(options: {
    level?: string;
    label?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): {
    logs: WsMessage[];
    total: number;
  } {
    let filteredLogs = Array.from(this.logs.values());

    // Apply filters
    if (options.level && options.level !== 'ALL') {
      filteredLogs = filteredLogs.filter(log => log.level === options.level);
    }

    if (options.label && options.label !== 'ALL') {
      filteredLogs = filteredLogs.filter(log => log.label === options.label);
    }

    if (options.search) {
      const searchTerm = options.search.toLowerCase();
      filteredLogs = filteredLogs.filter(
        log =>
          log.value.toLowerCase().includes(searchTerm) ||
          log.label.toLowerCase().includes(searchTerm)
      );
    }

    // Sort by time (newest first)
    filteredLogs.sort((a, b) => b.time - a.time);

    const total = filteredLogs.length;

    // Apply pagination
    if (options.offset !== undefined || options.limit !== undefined) {
      const offset = options.offset || 0;
      const limit = options.limit || 100;
      filteredLogs = filteredLogs.slice(offset, offset + limit);
    }

    return {
      logs: filteredLogs,
      total,
    };
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs.clear();
    this.logCounter = 0;
    this.logger.info('All logs cleared');
  }

  /**
   * Get unique labels from logs
   */
  getUniqueLabels(): string[] {
    const labels = new Set<string>();
    this.logs.forEach(log => labels.add(log.label));
    return Array.from(labels).sort();
  }

  /**
   * Get log statistics
   */
  getLogStats(): {
    total: number;
    byLevel: Record<string, number>;
    byLabel: Record<string, number>;
  } {
    const stats = {
      total: this.logs.size,
      byLevel: {} as Record<string, number>,
      byLabel: {} as Record<string, number>,
    };

    this.logs.forEach(log => {
      // Count by level
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;

      // Count by label
      stats.byLabel[log.label] = (stats.byLabel[log.label] || 0) + 1;
    });

    return stats;
  }

  /**
   * Setup log capture from the winston logger
   */
  private setupLogCapture(): void {
    // Get the winston logger instance and add a custom transport
    const winston = require('winston');
    const { Writable } = require('stream');

    // Create a writable stream for the journal transport
    const journalStream = new Writable({
      write: (chunk: Buffer, encoding: string, callback: Function) => {
        try {
          const message = chunk.toString();
          
          // Only skip very specific journal messages to prevent infinite loops
          const skipMessages = [
            'Journal service initialized',
            'Journal log capture initialized',
            'Sent log to',
            'All logs cleared'
          ];
          
          const shouldSkip = skipMessages.some(skipMsg => message.includes(skipMsg));
          if (shouldSkip) {
            callback();
            return;
          }
          
          // Parse the log message to extract level, category, and content
          // Try to parse JSON format first: {"level":"info","message":"...","component":"API","category":"API",...}
          try {
            const logData = JSON.parse(message);
            if (logData.level && logData.message) {
              const category = logData.category || logData.component || 'SYSTEM';
              this.addLogInternal(logData.level, category, logData.message);
              callback();
              return;
            }
          } catch (jsonError) {
            // Not JSON, continue with text parsing
          }
          
          // Parse text format: level: message {"service":"rfxcom2mqtt-nestjs","component":"API",...}
          const logWithMetaMatch = message.match(/^(\w+):\s*(.+?)\s*\{(.+)\}$/);
          if (logWithMetaMatch) {
            const [, level, content, metaStr] = logWithMetaMatch;
            try {
              const meta = JSON.parse(`{${metaStr}}`);
              const category = meta.category || meta.component || 'SYSTEM';
              this.addLogInternal(level, category, content.trim());
              callback();
              return;
            } catch (metaError) {
              // Continue with simpler parsing
            }
          }
          
          // Try to parse simpler format: level: message
          const simpleMatch = message.match(/^(\w+):\s*(.+)$/);
          if (simpleMatch) {
            const [, level, content] = simpleMatch;
            this.addLogInternal(level, 'SYSTEM', content.trim());
          } else {
            // Fallback for messages that don't match any expected format
            const cleanMessage = message.trim();
            if (cleanMessage && !skipMessages.some(skipMsg => cleanMessage.includes(skipMsg))) {
              this.addLogInternal('INFO', 'SYSTEM', cleanMessage);
            }
          }
        } catch (error) {
          // Avoid infinite loops by not logging this error
          console.error('Error capturing log for journal:', error);
        }
        callback();
      },
    });

    // Create a custom transport that captures logs for the journal
    const journalTransport = new winston.transports.Stream({
      stream: journalStream,
      level: 'debug', // Capture all log levels
    });

    // Add the transport to the logger
    logger.add(journalTransport);

    this.logger.info('Journal log capture initialized');
  }

  /**
   * Internal method to add logs without triggering WebSocket broadcasts
   * Used by log capture to prevent infinite loops
   */
  private addLogInternal(level: string, label: string, message: string): void {
    const logId = `log_${Date.now()}_${++this.logCounter}`;

    const wsMessage: WsMessage = {
      id: logId,
      level: level.toUpperCase(),
      label,
      value: message,
      time: Date.now(),
    };

    // Store the log
    this.logs.set(logId, wsMessage);

    // Maintain max logs limit
    if (this.logs.size > this.maxLogs) {
      const oldestKey = this.logs.keys().next().value;
      if (oldestKey) {
        this.logs.delete(oldestKey);
      }
    }

    // Add to pending logs for throttled broadcast
    this.pendingLogs.push(wsMessage);
    this.scheduleBroadcast();
  }

  /**
   * Schedule a throttled broadcast of pending logs
   */
  private scheduleBroadcast(): void {
    if (this.broadcastTimer) {
      return; // Already scheduled
    }

    this.broadcastTimer = setTimeout(() => {
      this.broadcastPendingLogs();
      this.broadcastTimer = null;
    }, 100); // Throttle to every 100ms
  }

  /**
   * Broadcast pending logs to WebSocket clients
   */
  private broadcastPendingLogs(): void {
    if (this.pendingLogs.length === 0) {
      return;
    }

    if (this.webSocketGateway && this.webSocketGateway.isRunning()) {
      // Send logs in batch to avoid overwhelming the frontend
      const logsToSend = this.pendingLogs.splice(0, 50); // Send max 50 logs at a time
      
      logsToSend.forEach(log => {
        this.webSocketGateway.sendLog(log);
      });
    } else {
      // Clear pending logs if WebSocket is not available
      this.pendingLogs = [];
    }
  }
}
