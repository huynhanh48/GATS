-- Dual-output: keep HLS for video playback; store extracted FLAC audio key.
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "audio_flac_key" varchar(512);
