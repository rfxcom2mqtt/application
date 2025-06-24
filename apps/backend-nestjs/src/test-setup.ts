import 'reflect-metadata';

// Ensure proper environment setup for NestJS testing
process.env.NODE_ENV = 'test';

// Mock any global dependencies if needed
global.console = {
  ...console,
  // Suppress logs during testing if desired
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
