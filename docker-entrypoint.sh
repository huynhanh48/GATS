#!/bin/sh
set -e

# Sync the DB schema before booting the app processes.
# The DB is guaranteed healthy by compose `depends_on: service_healthy`.
# We use `drizzle-kit push` (schema → DB) instead of `migrate` because the
# committed migration files have an ordering issue; push is idempotent and
# reconciles the live schema against src/db/schema.ts on every start.
echo "[entrypoint] Syncing database schema (drizzle-kit push)..."
cd /app/gats-academy
if npx --no-install drizzle-kit push --force; then
  echo "[entrypoint] Schema synced."
else
  echo "[entrypoint] ERROR: schema push failed; refusing to start production processes."
  exit 1
fi

cd /app
echo "[entrypoint] Starting processes with pm2..."
exec "$@"
