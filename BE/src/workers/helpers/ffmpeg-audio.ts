import { spawn } from 'child_process';
import { access } from 'fs/promises';
import logger from 'jet-logger';

import { probeAudioStream } from '@src/workers/helpers/ffmpeg-hls';

const FFMPEG_BIN = 'ffmpeg';

export type ExtractFlacResult =
  | { status: 'ok'; outputPath: string }
  | { status: 'no_audio' }
  | { status: 'failed'; message: string };

/** Exported for unit tests. */
export function buildExtractFlacArgs(
  input: string,
  outputPath: string,
): string[] {
  return ['-y', '-i', input, '-vn', '-c:a', 'flac', outputPath];
}

/**
 * Extract a standalone FLAC from the source media (no video).
 * Skips when ffprobe finds no audio stream — caller should still mark HLS ready.
 */
export async function extractFlacAudio(
  input: string,
  outputPath: string,
): Promise<ExtractFlacResult> {
  const probe = await probeAudioStream(input);
  if (!probe.hasAudio) {
    logger.info('FLAC extract skipped: no audio stream');
    return { status: 'no_audio' };
  }

  const startedAt = Date.now();
  logger.info('ffmpeg FLAC extract start');

  try {
    await new Promise<void>((resolve, reject) => {
      const proc = spawn(
        FFMPEG_BIN,
        buildExtractFlacArgs(input, outputPath),
        { stdio: ['ignore', 'ignore', 'pipe'] },
      );

      let stderr = '';
      proc.stderr?.on('data', (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      proc.on('error', (err) => reject(err));
      proc.on('close', (code) => {
        if (code === 0) {
          resolve();
          return;
        }
        const tail = stderr.trim().slice(-800);
        reject(
          new Error(
            `ffmpeg FLAC extract failed (code=${code})${tail ? `: ${tail}` : ''}`,
          ),
        );
      });
    });

    await access(outputPath);
    logger.info(`ffmpeg FLAC extract done in ${Date.now() - startedAt}ms`);
    return { status: 'ok', outputPath };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown FLAC extract error';
    logger.err(`ffmpeg FLAC extract failed: ${message}`);
    return { status: 'failed', message };
  }
}
