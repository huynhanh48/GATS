# Stage 1: Build Web App
FROM node:22-alpine AS web-builder
WORKDIR /app/web-app
# Install with --include=dev so build tools (next, etc.) are present even if
# the host Bake sets NODE_ENV=production. Do NOT leave NODE_ENV=development
# for `next build` — Next.js 16 then fails prerender with useContext null.
COPY web-app/package*.json ./
RUN npm ci --include=dev
COPY web-app/ .
# NEXT_PUBLIC_* vars are inlined into the client bundle AT BUILD TIME,
# so they must be passed as build args (see docker-compose.yml build.args).
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_API_URL=https://api.gats.vn
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NODE_ENV=production
RUN npm run build

# Stage 2: Build Backend (folder BE)
FROM node:22-alpine AS be-builder
WORKDIR /app/BE
COPY BE/package*.json ./
RUN npm ci --include=dev
COPY BE/ .
ENV NODE_ENV=production
RUN npm run build

# Stage 3: Build Admin Dashboard
FROM node:22-alpine AS admin-builder
WORKDIR /app/admin-dashboard
COPY admin-dashboard/package*.json ./
RUN npm ci --include=dev
COPY admin-dashboard/ .
ARG NEXT_PUBLIC_API_URL=https://api.gats.vn
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_BE_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_BE_SOCKET_URL=$NEXT_PUBLIC_API_URL \
    NODE_ENV=production
RUN npm run build

# Stage 4: Production Image
FROM node:22-alpine

# Install ffmpeg for the worker and pm2 for process management
RUN apk add --no-cache ffmpeg && npm install -g pm2

WORKDIR /app

# Copy built web app
COPY --from=web-builder /app/web-app/package*.json ./web-app/
COPY --from=web-builder /app/web-app/node_modules ./web-app/node_modules
COPY --from=web-builder /app/web-app/.next ./web-app/.next
COPY --from=web-builder /app/web-app/public ./web-app/public
COPY --from=web-builder /app/web-app/next.config.ts ./web-app/next.config.ts

# Copy built backend (dist + deps) plus what drizzle-kit needs at runtime.
# In-image path stays /app/gats-academy (chỉ là đường dẫn trong container).
COPY --from=be-builder /app/BE/package*.json ./gats-academy/
COPY --from=be-builder /app/BE/node_modules ./gats-academy/node_modules
COPY --from=be-builder /app/BE/dist ./gats-academy/dist
COPY --from=be-builder /app/BE/migrations ./gats-academy/migrations
COPY --from=be-builder /app/BE/scripts ./gats-academy/scripts
COPY --from=be-builder /app/BE/drizzle.config.ts ./gats-academy/drizzle.config.ts
COPY --from=be-builder /app/BE/tsconfig.json ./gats-academy/tsconfig.json
COPY --from=be-builder /app/BE/src ./gats-academy/src
# start/start:worker load DOTENV_CONFIG_PATH=./config/.env.production — file có thể
# trống; biến thật lấy từ Compose/VPS env (dotenv không ghi đè env đã set).
RUN mkdir -p ./gats-academy/config \
  && printf '%s\n' '# Runtime secrets come from container env (docker-compose / VPS).' \
    > ./gats-academy/config/.env.production

# Copy built admin dashboard
COPY --from=admin-builder /app/admin-dashboard/package*.json ./admin-dashboard/
COPY --from=admin-builder /app/admin-dashboard/node_modules ./admin-dashboard/node_modules
COPY --from=admin-builder /app/admin-dashboard/.next ./admin-dashboard/.next
COPY --from=admin-builder /app/admin-dashboard/public ./admin-dashboard/public
COPY --from=admin-builder /app/admin-dashboard/next.config.mjs ./admin-dashboard/next.config.mjs

# Copy ecosystem config + entrypoint (runs DB migrations, then pm2)
COPY ecosystem.config.js .
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
# Normalize potential CRLF line endings (Windows host) so the shebang is valid.
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh \
  && chmod +x /usr/local/bin/docker-entrypoint.sh

# Container-internal ports (host mapping is defined in docker-compose.yml).
# Backend API (3000), Web App (3005), Admin Dashboard (9000)
EXPOSE 3000 3005 9000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["pm2-runtime", "ecosystem.config.js"]
