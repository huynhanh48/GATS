#!/bin/bash
# Entrypoint container DEV: dựng hạ tầng (postgres, redis, s3) rồi chạy 3 dev server.
set -e

PGDATA=/var/lib/postgresql/data
S3_DIR=/data/s3
REDIS_DIR=/data/redis
PG_BIN=$(dirname "$(ls /usr/lib/postgresql/*/bin/initdb | head -1)")

# ---------------------------------------------------------------- Postgres
mkdir -p "$PGDATA" /var/run/postgresql
chown -R postgres:postgres "$PGDATA" /var/run/postgresql
chmod 700 "$PGDATA"

# Clean stale pid file if exists
rm -f "$PGDATA/postmaster.pid"

if [ ! -s "$PGDATA/PG_VERSION" ]; then
  echo "[dev] initdb $PGDATA"
  su postgres -c "$PG_BIN/initdb -D $PGDATA --auth-local=trust --auth-host=scram-sha-256" >/dev/null
fi

if ! su postgres -c "$PG_BIN/pg_ctl -D $PGDATA status" >/dev/null 2>&1; then
  echo "[dev] start postgres"
  su postgres -c "$PG_BIN/pg_ctl -D $PGDATA -l /var/lib/postgresql/pg.log -w start"
  su postgres -c "psql -q -c \"ALTER USER postgres PASSWORD 'postgres';\"" >/dev/null
fi

# Session DB phải là UTC để khớp cách Drizzle ghi/đọc `timestamp without time zone`
# (xem be/src/common/constants/time.ts). Nếu để giờ Việt Nam, now()/defaultNow()
# sẽ lệch 7 giờ so với dữ liệu do app ghi. Idempotent.
su postgres -c "psql -q -c \"ALTER SYSTEM SET timezone = 'UTC';\" -c \"SELECT pg_reload_conf();\"" >/dev/null 2>&1 || true

# ---------------------------------------------------------------- Redis
mkdir -p "$REDIS_DIR"
if ! redis-cli ping >/dev/null 2>&1; then
  echo "[dev] start redis"
  redis-server --appendonly yes --dir "$REDIS_DIR" --daemonize yes
fi

# ---------------------------------------------------------------- S3 (RustFS)
mkdir -p "$S3_DIR"
if ! curl -s -o /dev/null http://127.0.0.1:9010/ >/dev/null 2>&1; then
  echo "[dev] start rustfs (S3)"
  RUSTFS_ACCESS_KEY=minioadmin RUSTFS_SECRET_KEY=minioadmin \
    RUSTFS_VOLUMES="$S3_DIR" RUSTFS_ADDRESS=127.0.0.1:9010 RUSTFS_CONSOLE_ADDRESS=127.0.0.1:9011 \
    rustfs >/var/log/rustfs.log 2>&1 &
fi

# ---------------------------------------------------------------- buckets
node /app/docker/dev-s3-init.cjs

# ---------------------------------------------------------------- node deps
# node_modules nằm trong volume nên rebuild image KHÔNG cập nhật nó. So
# package-lock.json với dấu `.gats-lock` (tạo lúc build image) để tự chạy
# `npm ci` khi danh sách package đổi (vd fe chuyển từ Next.js sang Vite).
sync_deps() {
  app="$1"
  lock="/app/$app/package-lock.json"
  stamp="/app/$app/node_modules/.gats-lock"
  if [ ! -f "$stamp" ] || ! cmp -s "$lock" "$stamp"; then
    echo "[dev] package-lock.json của $app đã đổi — chạy npm ci"
    (cd "/app/$app" && npm ci --include=dev) && cp "$lock" "$stamp"
  fi
}
sync_deps be
sync_deps admin
sync_deps fe

# ---------------------------------------------------------------- database
cd /app/be
echo "[dev] migrate + seed database"
# Fail fast: a migration error must stop the container, otherwise the dev
# servers would run against a half-migrated schema.
npm run db:migrate:versioned
npm run db:seed
# Roles + permissions + tài khoản admin (ADMIN_DEFAULT_*) + 6 nhóm khoá học chính.
DOTENV_CONFIG_PATH=./config/.env.development npm run db:seed:core

# ---------------------------------------------------------------- apps
cd /app
echo "[dev] start be + admin + fe"
exec "$@"
