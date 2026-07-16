import 'dotenv/config';

import { existsSync, statSync } from 'fs';
import os from 'os';
import path from 'path';

import db from '../src/db';
import { courseSectionsTable } from '../src/db/schema/course-section';
import { buildPublicUrl } from '../src/libs/s3-storage';
import * as CourseRepo from '../src/repos/CourseRepo';
import * as LessonRepo from '../src/repos/LessonRepo';
import VideoService from '../src/services/VideoService';

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 10 * 60 * 1000;

function log(step: string, message: string) {
  console.log(`[${step}] ${message}`);
}

async function setupCourseAndLesson(filename: string) {
  const stamp = Date.now();
  const slug = `test-video-flow-${stamp}`;

  const course = await CourseRepo.create({
    title: `Test Video Flow ${stamp}`,
    slug,
    description: 'Auto-created by scripts/test-video-upload-flow.ts',
    status: 'draft',
    level: 'beginner',
    price: 0,
  });
  log('setup', `Course created: ${course.id}`);

  const [section] = await db
    .insert(courseSectionsTable)
    .values({ courseId: course.id, title: 'Section 1', order: 0 })
    .returning();
  log('setup', `Section created: ${section.id}`);

  const lesson = await LessonRepo.create({
    courseId: course.id,
    sectionId: section.id,
    title: `Lesson – ${filename}`,
    type: 'video',
    order: 0,
  });
  log('setup', `Video lesson created: ${lesson.id}`);

  return { courseId: course.id, lessonId: lesson.id };
}

async function pollUntilReady(videoId: string) {
  const startedAt = Date.now();
  let lastStatus = '';

  while (Date.now() - startedAt < POLL_TIMEOUT_MS) {
    const { data } = await VideoService.getStatus(videoId);
    if (data.status !== lastStatus) {
      lastStatus = data.status;
      log('status', `status=${data.status}`);
    }

    if (data.status === 'ready') {
      return data;
    }
    if (data.status === 'failed') {
      throw new Error(`Transcode failed: ${data.errorMessage ?? 'unknown'}`);
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error('Timed out waiting for video to become ready');
}

async function main() {
  const filePath =
    process.argv[2] ?? path.join(os.homedir(), 'Downloads', 'video-test.mp4');

  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const { size } = statSync(filePath);
  const filename = path.basename(filePath);

  console.log('=== Video Upload Flow (codebase pipeline) ===');
  console.log(`File: ${filePath} (${(size / 1024 / 1024).toFixed(2)} MB)`);
  console.log('NOTE: dev worker (npm run dev:worker) must be running.\n');

  const { courseId, lessonId } = await setupCourseAndLesson(filename);

  const init = await VideoService.initUpload({
    courseId,
    lessonId,
    title: `Test upload – ${filename}`,
    filename,
    contentType: 'video/mp4',
  });
  const { videoId, originalKey } = init.data;
  log('init', `videoId=${videoId}`);
  log('init', `originalKey=${originalKey}`);

  log('upload', 'Uploading original to S3 via VideoService.uploadFile...');
  const uploadStartedAt = Date.now();
  const upload = await VideoService.uploadFile(videoId, filePath, 'video/mp4');
  log(
    'upload',
    `done in ${((Date.now() - uploadStartedAt) / 1000).toFixed(1)}s, size=${upload.data.size} bytes`,
  );

  log('complete', 'Marking uploaded + enqueueing transcode job...');
  const complete = await VideoService.completeUpload(videoId);
  log('complete', `status=${complete.data.status}`);

  log('transcode', 'Waiting for worker to transcode HLS and upload to S3...');
  const ready = await pollUntilReady(videoId);

  console.log('\n=== Result ===');
  console.log(`videoId    : ${videoId}`);
  console.log(`status     : ${ready.status}`);
  console.log(`originalKey: ${ready.originalKey}`);
  console.log(`hlsKey     : ${ready.hlsKey}`);
  console.log(`duration   : ${ready.duration ?? 'n/a'}`);
  console.log(`size       : ${ready.size ?? 'n/a'} bytes`);
  if (ready.hlsKey) {
    console.log(`playback   : ${buildPublicUrl(ready.hlsKey)}`);
  }
  console.log('\nSuccess ✅');
  process.exit(0);
}

main().catch((err: unknown) => {
  console.error('\nVideo upload flow failed ❌');
  console.error(err);
  process.exit(1);
});
