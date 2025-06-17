# Contributing to RFXCOM2MQTT Frontend

Thank you for your interest in contributing to the RFXCOM2MQTT Frontend project! This document provides guidelines and information to help you get started with contributing.

## Project Architecture

The RFXCOM2MQTT Frontend is a React application built with TypeScript that provides a user interface for managing RFXCOM devices through MQTT. Here's an overview of the project architecture:

### Directory Structure

```
/src
  /api          # API clients for backend communication
  /components   # Reusable UI components
  /models       # TypeScript interfaces and types
  /pages        # Application pages
  /utils        # Utility functions
/public         # Static assets and configuration
```

### Key Components

- **API Layer**: The `src/api` directory contains API clients for communicating with the backend. Each API client is responsible for a specific domain (e.g., devices, settings, controller).

- **Models**: The `src/models` directory contains TypeScript interfaces and types that define the data structures used throughout the application.

- **Pages**: The `src/pages` directory contains the main pages of the application, organized by feature.

- **Components**: The `src/components` directory contains reusable UI components used across the application.

- **Utils**: The `src/utils` directory contains utility functions for common tasks like making HTTP requests and managing configuration.

### Data Flow

1. **API Requests**: The application communicates with the backend through API clients in the `src/api` directory.
2. **State Management**: Each page manages its own state using React hooks.
3. **UI Components**: The UI is built using Material-UI components and custom components.
4. **WebSocket**: Real-time updates are received through a WebSocket connection in the Journals page.

## Development Setup

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

### Available Scripts

- `npm start` - Starts the development server
- `npm run build` - Builds the app for production
- `npm run gzip` - Builds the app and compresses it
- `npm run test` - Runs tests
- `npm run pretty` - Formats code with Prettier
- `npm run lint` - Lints code with ESLint

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define interfaces for all data structures
- Use proper type annotations for function parameters and return values

### React

- Use functional components with hooks
- Use React Router for navigation
- Follow the React component lifecycle

### Code Style

- Use Prettier for code formatting
- Use ESLint for code linting
- Follow the existing code style

### Documentation

- Document all functions, classes, and interfaces with JSDoc comments
- Keep the README and other documentation up to date

## Pull Request Process

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes
4. Run tests and ensure they pass
5. Format your code with Prettier
6. Submit a pull request

## Code Review Process

All pull requests will be reviewed by the project maintainers. Here's what we look for in a pull request:

- Code quality and adherence to coding standards
- Test coverage
- Documentation
- Performance considerations

## License

By contributing to this project, you agree that your contributions will be licensed under the project's GPL-3.0 License.
