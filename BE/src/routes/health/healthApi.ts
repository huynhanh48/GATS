import { Router } from 'express';
import { sql } from 'drizzle-orm';
import IORedis from 'ioredis';

import EnvVars from '@src/common/constants/env';
import db from '@src/db';

const router = Router();

router.get('/live', (_req, res) => {
  return res.status(200).json({ status: 'ok' });
});

router.get('/ready', async (_req, res) => {
  const checks = { database: false, redis: false };
  let redis: IORedis | undefined;

  try {
    await db.execute(sql`select 1`);
    checks.database = true;

    redis = new IORedis(EnvVars.RedisUrl, {
      connectTimeout: 2_000,
      commandTimeout: 2_000,
      maxRetriesPerRequest: 0,
      lazyConnect: true,
    });
    await redis.connect();
    checks.redis = (await redis.ping()) === 'PONG';
  } catch {
    return res.status(503).json({ status: 'not_ready', checks });
  } finally {
    redis?.disconnect();
  }

  return res.status(200).json({ status: 'ready', checks });
});

export default router;
