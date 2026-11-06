/**
 * One-shot: align local course_includes.value with schema (integer → varchar).
 * Prefer: npm run db:migrate:versioned when gats_schema_migrations is in use.
 */
require('dotenv').config({
  path: process.env.DOTENV_CONFIG_PATH || './config/.env.development',
});
const { Client } = require('pg');

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const before = await client.query(
      `SELECT data_type
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'course_includes'
         AND column_name = 'value'`,
    );
    console.log('before:', before.rows[0]?.data_type);

    if (before.rows[0]?.data_type === 'integer') {
      await client.query(`
        ALTER TABLE "course_includes"
          ALTER COLUMN "value" TYPE varchar(100)
          USING "value"::text
      `);
      console.log('altered: integer → varchar(100)');
    } else {
      console.log('skip: already', before.rows[0]?.data_type);
    }

    const after = await client.query(
      `SELECT data_type
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'course_includes'
         AND column_name = 'value'`,
    );
    console.log('after:', after.rows[0]?.data_type);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error('[fix-course-include-value]', e.message);
  process.exit(1);
});
