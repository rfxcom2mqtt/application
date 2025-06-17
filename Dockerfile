FROM node:24-slim AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# Copy all source code
COPY . ./
RUN pnpm install

# Build frontend and backend
RUN pnpm build

# 2. Production stage
FROM node:24-slim AS production

WORKDIR /app

# Copy backend build and node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules

# Copy frontend build to backend's public directory
COPY --from=builder /app/apps/frontend/dist ./apps/backend/public

# Copy backend source files (for config, etc.)
COPY apps/backend/package*.json ./apps/backend/

# Expose port (adjust as needed)
EXPOSE 3000

# Start backend (serves frontend as static files)
CMD ["node", "./apps/backend/dist/index.js"]



