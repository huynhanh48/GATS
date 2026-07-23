#!/bin/sh
set -e

# Apply immutable, ordered SQL migrations before booting app processes.
# The DB is guaranteed healthy by compose `depends_on: service_healthy`.
echo "[entrypoint] Applying versioned database migrations..."
cd /app/gats-academy
if npm run db:migrate:versioned; then
  echo "[entrypoint] Database migrations complete."
else
  echo "[entrypoint] ERROR: database migration failed; refusing to start production processes."
  exit 1
fi

cd /app
echo "[entrypoint] Starting processes with pm2..."
exec "$@"
