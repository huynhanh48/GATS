import logger from 'jet-logger';
import 'dotenv/config';

import '@src/db';
import EnvVars from './common/constants/env';
import BootstrapService from './services/BootstrapService';
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
    }
  });
}

void startServer();
