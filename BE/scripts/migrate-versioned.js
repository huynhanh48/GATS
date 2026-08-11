const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  const envFile =
    process.env.DOTENV_CONFIG_PATH ||
    path.join(
      __dirname,
      '..',
      'config',
      `.env.${process.env.NODE_ENV || 'development'}`,
    );
  require('dotenv').config({ path: envFile });
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

const migrationsDir = path.join(__dirname, '..', 'migrations');

function loadMigrations() {
  return fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const file = path.join(migrationsDir, entry.name, 'migration.sql');
      if (!fs.existsSync(file)) return null;
      const sql = fs.readFileSync(file, 'utf8');
      return {
        id: entry.name,
        sql,
        checksum: crypto.createHash('sha256').update(sql).digest('hex'),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.id.localeCompare(b.id));
}

async function ensureMetadata(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS gats_schema_migrations (
      id varchar(255) PRIMARY KEY,
      checksum varchar(64) NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now(),
      baseline boolean NOT NULL DEFAULT false
    )
  `);
}

async function countExistingTables(client) {
  const result = await client.query(`
    SELECT count(*)::int AS count
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename <> 'gats_schema_migrations'
  `);
  return result.rows[0].count;
}

async function recordBaseline(client, migrations, through) {
  const selected = migrations.filter((migration) => migration.id <= through);
  if (!selected.length || selected[selected.length - 1].id !== through) {
    throw new Error(
      `MIGRATION_BASELINE_THROUGH does not match a migration folder: ${through}`,
    );
  }

  for (const migration of selected) {
    await client.query(
      `INSERT INTO gats_schema_migrations (id, checksum, baseline)
       VALUES ($1, $2, true)
       ON CONFLICT (id) DO NOTHING`,
      [migration.id, migration.checksum],
    );
  }
  console.log(`[migrate] Baselined ${selected.length} migrations through ${through}`);
}

async function applyMigration(client, migration) {
  const statements = migration.sql
    .split(/-->\s*statement-breakpoint/g)
    .map((statement) => statement.trim())
    .filter(Boolean);

  await client.query('BEGIN');
  try {
    for (const statement of statements) {
      await client.query(statement);
    }
    await client.query(
      `INSERT INTO gats_schema_migrations (id, checksum, baseline)
       VALUES ($1, $2, false)`,
      [migration.id, migration.checksum],
    );
    await client.query('COMMIT');
    console.log(`[migrate] Applied ${migration.id} (${statements.length} statements)`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function main() {
  const migrations = loadMigrations();
  if (!migrations.length) throw new Error('No migration files found');

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await ensureMetadata(client);
    const existing = await client.query(
      'SELECT id, checksum FROM gats_schema_migrations ORDER BY id',
    );

    if (existing.rows.length === 0 && (await countExistingTables(client)) > 0) {
      const through = process.env.MIGRATION_BASELINE_THROUGH;
      if (!through) {
        throw new Error(
          'Existing schema has no migration history. Back up the DB, then set ' +
            'MIGRATION_BASELINE_THROUGH to the last migration already present.',
        );
      }
      await recordBaseline(client, migrations, through);
    }

    const appliedRows = await client.query(
      'SELECT id, checksum FROM gats_schema_migrations ORDER BY id',
    );
    const applied = new Map(
      appliedRows.rows.map((row) => [row.id, row.checksum]),
    );

    for (const migration of migrations) {
      const checksum = applied.get(migration.id);
      if (checksum && checksum !== migration.checksum) {
        throw new Error(`Migration checksum changed after apply: ${migration.id}`);
      }
      if (!checksum) await applyMigration(client, migration);
    }

    console.log(`[migrate] Schema is current (${migrations.length} migrations)`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  const parts = [
    error?.message,
    error?.code ? `code=${error.code}` : null,
    error?.detail ? `detail=${error.detail}` : null,
    error?.hint ? `hint=${error.hint}` : null,
  ].filter(Boolean);
  if (!parts.length && error?.errors?.length) {
    for (const nested of error.errors) {
      parts.push(
        nested?.message ||
          `${nested?.code || 'error'} ${nested?.address || ''}:${nested?.port || ''}`,
      );
    }
  }
  console.error('[migrate] FAILED:', parts.join(' | ') || String(error));
  process.exit(1);
});
