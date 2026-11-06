import 'dotenv/config';

import * as VideoRepo from '../src/repos/VideoRepo';
import {
  enqueueTranscodeJob,
  getTranscodeJob,
} from '../src/queues/video.queue';
import { closeRedisConnections } from '../src/libs/redis.client';

const DEFAULT_VIDEO_ID = '1ea90912-cae0-4808-b4d0-7d078b8ac6b1';

async function main() {
  const videoId = process.argv[2] ?? DEFAULT_VIDEO_ID;

  const video = await VideoRepo.findById(videoId);
  if (!video) {
    throw new Error(`Video not found: ${videoId}`);
  }
  if (!video.originalKey) {
    throw new Error(`Video ${videoId} has no originalKey`);
  }

  console.log('=== Retry transcode ===');
  console.log(`videoId    : ${video.id}`);
  console.log(`courseId   : ${video.courseId}`);
  console.log(`status     : ${video.status}`);
  console.log(`originalKey: ${video.originalKey}`);

  const existing = await getTranscodeJob(video.id);
  if (existing) {
    const state = await existing.getState();
    console.log(`Removing existing job (state=${state})...`);
    await existing.remove();
  }

  await VideoRepo.updateById(video.id, {
    status: 'uploaded',
    errorMessage: null,
  });

  await enqueueTranscodeJob({
    videoId: video.id,
    courseId: video.courseId,
    lessonId: video.lessonId,
    originalKey: video.originalKey,
  });

  console.log('Transcode job enqueued. Watch the worker log for progress.');

  await closeRedisConnections();
  process.exit(0);
}

main().catch((err: unknown) => {
  console.error('Retry transcode failed');
  console.error(err);
  process.exit(1);
});
