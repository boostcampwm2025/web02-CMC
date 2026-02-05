# Backend Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app

# Enable pnpm
RUN corepack enable

# Copy workspace 
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/package.json ./backend/package.json

# 의존성 설치
ENV HUSKY=0
RUN HUSKY=0 pnpm install --frozen-lockfile

# Copy source
COPY backend ./backend
COPY backend/prisma ./backend/prisma

# Prisma Client 생성
RUN pnpm -C backend prisma:generate

# Build backend
RUN pnpm -C backend build

# -------- Runtime image --------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache tzdata
ENV TZ=Asia/Seoul

RUN corepack enable

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/package.json ./backend/package.json

# 의존성 설치 (프로덕션용, husky 스크립트 무시)
ENV HUSKY=0
RUN HUSKY=0 pnpm install --filter backend --prod --frozen-lockfile --ignore-scripts

# Copy built artifacts
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma

COPY backend/prisma.config.ts ./backend/prisma.config.ts

EXPOSE 3000
CMD ["pnpm", "-C", "backend", "start:prod"]
