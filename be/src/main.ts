import logger from 'jet-logger';
import 'dotenv/config';

import { applyProcessTimeZone } from '@src/common/constants/time';
import '@src/db';
import EnvVars from './common/constants/env';

// Giờ Việt Nam cho mọi timestamp ghi/đọc bởi tiến trình này.
applyProcessTimeZone();
import BootstrapService from './services/BootstrapService';
import DeviceService from './services/DeviceService';
import { startApiModelSyncScheduler } from './services/ApiModelSyncService';
import server from './server';

/******************************************************************************
                                Constants
******************************************************************************/

const SERVER_START_MESSAGE =
  'Express server started on port: ' + EnvVars.Port.toString();

/******************************************************************************
                                  Run
******************************************************************************/

async function startServer(): Promise<void> {
  try {
    await BootstrapService.runDevBootstrapIfNeeded();
  } catch (err) {
    logger.err(err, true);
    process.exit(1);
  }

  server.listen(EnvVars.Port, (listenErr) => {
    if (listenErr) {
      logger.err(listenErr.message);
    } else {
      logger.info(SERVER_START_MESSAGE);
      // MVP push outbox drain (FCM stub marks sent)
      setInterval(() => {
        void DeviceService.processOutboxBatch().catch(() => undefined);
      }, 30_000);
      startApiModelSyncScheduler();
    }
  });
}

void startServer();
