# Production runbook — gats.vn

## Release gates

Public payment stays disabled until security configuration, versioned migration,
HTTPS health checks, and purchase-to-learn staging E2E all pass.

## DNS and external providers

Create A records for `gats.vn`, `api.gats.vn`, and `admin.gats.vn` to the VPS
public IP. Configure Google OAuth origins for `https://gats.vn` and
`https://admin.gats.vn`; configure the SePay webhook as
`https://api.gats.vn/api/payment/sepay/webhook`.

Set the browser-facing S3 URL to HTTPS. Verify SMTP credentials from the VPS.
These provider changes are external and cannot be inferred from repository code.

## First deployment

1. Copy `.env.vps.example` to `.env` and provide every required secret.
2. For an existing database, take a backup and set
   `MIGRATION_BASELINE_THROUGH=20260723065532_production_baseline` for the first
   deployment only. A fresh database leaves it empty.
3. Obtain the initial certificate before starting nginx:

   ```sh
   docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm \
     --service-ports --entrypoint certbot certbot certonly --standalone \
     --agree-tos --no-eff-email -m ops@gats.vn \
     -d gats.vn -d api.gats.vn -d admin.gats.vn
   ```

4. Deploy the immutable image:

   ```sh
   docker compose -p gats-academy \
     -f docker-compose.yml -f docker-compose.prod.yml up --build -d
   docker compose -p gats-academy \
     -f docker-compose.yml -f docker-compose.prod.yml --profile cert-renew up -d
   ```

5. Remove `MIGRATION_BASELINE_THROUGH` after the first successful existing-DB
   deployment. Future SQL generated into `BE/migrations/` is checksum-verified
   and applied exactly once.

## Migration rehearsal and rollback

Before deployment, create a `pg_dump -Fc` backup. Restore it into a temporary
database, run `BE/scripts/migrate-versioned.js`, and execute API smoke tests.
For rollback, stop `app`, restore that dump into a new database, point
`DATABASE_URL` to it, then restart. SQL migrations are forward-only; never edit
an applied migration because the runner rejects checksum drift.

The production baseline was rehearsed locally in both modes:

- empty database: 289 statements, 55 public tables; replay is idempotent;
- restored current database: explicit baseline adoption succeeds;
- backup/restore: `pg_dump -Fc` → `pg_restore` into a separate database.

## Verification

Run `powershell -File deploy/verify-production.ps1`. Also verify:

- cookie login survives nginx TLS termination;
- an untrusted mutation Origin receives 403;
- missing/wrong SePay key receives 503/401 and a valid duplicate remains
  idempotent;
- QR → paid webhook → enrollment → learning → certificate completes on staging;
- amount mismatch creates a payment exception and does not enroll.

Production logs are JSON and include `requestId`, status, path, and latency.
Alert on `status >= 500`, `event=unhandled_error`, SePay failures, and worker
process restarts using the VPS log collector.
