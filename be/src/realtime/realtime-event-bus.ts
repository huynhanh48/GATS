import logger from 'jet-logger';

import { createRedisConnection } from '@src/libs/redis.client';
import {
  REALTIME_REDIS_CHANNEL,
  type RealtimeServerEvent,
} from '@src/realtime/realtime-events';

type RealtimeEventHandler = (event: RealtimeServerEvent) => void;

export class RealtimeEventBus {
  private publisher?: ReturnType<typeof createRedisConnection>;
  private subscriber?: ReturnType<typeof createRedisConnection>;

  async publish(event: RealtimeServerEvent): Promise<void> {
    this.publisher ??= createRedisConnection();
    await this.publisher.publish(REALTIME_REDIS_CHANNEL, JSON.stringify(event));
  }

  async subscribe(handler: RealtimeEventHandler): Promise<void> {
    if (this.subscriber) return;

    const subscriber = createRedisConnection();
    this.subscriber = subscriber;

    subscriber.on('message', (_channel, raw) => {
      try {
        const event = JSON.parse(raw) as RealtimeServerEvent;
        handler(event);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.err(`Realtime event parse failed: ${message}`);
      }
    });

    await subscriber.subscribe(REALTIME_REDIS_CHANNEL);
  }

  async close(): Promise<void> {
    const publisher = this.publisher;
    const subscriber = this.subscriber;
    this.publisher = undefined;
    this.subscriber = undefined;
    if (publisher) {
      await publisher.quit().catch(() => undefined);
    }
    if (subscriber) {
      await subscriber.quit().catch(() => undefined);
    }
  }
}

let publisher: RealtimeEventBus | undefined;

export function getRealtimePublisher(): RealtimeEventBus {
  publisher ??= new RealtimeEventBus();
  return publisher;
}

export async function publishRealtimeEvent(
  event: RealtimeServerEvent,
): Promise<void> {
  await getRealtimePublisher().publish(event);
}
