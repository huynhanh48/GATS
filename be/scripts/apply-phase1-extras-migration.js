const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const url =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/postgres';

async function main() {
  const client = new Client({ connectionString: url });
  await client.connect();
  const info = await client.query('SELECT current_database() AS db, current_user AS usr');
  console.log('Connected:', info.rows[0]);

  const before = await client.query(
    `SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY 1`,
  );
  console.log('Tables before:', before.rows.map((r) => r.tablename).join(', ') || '(none)');

  const migrationPath = path.join(
    __dirname,
    '..',
    'drizzle',
    '20260722120000_phase1_ops_learning_extras',
    'migration.sql',
  );
  let sql = fs.readFileSync(migrationPath, 'utf8');
  // Drizzle statement separator
  const parts = sql
    .split(/-->\s*statement-breakpoint/g)
    .map((s) => s.trim())
    .filter(Boolean);

  console.log(`Applying ${parts.length} statements from ${migrationPath}`);
  for (let i = 0; i < parts.length; i++) {
    const stmt = parts[i];
    try {
      await client.query(stmt);
      process.stdout.write(`.`);
    } catch (e) {
      console.error(`\nFAIL at statement ${i + 1}:`, e.message);
      console.error(stmt.slice(0, 200));
      throw e;
    }
  }
  console.log('\nMigration applied.');

  const check = await client.query(`
    SELECT tablename FROM pg_tables
    WHERE schemaname='public'
      AND tablename = ANY($1)
    ORDER BY 1
  `, [[
    'leads',
    'payment_exceptions',
    'coupons',
    'coupon_redemptions',
    'certificates',
    'lesson_questions',
    'lesson_answers',
    'lesson_notes',
    'lesson_bookmarks',
    'notifications',
    'audit_logs',
  ]]);
  console.log('New tables present:', check.rows.map((r) => r.tablename).join(', '));

  const cols = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema='public' AND table_name='lessons'
      AND column_name IN ('linked_post_id','content')
    ORDER BY 1
  `);
  console.log('lessons columns:', cols.rows.map((r) => r.column_name).join(', '));

  const orderCols = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema='public' AND table_name='orders'
      AND column_name IN ('coupon_id','coupon_code','discount_amount')
    ORDER BY 1
  `);
  console.log('orders coupon columns:', orderCols.rows.map((r) => r.column_name).join(', '));

  await client.end();
}

main().catch((e) => {
  console.error('CONNECT_OR_MIGRATE_FAIL:', e.message);
  process.exit(1);
});
