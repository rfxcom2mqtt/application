#!/bin/bash

# Initialize the RFXCOM2MQTT monorepo
echo "Initializing RFXCOM2MQTT monorepo..."

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Build packages
echo "Building packages..."
pnpm build

echo "Monorepo initialization complete!"
echo "You can now run 'pnpm dev' to start the development environment."
