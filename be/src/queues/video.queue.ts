import { Queue } from 'bullmq';
import logger from 'jet-logger';

import { getQueueConnectionOptions } from '@src/libs/redis.client';

export const VIDEO_TRANSCODE_QUEUE = 'video-transcode';
export const TRANSCODE_VIDEO_JOB = 'transcode-video';

export type TranscodeVideoJobData = {
  videoId: string;
  courseId: string;
  lessonId: string;
  originalKey: string;
};

export function getTranscodeJobId(videoId: string): string {
  return `transcode-${videoId}`;
}

const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 5000,
  },
  removeOnComplete: { count: 100 },
  removeOnFail: false,
};

let videoQueue: Queue<TranscodeVideoJobData> | undefined;

export function getVideoQueue(): Queue<TranscodeVideoJobData> {
  if (!videoQueue) {
    videoQueue = new Queue<TranscodeVideoJobData>(VIDEO_TRANSCODE_QUEUE, {
      connection: getQueueConnectionOptions(),
      defaultJobOptions,
    });
  }
  return videoQueue;
}

export async function enqueueTranscodeJob(
  data: TranscodeVideoJobData,
): Promise<void> {
  const queue = getVideoQueue();
  const jobId = getTranscodeJobId(data.videoId);
  const existing = await queue.getJob(jobId);

  if (existing) {
    const state = await existing.getState();
    if (state === 'failed') {
      logger.info(`Removing failed transcode job before retry (${jobId})`);
      await existing.remove();
    } else if (state !== 'completed') {
      logger.info(`Transcode job already exists (${jobId}, state=${state})`);
      return;
    }
  }

  await queue.add(TRANSCODE_VIDEO_JOB, data, { jobId });
  logger.info(`Transcode job enqueued (${jobId})`);
}

export async function getTranscodeJob(videoId: string) {
  const queue = getVideoQueue();
  return queue.getJob(getTranscodeJobId(videoId));
}

export async function getTranscodeJobState(
  videoId: string,
): Promise<string | undefined> {
  const job = await getTranscodeJob(videoId);
  if (!job) return undefined;
  return job.getState();
}

export function resetVideoQueueForTests(): void {
  videoQueue = undefined;
}
