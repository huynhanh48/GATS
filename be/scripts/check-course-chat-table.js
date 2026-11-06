/**
 * Ops helper: verify course chat storage + print migrate command.
 *
 *   DOTENV_CONFIG_PATH=./config/.env.development node scripts/check-course-chat-table.js
 *   DOTENV_CONFIG_PATH=./config/.env.production node scripts/check-course-chat-table.js
 */
require('dotenv').config({
  path:
    process.env.DOTENV_CONFIG_PATH ||
    `./config/.env.${process.env.NODE_ENV || 'development'}`,
});

const { Client } = require('pg');

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5_000,
  });
  await client.connect();
  try {
    const reg = await client.query(
      "SELECT to_regclass('public.course_chat_messages') AS relation",
    );
    const relation = reg.rows[0]?.relation;
    console.log(
      relation
        ? `[ok] course_chat_messages exists (${relation})`
        : '[missing] course_chat_messages is NULL — run: npm run db:migrate:versioned',
    );

    const mig = await client.query(
      `SELECT id, baseline, applied_at
       FROM gats_schema_migrations
       WHERE id LIKE '%course_chat%'
       ORDER BY id`,
    ).catch(() => ({ rows: [] }));
    if (mig.rows.length) {
      console.log('[migrations]', mig.rows);
    } else {
      console.log('[migrations] no course_chat rows in gats_schema_migrations');
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(
    '[check-course-chat-table] FAILED:',
    error?.code || '',
    error?.message || String(error),
  );
  process.exit(1);
});
