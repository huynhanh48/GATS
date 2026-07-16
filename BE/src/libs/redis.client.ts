import type { ConnectionOptions } from 'bullmq';
import IORedis from 'ioredis';

import EnvVars from '@src/common/constants/env';

const connections = new Set<IORedis>();

export function getQueueConnectionOptions(): ConnectionOptions {
  return {
    url: EnvVars.RedisUrl,
    maxRetriesPerRequest: null,
  };
}

export function createRedisConnection(): IORedis {
  const connection = new IORedis(EnvVars.RedisUrl, {
    maxRetriesPerRequest: null,
  });
  connections.add(connection);
  return connection;
}

export async function closeRedisConnections(): Promise<void> {
  const closing = [...connections].map(async (connection) => {
    connections.delete(connection);
    await connection.quit();
  });
  await Promise.all(closing);
}

export function resetRedisConnectionsForTests(): void {
  connections.clear();
}
