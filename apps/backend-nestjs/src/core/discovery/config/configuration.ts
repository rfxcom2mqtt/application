import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

export const configurationLoader = () => {
  try {
    // Try to load config from YAML file
    const configPath = join(process.cwd(), 'config', 'config.yml');
    const fileContents = readFileSync(configPath, 'utf8');
    const config = yaml.load(fileContents) as Record<string, any>;

    return config;
  } catch (error) {
    // Fallback to default configuration
    return {
      frontend: {
        enabled: true,
        port: parseInt(process.env.PORT || '8080', 10),
        host: process.env.HOST || '0.0.0.0',
        authToken: process.env.AUTH_TOKEN || null,
        sslCert: process.env.SSL_CERT || null,
        sslKey: process.env.SSL_KEY || null,
      },
      mqtt: {
        server: process.env.MQTT_SERVER || 'mqtt://localhost:1883',
        base_topic: process.env.MQTT_BASE_TOPIC || 'rfxcom2mqtt',
        username: process.env.MQTT_USERNAME || null,
        password: process.env.MQTT_PASSWORD || null,
        client_id: process.env.MQTT_CLIENT_ID || 'rfxcom2mqtt',
        keepalive: parseInt(process.env.MQTT_KEEPALIVE || '60', 10),
        clean: process.env.MQTT_CLEAN === 'true',
        reconnectPeriod: parseInt(process.env.MQTT_RECONNECT_PERIOD || '1000', 10),
        connectTimeout: parseInt(process.env.MQTT_CONNECT_TIMEOUT || '30000', 10),
      },
      rfxcom: {
        port: process.env.RFXCOM_PORT || '/dev/ttyUSB0',
        debug: process.env.RFXCOM_DEBUG === 'true',
      },
      homeassistant: {
        discovery: process.env.HA_DISCOVERY === 'true',
        discovery_prefix: process.env.HA_DISCOVERY_PREFIX || 'homeassistant',
      },
      prometheus: {
        enabled: process.env.PROMETHEUS_ENABLED === 'true',
        port: parseInt(process.env.PROMETHEUS_PORT || '9090', 10),
      },
      healthcheck: {
        enabled: process.env.HEALTHCHECK_ENABLED === 'true',
        cron: process.env.HEALTHCHECK_CRON || '0 */5 * * * *', // Every 5 minutes
      },
      loglevel: process.env.LOG_LEVEL || 'info',
      devices: [],
    };
  }
};
