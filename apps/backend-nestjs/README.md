# RFXCOM2MQTT NestJS Backend

This is a NestJS-based implementation of the RFXCOM to MQTT bridge, providing a modern, scalable, and well-structured backend architecture.

## Features

- **NestJS Framework**: Modern Node.js framework with TypeScript support
- **Modular Architecture**: Clean separation of concerns with dedicated modules
- **API Documentation**: Automatic Swagger/OpenAPI documentation
- **Authentication**: Token-based authentication guard
- **WebSocket Support**: Real-time communication via Socket.IO
- **Configuration Management**: Environment-based configuration
- **Logging**: Structured logging with Winston
- **Validation**: Request validation with class-validator
- **Metrics**: Prometheus metrics support (configurable)

## Architecture

The application is organized into the following modules:

### Core Modules
- **AppModule**: Main application module
- **BridgeModule**: Bridge control and management
- **DeviceModule**: Device management and control
- **SettingsModule**: Configuration management

### Service Modules
- **MqttModule**: MQTT client and communication
- **RfxcomModule**: RFXCOM device communication
- **DiscoveryModule**: Home Assistant discovery
- **WebSocketModule**: Real-time WebSocket communication
- **PrometheusModule**: Metrics collection and export

## API Endpoints

### Application
- `GET /api` - Application information
- `GET /api/health` - Health check endpoint

### Bridge Management
- `POST /api/bridge/action` - Execute bridge action
- `POST /api/bridge/restart` - Restart the bridge
- `POST /api/bridge/stop` - Stop the bridge

### Device Management
- `GET /api/devices` - Get all devices
- `GET /api/devices/:id` - Get specific device
- `POST /api/devices/:id/action` - Execute device action

### Settings
- `GET /api/settings` - Get application settings
- `POST /api/settings` - Update application settings

## Configuration

The application uses environment variables for configuration. Create a `.env.dev` file for development:

```env
# Development environment configuration
NODE_ENV=development
LOG_LEVEL=debug

# Frontend configuration
PORT=8080
HOST=0.0.0.0

# MQTT configuration
MQTT_SERVER=mqtt://localhost:1883
MQTT_BASE_TOPIC=rfxcom2mqtt
MQTT_CLIENT_ID=rfxcom2mqtt-nestjs

# RFXCOM configuration
RFXCOM_PORT=/dev/ttyUSB0
RFXCOM_DEBUG=false

# Home Assistant configuration
HA_DISCOVERY=true
HA_DISCOVERY_PREFIX=homeassistant

# Prometheus configuration
PROMETHEUS_ENABLED=false
PROMETHEUS_PORT=9090

# Health check configuration
HEALTHCHECK_ENABLED=true
HEALTHCHECK_CRON=0 */5 * * * *
```

## Development

### Prerequisites
- Node.js 22+
- pnpm 9+

### Installation
```bash
cd apps/backend-nestjs
pnpm install
```

### Development Server
```bash
pnpm run start:dev
```

### Build
```bash
pnpm run build
```

### Production
```bash
pnpm run start:prod
```

### Testing
```bash
# Unit tests
pnpm run test

# Test coverage
pnpm run test:cov

# E2E tests
pnpm run test:e2e
```

## API Documentation

When the application is running, Swagger documentation is available at:
- http://localhost:8080/api/docs

## Authentication

The API supports token-based authentication. Set the `AUTH_TOKEN` environment variable to enable authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer your-token-here
```

## WebSocket Events

The application provides real-time updates via WebSocket connections on the default Socket.IO endpoint.

## Migration from Express Backend

This NestJS implementation provides the same functionality as the original Express-based backend but with improved:

- **Type Safety**: Full TypeScript support with decorators
- **Modularity**: Clean module separation
- **Testing**: Built-in testing framework
- **Documentation**: Automatic API documentation
- **Validation**: Request/response validation
- **Dependency Injection**: Proper IoC container
- **Scalability**: Better structure for large applications

## TODO

The following features need to be implemented to match the original backend:

1. **MQTT Integration**: Complete MQTT client implementation
2. **RFXCOM Integration**: Full RFXCOM device communication
3. **Discovery Service**: Home Assistant discovery implementation
4. **Prometheus Metrics**: Complete metrics collection
5. **State Management**: Device and application state persistence
6. **Health Checks**: Scheduled health monitoring
7. **Error Handling**: Comprehensive error handling and recovery
8. **Configuration Persistence**: Settings save/load functionality

## Contributing

1. Follow the existing code structure and patterns
2. Add proper TypeScript types
3. Include unit tests for new features
4. Update API documentation
5. Follow NestJS best practices
