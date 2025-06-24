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

// Logger factory for creating named loggers
export const loggerFactory = {
  getLogger: (name: string) => {
    return logger.child({ component: name });
  },
};
