/**
 * Configuration interface for the application
 */
export interface Config {
  /**
   * Base path for the application routes
   * @default ''
   */
  basePath: string;

  /**
   * Public path for static assets
   * @default ''
   */
  publicPath: string;

  /**
   * WebSocket namespace for real-time communication
   * @default ''
   */
  wsNamespace: string;
}

/**
 * Default configuration values
 */
const defaultConfig: Config = {
  basePath: '',
  publicPath: '',
  wsNamespace: '',
};

/**
 * Retrieves the application configuration from window.config
 * Falls back to default values if properties are missing
 *
 * @returns {Config} The application configuration
 */
const getConfig = (): Config => {
  const windowConfig = (window as any).config || {};

  // Merge with default config to ensure all properties exist
  return {
    ...defaultConfig,
    ...windowConfig,
  };
};

const config = getConfig();

export default config;
