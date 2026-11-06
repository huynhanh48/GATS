/**
 * One-shot: add videos.audio_flac_key if missing (matches 20260724170000_video_audio_flac).
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
    const col = await client.query(
      `SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'videos'
         AND column_name = 'audio_flac_key'`,
    );
    if (col.rowCount > 0) {
      console.log('[ok] videos.audio_flac_key already exists');
      return;
    }
    await client.query(`
      ALTER TABLE "videos"
        ADD COLUMN IF NOT EXISTS "audio_flac_key" varchar(512)
    `);
    console.log('[ok] added videos.audio_flac_key');
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error('[fix-video-audio-flac]', e.message);
  process.exit(1);
});
