FROM node:24-alpine AS base

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

FROM base AS builder

# Copy source code (excluding node_modules via .dockerignore)
COPY apps/ ./apps/
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY eslint.config.js .prettierrc ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build both applications
RUN pnpm build

# 2. Production stage
FROM base AS production

# Install curl for health checks and enable pnpm for workspace support
RUN apk add --no-cache curl

# Create data directory for runtime files
RUN mkdir -p ./data

# Set environment variables
ENV NODE_ENV=production
ENV PROFILE=production

# Expose port 8891 (backend serves both API and frontend)
EXPOSE 8891
ENV PORT=8891

# Copy workspace configuration files for proper dependency resolution
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./

# Copy backend package.json and built application
COPY --from=builder /app/apps/backend/package.json ./
COPY --from=builder /app/apps/backend/dist ./dist

# Copy frontend package.json, index.js and built application for workspace dependency
COPY --from=builder /app/apps/frontend/package.json ./apps/frontend/
COPY --from=builder /app/apps/frontend/index.js ./apps/frontend/
COPY --from=builder /app/apps/frontend/dist ./apps/frontend/dist

# Install production dependencies only (this will create proper workspace links)
RUN pnpm install --prod --no-frozen-lockfile

# Health check to ensure the application is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8891/api/bridge/info || exit 1

ARG NODE_ENTRYPOINT=./dist/index.js
ENV NODE_ENTRYPOINT="${NODE_ENTRYPOINT}"

CMD [ "sh", "-c", "node $NODE_ENTRYPOINT" ]
