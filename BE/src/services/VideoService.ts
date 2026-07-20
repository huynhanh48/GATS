import EnvVars from '@src/common/constants/env';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import {
  abortMultipartUpload,
  completeMultipartUpload,
  computePartSize,
  computeTotalParts,
  createMultipartUpload,
  createUploadPartUrl,
  PRESIGNED_PART_URL_EXPIRES_SECONDS,
} from '@src/libs/s3-multipart-upload';
import {
  buildPublicUrl,
  deleteObject,
  deleteObjectsByPrefix,
  objectExistsAndSize,
  uploadFileFromPath,
} from '@src/libs/s3-storage';
import {
  build720pPlaylistKey,
  buildHlsPlaylistKey,
  buildHlsPrefix,
  buildOriginalKey,
  type InitMultipartUploadInput,
  type InitUploadInput,
  type LinkVideoInput,
  type MultipartAbortInput,
  type MultipartCompleteInput,
  type MultipartPartUrlInput,
  sanitizeFilename,
} from '@src/models/Video.model';
import {
  enqueueTranscodeJob,
  getTranscodeJob,
  getTranscodeJobState,
} from '@src/queues/video.queue';
import * as CourseRepo from '@src/repos/CourseRepo';
import * as LessonProgressRepo from '@src/repos/LessonProgressRepo';
import * as LessonRepo from '@src/repos/LessonRepo';
import * as VideoRepo from '@src/repos/VideoRepo';
import CourseAccessService from '@src/services/CourseAccessService';

const Errors = {
  NOT_FOUND: 'Video not found',
  COURSE_NOT_FOUND: 'Course not found',
  LESSON_NOT_FOUND: 'Lesson not found',
  LESSON_NOT_VIDEO: 'Lesson must be of type video',
  LESSON_HAS_VIDEO: 'Lesson already has a video',
  INVALID_FILENAME: 'Invalid filename',
  ORIGINAL_MISSING: 'Original video not uploaded',
  STORAGE_OBJECT_NOT_FOUND: 'Uploaded video not found in storage',
  INVALID_CONTENT_TYPE: 'Invalid uploaded content type',
  NOT_READY: 'Video is not ready for playback',
  COURSE_MISMATCH: 'Video does not belong to this course',
  FAILED_STATE: 'Video processing failed; create a new upload',
  INVALID_UPLOAD_STATE: 'Video is not in a valid state for upload',
  INVALID_UPLOAD_ID: 'Upload session does not match',
} as const;

const ALLOWED_UPLOAD_CONTENT_TYPES = new Set([
  'video/mp4',
  'video/quicktime',
  'video/webm',
]);

const STORAGE_PROVIDERS = new Set(['firebase', 's3', 'gcs', 'r2', 'local']);

type VideoServiceDeps = {
  objectExistsAndSize: typeof objectExistsAndSize;
  uploadFileFromPath: typeof uploadFileFromPath;
  enqueueTranscodeJob: typeof enqueueTranscodeJob;
  getTranscodeJob: typeof getTranscodeJob;
  getTranscodeJobState: typeof getTranscodeJobState;
  createMultipartUpload: typeof createMultipartUpload;
  createUploadPartUrl: typeof createUploadPartUrl;
  completeMultipartUpload: typeof completeMultipartUpload;
  abortMultipartUpload: typeof abortMultipartUpload;
  deleteObject: typeof deleteObject;
  deleteObjectsByPrefix: typeof deleteObjectsByPrefix;
};

let deps: VideoServiceDeps = {
  objectExistsAndSize,
  uploadFileFromPath,
  enqueueTranscodeJob,
  getTranscodeJob,
  getTranscodeJobState,
  createMultipartUpload,
  createUploadPartUrl,
  completeMultipartUpload,
  abortMultipartUpload,
  deleteObject,
  deleteObjectsByPrefix,
};

export function setVideoServiceDeps(
  overrides: Partial<VideoServiceDeps>,
): void {
  deps = { ...deps, ...overrides };
}

export function resetVideoServiceDeps(): void {
  deps = {
    objectExistsAndSize,
    uploadFileFromPath,
    enqueueTranscodeJob,
    getTranscodeJob,
    getTranscodeJobState,
    createMultipartUpload,
    createUploadPartUrl,
    completeMultipartUpload,
    abortMultipartUpload,
    deleteObject,
    deleteObjectsByPrefix,
  };
}

function buildUploadUrl(videoId: string): string {
  const appUrl = EnvVars.AppUrl.replace(/\/$/, '');
  return `${appUrl}/api/admin/videos/${videoId}/upload`;
}

function buildPlaybackUrl(hlsKey: string): string {
  if (/^https?:\/\//i.test(hlsKey)) {
    return hlsKey;
  }
  return buildPublicUrl(hlsKey);
}

function resolveStorageProvider() {
  return STORAGE_PROVIDERS.has(EnvVars.VideoStorageProvider)
    ? (EnvVars.VideoStorageProvider as
        'firebase' | 's3' | 'gcs' | 'r2' | 'local')
    : 's3';
}

async function verifyStorageObject(
  originalKey: string,
  contentType?: string,
): Promise<number> {
  if (contentType && !ALLOWED_UPLOAD_CONTENT_TYPES.has(contentType)) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      Errors.INVALID_CONTENT_TYPE,
    );
  }

  const result = await deps.objectExistsAndSize(originalKey);
  if (!result.exists) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      Errors.STORAGE_OBJECT_NOT_FOUND,
    );
  }

  return result.size;
}

async function ensureTranscodeJob(video: {
  id: string;
  courseId: string;
  lessonId: string;
  originalKey: string | null;
}): Promise<void> {
  if (!video.originalKey) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.ORIGINAL_MISSING);
  }

  const state = await deps.getTranscodeJobState(video.id);
  if (state === 'failed') {
    const job = await deps.getTranscodeJob(video.id);
    if (job) await job.remove();
  } else if (
    state === 'active' ||
    state === 'waiting' ||
    state === 'delayed' ||
    state === 'completed'
  ) {
    return;
  }

  await deps.enqueueTranscodeJob({
    videoId: video.id,
    courseId: video.courseId,
    lessonId: video.lessonId,
    originalKey: video.originalKey,
  });
}

async function validateLessonForVideoUpload(
  courseId: string,
  lessonId: string,
): Promise<void> {
  const course = await CourseRepo.findById(courseId);
  if (!course) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.COURSE_NOT_FOUND);
  }

  const lesson = await LessonRepo.findByIdAndCourseId(lessonId, courseId);
  if (!lesson) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.LESSON_NOT_FOUND);
  }
  if (lesson.type !== 'video') {
    throw new RouteError(
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
      Errors.LESSON_NOT_VIDEO,
    );
  }

  const existingVideo = await VideoRepo.findByLessonId(lessonId);
  if (existingVideo) {
    throw new RouteError(HttpStatusCodes.CONFLICT, Errors.LESSON_HAS_VIDEO);
  }
}

function assertPendingMultipartVideo(
  video: Awaited<ReturnType<typeof VideoRepo.findById>>,
  uploadId: string,
): asserts video is NonNullable<typeof video> & {
  originalKey: string;
  uploadId: string;
} {
  if (!video) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  if (video.status !== 'pending_upload') {
    throw new RouteError(HttpStatusCodes.CONFLICT, Errors.INVALID_UPLOAD_STATE);
  }

  if (!video.originalKey) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.ORIGINAL_MISSING);
  }

  if (!video.uploadId || video.uploadId !== uploadId) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.INVALID_UPLOAD_ID);
  }
}

async function initUpload(input: InitUploadInput) {
  await validateLessonForVideoUpload(input.courseId, input.lessonId);

  let safeFilename: string;
  try {
    safeFilename = sanitizeFilename(input.filename);
  } catch {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.INVALID_FILENAME);
  }

  const video = await VideoRepo.create({
    courseId: input.courseId,
    lessonId: input.lessonId,
    title: input.title,
    storageProvider: resolveStorageProvider(),
    status: 'pending_upload',
  });

  const originalKey = buildOriginalKey(input.courseId, video.id, safeFilename);

  await VideoRepo.updateById(video.id, { originalKey });

  const uploadUrl = buildUploadUrl(video.id);

  return {
    data: {
      videoId: video.id,
      uploadUrl,
      originalKey,
      status: 'pending_upload' as const,
    },
  };
}

async function initMultipartUpload(input: InitMultipartUploadInput) {
  await validateLessonForVideoUpload(input.courseId, input.lessonId);

  let safeFilename: string;
  try {
    safeFilename = sanitizeFilename(input.filename);
  } catch {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.INVALID_FILENAME);
  }

  if (!ALLOWED_UPLOAD_CONTENT_TYPES.has(input.contentType)) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      Errors.INVALID_CONTENT_TYPE,
    );
  }

  const partSize = computePartSize(input.size);
  const totalParts = computeTotalParts(input.size, partSize);

  const video = await VideoRepo.create({
    courseId: input.courseId,
    lessonId: input.lessonId,
    title: input.title,
    storageProvider: resolveStorageProvider(),
    status: 'pending_upload',
  });

  const originalKey = buildOriginalKey(input.courseId, video.id, safeFilename);

  let uploadId: string;
  try {
    uploadId = await deps.createMultipartUpload(originalKey, input.contentType);
  } catch (error) {
    await VideoRepo.deleteById(video.id);
    throw error;
  }

  await VideoRepo.updateById(video.id, {
    originalKey,
    uploadId,
  });

  return {
    data: {
      videoId: video.id,
      originalKey,
      uploadId,
      partSize,
      totalParts,
      status: 'pending_upload' as const,
    },
  };
}

async function getMultipartPartUrl(
  videoId: string,
  input: MultipartPartUrlInput,
) {
  const video = await VideoRepo.findById(videoId);
  assertPendingMultipartVideo(video, input.uploadId);

  const url = await deps.createUploadPartUrl(
    video.originalKey,
    input.uploadId,
    input.partNumber,
    PRESIGNED_PART_URL_EXPIRES_SECONDS,
  );

  return {
    data: {
      url,
      partNumber: input.partNumber,
      expiresIn: PRESIGNED_PART_URL_EXPIRES_SECONDS,
    },
  };
}

async function completeMultipartUploadFlow(
  videoId: string,
  input: MultipartCompleteInput,
) {
  const video = await VideoRepo.findById(videoId);
  assertPendingMultipartVideo(video, input.uploadId);

  if (video.status === 'failed') {
    throw new RouteError(HttpStatusCodes.CONFLICT, Errors.FAILED_STATE);
  }

  await deps.completeMultipartUpload(
    video.originalKey,
    input.uploadId,
    input.parts,
  );

  const size = await verifyStorageObject(video.originalKey);
  const updated = await VideoRepo.updateById(video.id, {
    status: 'uploaded',
    size,
    uploadId: null,
    errorMessage: null,
  });

  if (!updated) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  await ensureTranscodeJob(updated);

  return {
    data: {
      videoId: updated.id,
      originalKey: updated.originalKey as string,
      size,
      status: updated.status,
    },
  };
}

async function abortMultipartUploadFlow(
  videoId: string,
  input: MultipartAbortInput,
) {
  const video = await VideoRepo.findById(videoId);
  if (!video) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  if (
    video.uploadId &&
    video.uploadId === input.uploadId &&
    video.originalKey
  ) {
    try {
      await deps.abortMultipartUpload(video.originalKey, input.uploadId);
    } catch {
      // Best-effort abort; record will still be removed.
    }
  } else if (video.uploadId && video.uploadId !== input.uploadId) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.INVALID_UPLOAD_ID);
  }

  await VideoRepo.deleteById(videoId);

  return {
    data: {
      videoId,
      aborted: true,
    },
  };
}

async function linkVideo(input: LinkVideoInput) {
  const course = await CourseRepo.findById(input.courseId);
  if (!course) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.COURSE_NOT_FOUND);
  }

  const lesson = await LessonRepo.findByIdAndCourseId(
    input.lessonId,
    input.courseId,
  );
  if (!lesson) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.LESSON_NOT_FOUND);
  }
  if (lesson.type !== 'video') {
    throw new RouteError(
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
      Errors.LESSON_NOT_VIDEO,
    );
  }

  const existingVideo = await VideoRepo.findByLessonId(input.lessonId);
  if (existingVideo) {
    throw new RouteError(HttpStatusCodes.CONFLICT, Errors.LESSON_HAS_VIDEO);
  }

  const video = await VideoRepo.create({
    courseId: input.courseId,
    lessonId: input.lessonId,
    title: input.title,
    storageProvider: resolveStorageProvider(),
    status: 'ready',
    duration: input.duration ?? null,
    hlsKey: input.playbackType === 'hls' ? input.playbackUrl : null,
    mp4Url: input.playbackType === 'mp4' ? input.playbackUrl : null,
  });

  return {
    data: {
      videoId: video.id,
      courseId: video.courseId,
      lessonId: video.lessonId,
      status: video.status,
      playbackType: input.playbackType,
      playbackUrl: input.playbackUrl,
      hlsKey: video.hlsKey,
      mp4Url: video.mp4Url,
    },
  };
}

async function uploadFile(
  videoId: string,
  tempPath: string,
  contentType: string,
) {
  const video = await VideoRepo.findById(videoId);
  if (!video) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  if (video.status === 'failed') {
    throw new RouteError(HttpStatusCodes.CONFLICT, Errors.FAILED_STATE);
  }

  if (video.status !== 'pending_upload') {
    throw new RouteError(HttpStatusCodes.CONFLICT, Errors.INVALID_UPLOAD_STATE);
  }

  if (!video.originalKey) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.ORIGINAL_MISSING);
  }

  if (!ALLOWED_UPLOAD_CONTENT_TYPES.has(contentType)) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      Errors.INVALID_CONTENT_TYPE,
    );
  }

  await deps.uploadFileFromPath(tempPath, video.originalKey, contentType);
  const size = await verifyStorageObject(video.originalKey, contentType);

  return {
    data: {
      videoId: video.id,
      originalKey: video.originalKey,
      size,
      status: 'pending_upload' as const,
    },
  };
}

async function completeUpload(videoId: string) {
  const video = await VideoRepo.findById(videoId);
  if (!video) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  if (video.status === 'failed') {
    throw new RouteError(HttpStatusCodes.CONFLICT, Errors.FAILED_STATE);
  }

  if (video.status === 'ready') {
    return {
      data: {
        videoId: video.id,
        status: video.status,
      },
    };
  }

  if (video.status === 'uploaded' || video.status === 'processing') {
    await ensureTranscodeJob(video);
    const updated = (await VideoRepo.findById(videoId)) ?? video;
    return {
      data: {
        videoId: updated.id,
        status: updated.status,
      },
    };
  }

  if (!video.originalKey) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.ORIGINAL_MISSING);
  }

  const size = await verifyStorageObject(video.originalKey);
  const updated = await VideoRepo.updateById(video.id, {
    status: 'uploaded',
    size,
    errorMessage: null,
  });

  if (!updated) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  await ensureTranscodeJob(updated);

  return {
    data: {
      videoId: updated.id,
      status: updated.status,
    },
  };
}

async function getStatus(videoId: string) {
  const video = await VideoRepo.findById(videoId);
  if (!video) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  return {
    data: {
      videoId: video.id,
      courseId: video.courseId,
      lessonId: video.lessonId,
      status: video.status,
      originalKey: video.originalKey,
      hlsKey: video.hlsKey,
      mp4Url: video.mp4Url,
      errorMessage: video.errorMessage,
      duration: video.duration,
      size: video.size,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
    },
  };
}

async function getByLesson(
  courseId: string,
  lessonId: string,
  userId: number | null,
) {
  const course = await CourseRepo.findById(courseId);
  if (!course) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.COURSE_NOT_FOUND);
  }

  const lesson = await LessonRepo.findByIdAndCourseId(lessonId, courseId);
  if (!lesson) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.LESSON_NOT_FOUND);
  }

  const canView = await CourseAccessService.canViewCourseContent(
    userId,
    courseId,
    lesson,
  );
  if (!canView) {
    throw new RouteError(
      HttpStatusCodes.FORBIDDEN,
      CourseAccessService.Errors.FORBIDDEN,
    );
  }

  const video = await VideoRepo.findByLessonId(lessonId);
  if (!video) {
    // Expected for lessons without an uploaded video — soft empty, not an error.
    return { data: null };
  }

  return {
    data: {
      videoId: video.id,
      courseId: video.courseId,
      lessonId: video.lessonId,
      title: video.title,
      status: video.status,
      originalKey: video.originalKey,
      hlsKey: video.hlsKey,
      mp4Url: video.mp4Url,
      errorMessage: video.errorMessage,
      duration: video.duration,
      size: video.size,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
    },
  };
}

/**
 * Removes a video: aborts any in-flight multipart upload, deletes storage
 * objects (original file + HLS folder) best-effort, then drops the DB record
 * (renditions cascade). External linked URLs (http...) are left untouched.
 * This frees the lesson so a new video can be uploaded.
 */
async function deleteVideo(videoId: string) {
  const video = await VideoRepo.findById(videoId);
  if (!video) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  // 1. Abort a still-open multipart session so S3 doesn't keep orphan parts.
  if (video.uploadId && video.originalKey) {
    try {
      await deps.abortMultipartUpload(video.originalKey, video.uploadId);
    } catch {
      // Best-effort; continue with deletion.
    }
  }

  // 2. Delete the original uploaded object (skip external/linked URLs).
  if (video.originalKey && !/^https?:\/\//i.test(video.originalKey)) {
    try {
      await deps.deleteObject(video.originalKey);
    } catch {
      // Best-effort; continue.
    }
  }

  // 3. Delete the HLS output folder (only for internally-transcoded videos).
  if (video.hlsKey && !/^https?:\/\//i.test(video.hlsKey)) {
    try {
      await deps.deleteObjectsByPrefix(
        `${buildHlsPrefix(video.courseId, video.id)}/`,
      );
    } catch {
      // Best-effort; continue.
    }
  }

  // 4. Drop the DB record (video_renditions cascade via FK).
  const removed = await VideoRepo.deleteById(videoId);
  if (!removed) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  return {
    data: {
      videoId,
      lessonId: video.lessonId,
      deleted: true,
    },
  };
}

async function getPlayback(
  courseId: string,
  videoId: string,
  userId: number | null,
) {
  const course = await CourseRepo.findById(courseId);
  if (!course) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.COURSE_NOT_FOUND);
  }

  const video = await VideoRepo.findById(videoId);
  if (!video || video.courseId !== courseId) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  const lesson = await LessonRepo.findById(video.lessonId);
  if (!lesson) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.LESSON_NOT_FOUND);
  }

  const canView = await CourseAccessService.canViewCourseContent(
    userId,
    courseId,
    lesson,
  );
  if (!canView) {
    throw new RouteError(
      HttpStatusCodes.FORBIDDEN,
      CourseAccessService.Errors.FORBIDDEN,
    );
  }

  if (video.status !== 'ready' || (!video.hlsKey && !video.mp4Url)) {
    throw new RouteError(
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
      Errors.NOT_READY,
    );
  }

  const playbackType = video.hlsKey ? 'hls' : 'mp4';
  const playbackUrl = video.hlsKey
    ? buildPlaybackUrl(video.hlsKey)
    : (video.mp4Url as string);

  let progress = null;
  if (userId !== null) {
    progress =
      (await LessonProgressRepo.findByUserAndLesson(userId, lesson.id)) ?? null;
  }

  return {
    data: {
      videoId: video.id,
      courseId: video.courseId,
      playbackUrl,
      playbackType,
      hlsKey: video.hlsKey,
      mp4Url: video.mp4Url,
      ...(progress ? { progress } : {}),
    },
  };
}

export default {
  Errors,
  initUpload,
  initMultipartUpload,
  getMultipartPartUrl,
  completeMultipartUpload: completeMultipartUploadFlow,
  abortMultipartUpload: abortMultipartUploadFlow,
  linkVideo,
  uploadFile,
  completeUpload,
  getStatus,
  getByLesson,
  deleteVideo,
  getPlayback,
  build720pPlaylistKey,
  buildHlsPlaylistKey,
};
