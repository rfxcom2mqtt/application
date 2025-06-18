# Multi-stage Dockerfile to run both backend and frontend on port 3000
# Backend serves /api routes, frontend serves / routes

# 1. Build stage
FROM node:24-slim AS builder

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code (excluding node_modules via .dockerignore)
COPY apps/ ./apps/
COPY tsconfig.base.json ./
COPY eslint.config.js ./
COPY .prettierrc ./

# Build both applications
RUN pnpm build

# 2. Production stage
FROM node:24-slim AS production

# Install curl for health checks and enable pnpm for workspace support
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Enable pnpm for workspace resolution
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy workspace configuration to maintain package structure
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./

# Copy built backend application
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/

# Copy built frontend to backend's public directory for serving
COPY --from=builder /app/apps/frontend/dist ./apps/backend/public

# Copy production dependencies (including workspace links)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules

# Copy complete frontend package (needed for backend to import @rfxcom2mqtt/frontend)
COPY --from=builder /app/apps/frontend ./apps/frontend

# Create symlink for workspace package resolution
RUN mkdir -p ./apps/backend/node_modules/@rfxcom2mqtt && \
    rm -f ./apps/backend/node_modules/@rfxcom2mqtt/frontend && \
    ln -sf /app/apps/frontend ./apps/backend/node_modules/@rfxcom2mqtt/frontend

# Copy configuration files
COPY apps/backend/config ./apps/backend/config

# Create data directory for runtime files
RUN mkdir -p ./apps/backend/data

# Create symlink for config directory so the application can find it
RUN ln -sf ./apps/backend/config ./config

# Set environment variables
ENV NODE_ENV=production
ENV PROFILE=production

# Expose port 8891 (backend serves both API and frontend)
EXPOSE 8891

# Health check to ensure the application is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8891/api/bridge/info || exit 1

# Start the backend server (which serves both API and frontend)
CMD ["node", "./apps/backend/dist/index.js"]
