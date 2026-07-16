#!/bin/sh
set -e

echo "[Entrypoint] Starting Next.js server..."
exec node server.js
