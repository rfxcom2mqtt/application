# RFXCOM2MQTT Monorepo

This monorepo contains the RFXCOM to MQTT bridge and its frontend application.

## Project Structure

```
monorepo/
├── apps/
│   ├── backend/       # RFXCOM to MQTT bridge backend
│   └── frontend/      # React frontend application
├── package.json       # Root package.json for monorepo management
└── pnpm-workspace.yaml # Workspace configuration
```

## Prerequisites

- Node.js v22 or higher
- pnpm v8 or higher

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Build all packages:

```bash
pnpm build
```

3. Start development mode:

```bash
pnpm dev
```

## Available Scripts

- `pnpm build`: Build all packages
- `pnpm dev`: Start all packages in development mode
- `pnpm start`: Start all packages
- `pnpm test`: Run tests for all packages
- `pnpm lint`: Run linting for all packages
- `pnpm pretty`: Format code in all packages
- `pnpm pretty:check`: Check code formatting in all packages

## Working with Individual Packages

You can run commands for specific packages using the following syntax:

```bash
pnpm --filter @rfxcom2mqtt/backend <command>
pnpm --filter @rfxcom2mqtt/frontend <command>
```

For example:

```bash
# Start only the backend
pnpm --filter @rfxcom2mqtt/backend dev

# Build only the frontend
pnpm --filter @rfxcom2mqtt/frontend build
```

## License

- Backend: Apache-2.0
- Frontend: GPL-3.0
