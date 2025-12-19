# Backend Dockerfile (NestJS, pnpm workspace)
FROM node:20-alpine AS builder
WORKDIR /app

# Enable pnpm
RUN corepack enable

# Copy workspace manifests
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/package.json ./backend/package.json

# Install deps (workspace-aware)
RUN pnpm install --frozen-lockfile

# Copy source
COPY backend ./backend

# Build backend
RUN pnpm -C backend build

# -------- Runtime image --------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable

# Copy workspace manifests for pnpm install
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/package.json ./backend/package.json

# Install prod deps only for backend
RUN pnpm install --filter backend --prod --frozen-lockfile

# Copy built artifacts
COPY --from=builder /app/backend/dist ./backend/dist

EXPOSE 3000
CMD ["pnpm", "-C", "backend", "start:prod"]
