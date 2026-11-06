#!/bin/sh
set -e

# Apply immutable, ordered SQL migrations before booting app processes.
# The DB is guaranteed healthy by compose `depends_on: service_healthy`.
echo "[entrypoint] Applying versioned database migrations..."
cd /app/be
if npm run db:migrate:versioned; then
  echo "[entrypoint] Database migrations complete."
else
  echo "[entrypoint] ERROR: database migration failed; refusing to start production processes."
  exit 1
fi

# Idempotent core seed: roles + permissions + admin (ADMIN_DEFAULT_*) +
# 6 nhóm khoá học chính (cowork/mastery/studio/automation/code/agents).
# Env comes from Compose/VPS, so no DOTENV_CONFIG_PATH here.
echo "[entrypoint] Seeding roles, permissions, admin and core course categories..."
if npm run db:seed:core; then
  echo "[entrypoint] Core seed complete."
else
  echo "[entrypoint] ERROR: core seed failed; refusing to start production processes."
  exit 1
fi

cd /app
echo "[entrypoint] Starting processes with pm2..."
exec "$@"
