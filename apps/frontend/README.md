# RFXCOM2MQTT Frontend

[![RFXCOM](rfxcom.png)](http://www.rfxcom.com)

A React-based frontend interface for the RFXCOM to MQTT bridge for RFXtrx433 devices.

## Overview

RFXCOM2MQTT is a bridge that connects RFXtrx433 devices to MQTT, making them accessible for home automation systems like Home Assistant. This frontend provides a user-friendly interface to manage and monitor your RFXCOM devices.

All received RFXCOM events are published to the MQTT rfxcom2mqtt/devices/\<id\> topic.
It is up to the MQTT receiver to filter these messages or to have a register/learning/pairing mechanism.

## Features

- **Device Management**: View and control all your RFXCOM devices
- **Controller Information**: Monitor the status and information of your RFXCOM controller
- **Settings Management**: Configure MQTT, RFXCOM, frontend, and Home Assistant integration settings
- **Real-time Logs**: View system logs in real-time through WebSocket connection

## Installation

### Prerequisites

- Node.js >= 18
- npm or yarn

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/rfxcom2mqtt/frontend.git
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

4. Build for production:
   ```bash
   npm run build
   # or
   yarn build
   ```

## Configuration

The frontend can be configured through the `public/config.js` file:

```javascript
window.config = {
    basePath: '', // Base path for the application
    publicPath: '', // Public path for assets
    wsNamespace: '', // WebSocket namespace
};
```

## Development

### Available Scripts

- `npm start` - Starts the development server
- `npm run build` - Builds the app for production
- `npm run gzip` - Builds the app and compresses it
- `npm run test` - Runs tests
- `npm run pretty` - Formats code with Prettier
- `npm run lint` - Lints code with ESLint

## Project Structure

- `/src` - Source code
  - `/api` - API clients for backend communication
  - `/components` - Reusable UI components
  - `/models` - TypeScript interfaces and types
  - `/pages` - Application pages
  - `/utils` - Utility functions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## [Documentation](https://rfxcom2mqtt.github.io/documentation/)

For more detailed documentation, visit the [official documentation site](https://rfxcom2mqtt.github.io/documentation/).
