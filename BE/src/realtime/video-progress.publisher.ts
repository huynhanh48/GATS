import logger from 'jet-logger';

import { publishRealtimeEvent } from '@src/realtime/realtime-event-bus';
import {
  buildVideoRoom,
  type VideoProgressPayload,
} from '@src/realtime/realtime-events';

export type PublishVideoProgressInput = Omit<VideoProgressPayload, 'updatedAt'>;

export async function publishVideoProgress(
  input: PublishVideoProgressInput,
): Promise<void> {
  const payload: VideoProgressPayload = {
    ...input,
    updatedAt: new Date().toISOString(),
  };

  await publishRealtimeEvent({
    type: 'video:progress',
    room: buildVideoRoom(payload.videoId),
    payload,
  });
}

export function publishVideoProgressQuietly(
  input: PublishVideoProgressInput,
): void {
  void publishVideoProgress(input).catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    logger.err(`Realtime video progress publish failed: ${message}`);
  });
}
