import * as winston from 'winston';

// Create a logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'rfxcom2mqtt-nestjs' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
});

// Logger factory for creating named loggers with categories
export const loggerFactory = {
  getLogger: (category: string) => {
    return logger.child({ 
      component: category,
      category: category // Add category field for easier filtering
    });
  },
};

// Pre-defined logger categories for consistency
export const LoggerCategories = {
  API: 'API',
  WEBSOCKET: 'WEBSOCKET',
  RFXCOM: 'RFXCOM',
  MQTT: 'MQTT',
  STORE: 'STORE',
  JOURNAL: 'JOURNAL',
  BRIDGE: 'BRIDGE',
  DISCOVERY: 'DISCOVERY',
  SETTINGS: 'SETTINGS',
  PROMETHEUS: 'PROMETHEUS',
  GATEWAY: 'GATEWAY',
} as const;

export type LoggerCategory = typeof LoggerCategories[keyof typeof LoggerCategories];
