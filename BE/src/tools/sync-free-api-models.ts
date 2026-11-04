import logger from 'jet-logger';
import 'dotenv/config';

import ApiModelSyncService from '@src/services/ApiModelSyncService';

async function run(): Promise<void> {
  const summary = await ApiModelSyncService.syncFreeApiModels();
  logger.info(`OpenRouter free model sync: ${JSON.stringify(summary)}`);
  process.exitCode = summary.skippedLocked || summary.failedCount > 0 ? 1 : 0;
}

void run().catch((error) => {
  logger.err(error, true);
  process.exitCode = 1;
});
