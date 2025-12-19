# Frontend Dockerfile (Vite build -> Nginx)
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable

# Copy workspace manifests
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY frontend/package.json ./frontend/package.json

# Install deps
ENV HUSKY=0
RUN pnpm install --frozen-lockfile

# Copy source
COPY frontend ./frontend

# Build (expects VITE_API_URL provided at build time or via .env.production)
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN pnpm -C frontend build

# -------- Runtime (nginx) --------
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

# Copy custom nginx config (SPA fallback)
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output
COPY --from=builder /app/frontend/dist ./

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
