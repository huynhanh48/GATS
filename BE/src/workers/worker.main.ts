import logger from 'jet-logger';
import 'dotenv/config';

import '@src/db';
import { closeRedisConnections } from '@src/libs/redis.client';
import { createQuizAiGenerateWorker } from '@src/workers/quiz-ai.worker';
import { createVideoTranscodeWorker } from '@src/workers/video-transcode.worker';

const videoWorker = createVideoTranscodeWorker();
const quizAiWorker = createQuizAiGenerateWorker();
let isShuttingDown = false;
let shutdownTimer: NodeJS.Timeout | undefined;

logger.info('Workers started (video-transcode + quiz-ai-generate)');

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    logger.info(`Received ${signal} again, forcing exit...`);
    process.exit(1);
  }

  isShuttingDown = true;
  logger.info(`Received ${signal}, force-closing workers...`);

  shutdownTimer = setTimeout(() => {
    logger.err('Worker shutdown timed out, forcing exit...');
    process.exit(1);
  }, 5000);
  shutdownTimer.unref();

  try {
    await Promise.all([videoWorker.close(true), quizAiWorker.close(true)]);
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
