import logger from 'jet-logger';
import 'dotenv/config';

import '@src/db';
import { closeRedisConnections } from '@src/libs/redis.client';
import { createVideoTranscodeWorker } from '@src/workers/video-transcode.worker';

const worker = createVideoTranscodeWorker();
let isShuttingDown = false;
let shutdownTimer: NodeJS.Timeout | undefined;

logger.info('Video transcode worker started');

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    logger.info(`Received ${signal} again, forcing exit...`);
    process.exit(1);
  }

  isShuttingDown = true;
  logger.info(`Received ${signal}, force-closing worker...`);

  shutdownTimer = setTimeout(() => {
    logger.err('Worker shutdown timed out, forcing exit...');
    process.exit(1);
  }, 5000);
  shutdownTimer.unref();

  try {
    await worker.close(true);
    await closeRedisConnections();
    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.err(`Worker shutdown failed: ${message}`);
    process.exit(1);
  } finally {
    if (shutdownTimer) {
      clearTimeout(shutdownTimer);
    }
  }
}

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});
