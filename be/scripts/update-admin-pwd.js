require('dotenv').config({path: './config/.env.development'});
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  try {
    const hash = await bcrypt.hash('Anh@0868299464', 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, 'admin@gmail.com']);
    console.log('Password updated successfully');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
main();
