# GATS Academy — image PRODUCTION.
# Một container chạy: be (API) + admin (dashboard) + fe (web) qua pm2.
# Build context = gốc repo. Xem README.md / docker-compose.prod.yml.
# (Bản dev dùng Dockerfile.dev — chạy dev server + postgres/redis/s3 trong 1 container.)

# Stage 1: Build admin (Next.js admin dashboard)
FROM node:22-bookworm-slim AS admin-builder
WORKDIR /app/admin
COPY admin/package*.json ./
RUN npm ci --include=dev
COPY admin/ .
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_BE_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_BE_SOCKET_URL=$NEXT_PUBLIC_API_URL \
    NODE_ENV=production
RUN npm run build

# Stage 2: Build fe (Vite SPA — React 19 + Vite + Tailwind)
FROM node:22-bookworm-slim AS fe-builder
WORKDIR /app/fe
COPY fe/package*.json ./
RUN npm ci --include=dev
COPY fe/ .
# PUBLIC_* vars are inlined into the client bundle AT BUILD TIME (vite envPrefix
# in fe/vite.config.js), so they must be passed as build args
# (see docker-compose.prod.yml build.args). Output: /app/fe/dist (static).
ARG PUBLIC_GOOGLE_CLIENT_ID
# Local-safe default. Prod compose/.env must pass https://api.gats.vn.
ARG PUBLIC_API_URL=http://localhost:3000
# Fallback STK hiển thị ở modal thanh toán khi API không trả về (fe đọc
# BANK_* hoặc PUBLIC_BANK_*, xem fe/src/modules/course/components/CoursePaymentModal.jsx).
ARG BANK_NAME
ARG BANK_ACCOUNT_NUMBER
ARG BANK_ACCOUNT_NAME
ENV PUBLIC_GOOGLE_CLIENT_ID=$PUBLIC_GOOGLE_CLIENT_ID \
    PUBLIC_API_URL=$PUBLIC_API_URL \
    BANK_NAME=$BANK_NAME \
    BANK_ACCOUNT_NUMBER=$BANK_ACCOUNT_NUMBER \
    BANK_ACCOUNT_NAME=$BANK_ACCOUNT_NAME
RUN npm run build

# Stage 3: Build be (Express + TypeScript API)
FROM node:22-alpine AS be-builder
WORKDIR /app/be
COPY be/package*.json ./
RUN npm ci --include=dev
COPY be/ .
ENV NODE_ENV=production
RUN npm run build

# Stage 4: Runtime image (Debian bookworm — ffmpeg + drizzle CLI)
FROM node:22-bookworm-slim

# ffmpeg (video worker) + pm2 + serve (static server cho fe SPA)
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ffmpeg \
    ca-certificates \
    curl \
    procps \
  && rm -rf /var/lib/apt/lists/* \
  && npm install -g pm2 serve

WORKDIR /app

# Copy built admin dashboard
COPY --from=admin-builder /app/admin/package*.json ./admin/
COPY --from=admin-builder /app/admin/node_modules ./admin/node_modules
COPY --from=admin-builder /app/admin/.next ./admin/.next
COPY --from=admin-builder /app/admin/public ./admin/public
COPY --from=admin-builder /app/admin/next.config.mjs ./admin/next.config.mjs

# Copy built web app — SPA tĩnh: chỉ cần dist, không cần node_modules
COPY --from=fe-builder /app/fe/dist ./fe/dist

# Copy built backend (dist + deps) plus what drizzle-kit needs at runtime.
COPY --from=be-builder /app/be/package*.json ./be/
COPY --from=be-builder /app/be/node_modules ./be/node_modules
COPY --from=be-builder /app/be/dist ./be/dist
COPY --from=be-builder /app/be/migrations ./be/migrations
COPY --from=be-builder /app/be/scripts ./be/scripts
COPY --from=be-builder /app/be/drizzle.config.ts ./be/drizzle.config.ts
COPY --from=be-builder /app/be/tsconfig.json ./be/tsconfig.json
COPY --from=be-builder /app/be/src ./be/src
# start/start:worker load DOTENV_CONFIG_PATH=./config/.env.production — file có thể
# trống; biến thật lấy từ Compose/VPS env (dotenv không ghi đè env đã set).
RUN mkdir -p ./be/config \
  && printf '%s\n' '# Runtime secrets come from container env (docker-compose / VPS).' \
    > ./be/config/.env.production

# Copy ecosystem config + entrypoint (runs DB migrations, then pm2)
COPY ecosystem.config.js .
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
# Normalize potential CRLF line endings (Windows host) so the shebang is valid.
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh \
  && chmod +x /usr/local/bin/docker-entrypoint.sh

# Container-internal ports (host mapping is defined in docker-compose.prod.yml).
# be API (3000), admin dashboard (3001), fe web (3002)
EXPOSE 3000 3001 3002

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["pm2-runtime", "ecosystem.config.js"]
