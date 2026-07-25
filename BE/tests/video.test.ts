import { beforeEach, describe, expect, it, vi } from 'vitest';
import supertest from 'supertest';

const {
  mockObjectExistsAndSize,
  mockUploadFileFromPath,
  mockBuildPublicUrl,
  mockDeleteObject,
  mockDeleteObjectsByPrefix,
  mockEnqueueTranscodeJob,
  mockGetTranscodeJob,
  mockGetTranscodeJobState,
  mockCreateMultipartUpload,
  mockCreateUploadPartUrl,
  mockCompleteMultipartUpload,
  mockAbortMultipartUpload,
  mockCanPerform,
  mockCourseFindById,
  mockLessonFindByIdAndCourseId,
  mockLessonFindById,
  mockCanViewCourseContent,
  mockVideoFindById,
  mockVideoFindByLessonId,
  mockVideoCreate,
  mockVideoUpdateById,
  mockVideoDeleteById,
} = vi.hoisted(() => ({
  mockObjectExistsAndSize: vi.fn(),
  mockUploadFileFromPath: vi.fn(),
  mockBuildPublicUrl: vi.fn(),
  mockDeleteObject: vi.fn(),
  mockDeleteObjectsByPrefix: vi.fn(),
  mockEnqueueTranscodeJob: vi.fn(),
  mockGetTranscodeJob: vi.fn(),
  mockGetTranscodeJobState: vi.fn(),
  mockCreateMultipartUpload: vi.fn(),
  mockCreateUploadPartUrl: vi.fn(),
  mockCompleteMultipartUpload: vi.fn(),
  mockAbortMultipartUpload: vi.fn(),
  mockCanPerform: vi.fn(),
  mockCourseFindById: vi.fn(),
  mockLessonFindByIdAndCourseId: vi.fn(),
  mockLessonFindById: vi.fn(),
  mockCanViewCourseContent: vi.fn(),
  mockVideoFindById: vi.fn(),
  mockVideoFindByLessonId: vi.fn(),
  mockVideoCreate: vi.fn(),
  mockVideoUpdateById: vi.fn(),
  mockVideoDeleteById: vi.fn(),
}));

vi.mock('@src/middleware/authMiddleware', () => ({
  default: (req: { authUser?: unknown }, _res: unknown, next: () => void) => {
    req.authUser = { id: 1, email: 'admin@test.com', roles: ['admin'] };
    next();
  },
}));

vi.mock('@src/middleware/optionalAuthMiddleware', () => ({
  default: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

vi.mock('@src/services/AuthorizationService', () => ({
  default: {
    canPerform: (...args: unknown[]) => mockCanPerform(...args),
    invalidateUser: vi.fn(),
  },
  authorizationService: {
    canPerform: (...args: unknown[]) => mockCanPerform(...args),
    invalidateUser: vi.fn(),
  },
}));

vi.mock('@src/libs/s3-storage', () => ({
  objectExistsAndSize: (...args: unknown[]) => mockObjectExistsAndSize(...args),
  uploadFileFromPath: (...args: unknown[]) => mockUploadFileFromPath(...args),
  buildPublicUrl: (...args: unknown[]) => mockBuildPublicUrl(...args),
  deleteObject: (...args: unknown[]) => mockDeleteObject(...args),
  deleteObjectsByPrefix: (...args: unknown[]) =>
    mockDeleteObjectsByPrefix(...args),
}));

vi.mock('@src/libs/s3-multipart-upload', () => ({
  createMultipartUpload: (...args: unknown[]) => mockCreateMultipartUpload(...args),
  createUploadPartUrl: (...args: unknown[]) => mockCreateUploadPartUrl(...args),
  completeMultipartUpload: (...args: unknown[]) =>
    mockCompleteMultipartUpload(...args),
  abortMultipartUpload: (...args: unknown[]) => mockAbortMultipartUpload(...args),
  computePartSize: (_size: number) => 64 * 1024 * 1024,
  computeTotalParts: (size: number, partSize: number) =>
    Math.ceil(size / partSize),
  PRESIGNED_PART_URL_EXPIRES_SECONDS: 900,
}));

vi.mock('@src/queues/video.queue', () => ({
  enqueueTranscodeJob: (...args: unknown[]) => mockEnqueueTranscodeJob(...args),
  getTranscodeJob: (...args: unknown[]) => mockGetTranscodeJob(...args),
  getTranscodeJobState: (...args: unknown[]) => mockGetTranscodeJobState(...args),
  getTranscodeJobId: (id: string) => `transcode-${id}`,
  VIDEO_TRANSCODE_QUEUE: 'video-transcode',
  TRANSCODE_VIDEO_JOB: 'transcode-video',
}));

vi.mock('@src/repos/CourseRepo', () => ({
  findById: (...args: unknown[]) => mockCourseFindById(...args),
}));

vi.mock('@src/repos/LessonRepo', () => ({
  findByIdAndCourseId: (...args: unknown[]) =>
    mockLessonFindByIdAndCourseId(...args),
  findById: (...args: unknown[]) => mockLessonFindById(...args),
}));

vi.mock('@src/services/CourseAccessService', () => ({
  default: {
    canViewCourseContent: (...args: unknown[]) =>
      mockCanViewCourseContent(...args),
    Errors: {
      FORBIDDEN: 'You do not have access to this content',
    },
  },
}));

vi.mock('@src/repos/LessonProgressRepo', () => ({
  findByUserAndLesson: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@src/repos/VideoRepo', () => ({
  findById: (...args: unknown[]) => mockVideoFindById(...args),
  findByLessonId: (...args: unknown[]) => mockVideoFindByLessonId(...args),
  create: (...args: unknown[]) => mockVideoCreate(...args),
  updateById: (...args: unknown[]) => mockVideoUpdateById(...args),
  updateStatus: vi.fn(),
  updateAfterTranscode: vi.fn(),
  markFailed: vi.fn(),
  deleteById: (...args: unknown[]) => mockVideoDeleteById(...args),
}));

import app from '@src/server';
import { sanitizeFilename } from '@src/models/Video.model';

const agent = supertest.agent(app);

export const courseId = '11111111-1111-4111-8111-111111111111';
export const lessonId = '22222222-2222-4222-8222-222222222222';
export const videoId = '33333333-3333-4333-8333-333333333333';
export const sectionId = '44444444-4444-4444-8444-444444444444';

const sampleCourse = {
  id: courseId,
  title: 'Test Course',
  slug: 'test-course',
  description: null,
  thumbnail: null,
  introVideo: null,
  price: 0,
  salePrice: null,
  level: 'beginner' as const,
  status: 'published' as const,
  instructorId: null,
  categoryId: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  publishedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const sampleLesson = {
  id: lessonId,
  courseId,
  sectionId,
  title: 'Lesson 1',
  description: null,
  type: 'video' as const,
  order: 1,
  content: null,
  isPreview: false,
  duration: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

function buildVideo(overrides: Record<string, unknown> = {}) {
  return {
    id: videoId,
    courseId,
    lessonId,
    title: 'Lesson 1',
    storageProvider: 's3' as const,
    originalKey: `videos/originals/${courseId}/${videoId}/input.mp4`,
    hlsKey: null,
    audioFlacKey: null,
    mp4Url: null,
    duration: null,
    size: null,
    uploadId: null,
    status: 'pending_upload' as const,
    errorMessage: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

function resetVideoMocks(): void {
  mockObjectExistsAndSize.mockReset();
  mockUploadFileFromPath.mockReset();
  mockBuildPublicUrl.mockReset();
  mockEnqueueTranscodeJob.mockReset();
  mockGetTranscodeJob.mockReset();
  mockGetTranscodeJobState.mockReset();
  mockCreateMultipartUpload.mockReset();
  mockCreateUploadPartUrl.mockReset();
  mockCompleteMultipartUpload.mockReset();
  mockAbortMultipartUpload.mockReset();
  mockDeleteObject.mockReset();
  mockDeleteObjectsByPrefix.mockReset();
  mockCanPerform.mockReset();

  mockDeleteObject.mockResolvedValue(undefined);
  mockDeleteObjectsByPrefix.mockResolvedValue(0);
  mockObjectExistsAndSize.mockResolvedValue({ exists: true, size: 1024 });
  mockUploadFileFromPath.mockResolvedValue(undefined);
  mockBuildPublicUrl.mockImplementation(
    (key: string) => `https://s3-hn1-r1.longvan.net/test-bucket/${key}`,
  );
  mockEnqueueTranscodeJob.mockResolvedValue(undefined);
  mockGetTranscodeJob.mockResolvedValue(undefined);
  mockGetTranscodeJobState.mockResolvedValue(undefined);
  mockCreateMultipartUpload.mockResolvedValue('upload-id-123');
  mockCreateUploadPartUrl.mockResolvedValue('https://s3.example.com/part-url');
  mockCompleteMultipartUpload.mockResolvedValue(undefined);
  mockAbortMultipartUpload.mockResolvedValue(undefined);
  mockCanPerform.mockResolvedValue(true);
  mockCanViewCourseContent.mockResolvedValue(true);
}

describe('Video API', () => {
  beforeEach(() => {
    resetVideoMocks();
    mockCourseFindById.mockReset();
    mockLessonFindByIdAndCourseId.mockReset();
    mockLessonFindById.mockReset();
    mockCanViewCourseContent.mockReset();
    mockCanViewCourseContent.mockResolvedValue(true);
    mockVideoFindById.mockReset();
    mockVideoFindByLessonId.mockReset();
    mockVideoCreate.mockReset();
    mockVideoUpdateById.mockReset();
    mockVideoDeleteById.mockReset();
  });

  it('rejects init-upload with invalid payload', async () => {
    const res = await agent
      .post('/api/admin/videos/init-upload')
      .send({ courseId: 'bad', lessonId, title: 'x', filename: 'a.mp4', contentType: 'video/mp4' })
      .expect(422);

    expect(res.body.error).toBeDefined();
  });

  it('returns 404 when course does not exist', async () => {
    mockCourseFindById.mockResolvedValue(undefined);

    const res = await agent
      .post('/api/admin/videos/init-upload')
      .send({
        courseId,
        lessonId,
        title: 'Lesson 1',
        filename: 'input.mp4',
        contentType: 'video/mp4',
      })
      .expect(404);

    expect(res.body.error).toBe('Course not found');
  });

  it('returns 404 when lesson does not belong to course', async () => {
    mockCourseFindById.mockResolvedValue(sampleCourse);
    mockLessonFindByIdAndCourseId.mockResolvedValue(undefined);

    const res = await agent
      .post('/api/admin/videos/init-upload')
      .send({
        courseId,
        lessonId,
        title: 'Lesson 1',
        filename: 'input.mp4',
        contentType: 'video/mp4',
      })
      .expect(404);

    expect(res.body.error).toBe('Lesson not found');
  });

  it('returns 422 when lesson is not video type', async () => {
    mockCourseFindById.mockResolvedValue(sampleCourse);
    mockLessonFindByIdAndCourseId.mockResolvedValue({
      ...sampleLesson,
      type: 'text',
    });

    const res = await agent
      .post('/api/admin/videos/init-upload')
      .send({
        courseId,
        lessonId,
        title: 'Lesson 1',
        filename: 'input.mp4',
        contentType: 'video/mp4',
      })
      .expect(422);

    expect(res.body.error).toBe('Lesson must be of type video');
  });

  it('returns 409 when lesson already has video', async () => {
    mockCourseFindById.mockResolvedValue(sampleCourse);
    mockLessonFindByIdAndCourseId.mockResolvedValue(sampleLesson);
    mockVideoFindByLessonId.mockResolvedValue(buildVideo());

    const res = await agent
      .post('/api/admin/videos/init-upload')
      .send({
        courseId,
        lessonId,
        title: 'Lesson 1',
        filename: 'input.mp4',
        contentType: 'video/mp4',
      })
      .expect(409);

    expect(res.body.error).toBe('Lesson already has a video');
  });

  it('sanitizes path traversal filenames', () => {
    expect(sanitizeFilename('../../etc/passwd')).toBe('passwd');
    expect(sanitizeFilename('folder/input.mp4')).toBe('input.mp4');
  });

  it('creates init-upload successfully', async () => {
    mockCourseFindById.mockResolvedValue(sampleCourse);
    mockLessonFindByIdAndCourseId.mockResolvedValue(sampleLesson);
    mockVideoFindByLessonId.mockResolvedValue(undefined);
    mockVideoCreate.mockResolvedValue(buildVideo({ originalKey: null }));
    mockVideoUpdateById.mockResolvedValue(
      buildVideo({ originalKey: `videos/originals/${courseId}/${videoId}/input.mp4` }),
    );

    const res = await agent
      .post('/api/admin/videos/init-upload')
      .send({
        courseId,
        lessonId,
        title: 'Lesson 1',
        filename: '../input.mp4',
        contentType: 'video/mp4',
      })
      .expect(201);

    expect(res.body.data.videoId).toBe(videoId);
    expect(res.body.data.uploadUrl).toContain(`/api/admin/videos/${videoId}/upload`);
    expect(mockEnqueueTranscodeJob).not.toHaveBeenCalled();
  });

  it('rejects init-multipart-upload without size', async () => {
    const res = await agent
      .post('/api/admin/videos/init-multipart-upload')
      .send({
        courseId,
        lessonId,
        title: 'Lesson 1',
        filename: 'input.mp4',
        contentType: 'video/mp4',
      })
      .expect(422);

    expect(res.body.error).toBeDefined();
  });

  it('creates init-multipart-upload successfully', async () => {
    mockCourseFindById.mockResolvedValue(sampleCourse);
    mockLessonFindByIdAndCourseId.mockResolvedValue(sampleLesson);
    mockVideoFindByLessonId.mockResolvedValue(undefined);
    mockVideoCreate.mockResolvedValue(buildVideo({ originalKey: null, uploadId: null }));
    mockVideoUpdateById.mockResolvedValue(
      buildVideo({
        originalKey: `videos/originals/${courseId}/${videoId}/input.mp4`,
        uploadId: 'upload-id-123',
      }),
    );

    const res = await agent
      .post('/api/admin/videos/init-multipart-upload')
      .send({
        courseId,
        lessonId,
        title: 'Lesson 1',
        filename: 'input.mp4',
        contentType: 'video/mp4',
        size: 3 * 1024 * 1024 * 1024,
      })
      .expect(201);

    expect(res.body.data.videoId).toBe(videoId);
    expect(res.body.data.uploadId).toBe('upload-id-123');
    expect(res.body.data.partSize).toBeGreaterThan(0);
    expect(res.body.data.totalParts).toBeGreaterThan(0);
    expect(mockCreateMultipartUpload).toHaveBeenCalledOnce();
  });

  it('returns presigned part url', async () => {
    mockVideoFindById.mockResolvedValue(
      buildVideo({ uploadId: 'upload-id-123' }),
    );

    const res = await agent
      .post(`/api/admin/videos/${videoId}/multipart/part-url`)
      .send({ uploadId: 'upload-id-123', partNumber: 1 })
      .expect(200);

    expect(res.body.data.url).toContain('https://');
    expect(res.body.data.partNumber).toBe(1);
    expect(mockCreateUploadPartUrl).toHaveBeenCalledOnce();
  });

  it('completes multipart upload and enqueues transcode', async () => {
    const pending = buildVideo({ uploadId: 'upload-id-123' });
    const uploaded = buildVideo({
      status: 'uploaded',
      size: 1024,
      uploadId: null,
    });

    mockVideoFindById.mockResolvedValue(pending);
    mockVideoUpdateById.mockResolvedValue(uploaded);

    const res = await agent
      .post(`/api/admin/videos/${videoId}/multipart/complete`)
      .send({
        uploadId: 'upload-id-123',
        parts: [{ partNumber: 1, etag: '"abc123"' }],
      })
      .expect(202);

    expect(res.body.data.status).toBe('uploaded');
    expect(mockCompleteMultipartUpload).toHaveBeenCalledOnce();
    expect(mockEnqueueTranscodeJob).toHaveBeenCalledOnce();
  });

  it('aborts multipart upload and deletes video record', async () => {
    mockVideoFindById.mockResolvedValue(
      buildVideo({ uploadId: 'upload-id-123' }),
    );
    mockVideoDeleteById.mockResolvedValue(true);

    const res = await agent
      .post(`/api/admin/videos/${videoId}/multipart/abort`)
      .send({ uploadId: 'upload-id-123' })
      .expect(200);

    expect(res.body.data.aborted).toBe(true);
    expect(mockAbortMultipartUpload).toHaveBeenCalledOnce();
    expect(mockVideoDeleteById).toHaveBeenCalledOnce();
  });

  it('deletes a ready video record and its S3 objects', async () => {
    mockVideoFindById.mockResolvedValue(
      buildVideo({
        status: 'ready',
        uploadId: null,
        hlsKey: `videos/hls/${courseId}/${videoId}/index.m3u8`,
      }),
    );
    mockVideoDeleteById.mockResolvedValue(true);

    const res = await agent
      .delete(`/api/admin/videos/${videoId}`)
      .expect(200);

    expect(res.body.data.deleted).toBe(true);
    expect(res.body.data.lessonId).toBe(lessonId);
    expect(mockDeleteObject).toHaveBeenCalledOnce();
    expect(mockDeleteObjectsByPrefix).toHaveBeenCalledWith(
      `videos/hls/${courseId}/${videoId}/`,
    );
    expect(mockVideoDeleteById).toHaveBeenCalledOnce();
    expect(mockAbortMultipartUpload).not.toHaveBeenCalled();
  });

  it('returns 404 when deleting a non-existent video', async () => {
    mockVideoFindById.mockResolvedValue(undefined);

    await agent.delete(`/api/admin/videos/${videoId}`).expect(404);
    expect(mockVideoDeleteById).not.toHaveBeenCalled();
  });

  it('does not delete S3 objects for externally linked videos', async () => {
    mockVideoFindById.mockResolvedValue(
      buildVideo({
        status: 'ready',
        uploadId: null,
        originalKey: null,
        hlsKey: 'https://cdn.example.com/videos/x/index.m3u8',
      }),
    );
    mockVideoDeleteById.mockResolvedValue(true);

    const res = await agent
      .delete(`/api/admin/videos/${videoId}`)
      .expect(200);

    expect(res.body.data.deleted).toBe(true);
    expect(mockDeleteObject).not.toHaveBeenCalled();
    expect(mockDeleteObjectsByPrefix).not.toHaveBeenCalled();
    expect(mockVideoDeleteById).toHaveBeenCalledOnce();
  });

  it('links an existing CDN HLS video to a lesson', async () => {
    mockCourseFindById.mockResolvedValue(sampleCourse);
    mockLessonFindByIdAndCourseId.mockResolvedValue(sampleLesson);
    mockVideoFindByLessonId.mockResolvedValue(undefined);
    mockVideoCreate.mockResolvedValue(
      buildVideo({
        status: 'ready',
        originalKey: null,
        hlsKey: 'https://cdn.example.com/videos/course/lesson/index.m3u8',
        duration: 300,
      }),
    );

    const res = await agent
      .post('/api/admin/videos/link')
      .send({
        courseId,
        lessonId,
        title: 'Lesson 1',
        playbackUrl: 'https://cdn.example.com/videos/course/lesson/index.m3u8',
        playbackType: 'hls',
        duration: 300,
      })
      .expect(201);

    expect(res.body.data.status).toBe('ready');
    expect(res.body.data.playbackUrl).toBe(
      'https://cdn.example.com/videos/course/lesson/index.m3u8',
    );
    expect(mockEnqueueTranscodeJob).not.toHaveBeenCalled();
  });

  it('uploads video file successfully', async () => {
    mockVideoFindById.mockResolvedValue(buildVideo());

    const res = await agent
      .post(`/api/admin/videos/${videoId}/upload`)
      .attach('file', Buffer.from('fake-video'), {
        filename: 'input.mp4',
        contentType: 'video/mp4',
      })
      .expect(200);

    expect(res.body.data.videoId).toBe(videoId);
    expect(res.body.data.originalKey).toBe(`videos/originals/${courseId}/${videoId}/input.mp4`);
    expect(res.body.data.size).toBe(1024);
    expect(mockUploadFileFromPath).toHaveBeenCalledOnce();
  });

  it('returns 404 when complete-upload cannot find S3 object', async () => {
    mockVideoFindById.mockResolvedValue(buildVideo());
    mockObjectExistsAndSize.mockResolvedValue({ exists: false, size: 0 });

    const res = await agent
      .post(`/api/admin/videos/${videoId}/complete-upload`)
      .send()
      .expect(404);

    expect(res.body.error).toBe('Uploaded video not found in storage');
  });

  it('enqueues transcode job on complete-upload', async () => {
    const pending = buildVideo();
    const uploaded = buildVideo({ status: 'uploaded', size: 1024 });

    mockVideoFindById.mockResolvedValueOnce(pending).mockResolvedValueOnce(uploaded);
    mockVideoUpdateById.mockResolvedValue(uploaded);

    const res = await agent
      .post(`/api/admin/videos/${videoId}/complete-upload`)
      .send()
      .expect(202);

    expect(res.body.data.status).toBe('uploaded');
    expect(mockEnqueueTranscodeJob).toHaveBeenCalledOnce();
  });

  it('does not enqueue duplicate job when complete-upload is called twice', async () => {
    const uploaded = buildVideo({ status: 'uploaded', size: 1024 });
    mockVideoFindById.mockResolvedValue(uploaded);
    mockGetTranscodeJobState.mockResolvedValue('waiting');

    await agent.post(`/api/admin/videos/${videoId}/complete-upload`).send().expect(202);
    await agent.post(`/api/admin/videos/${videoId}/complete-upload`).send().expect(202);

    expect(mockEnqueueTranscodeJob).not.toHaveBeenCalled();
  });

  it('re-enqueues a processing video when the transcode job failed', async () => {
    const processing = buildVideo({ status: 'processing', size: 1024 });
    const remove = vi.fn().mockResolvedValue(undefined);
    mockVideoFindById.mockResolvedValue(processing);
    mockGetTranscodeJobState.mockResolvedValue('failed');
    mockGetTranscodeJob.mockResolvedValue({ remove });

    const res = await agent
      .post(`/api/admin/videos/${videoId}/complete-upload`)
      .send()
      .expect(202);

    expect(res.body.data.status).toBe('processing');
    expect(remove).toHaveBeenCalledOnce();
    expect(mockEnqueueTranscodeJob).toHaveBeenCalledOnce();
  });

  it('returns status payload', async () => {
    mockVideoFindById.mockResolvedValue(buildVideo({ status: 'processing' }));

    const res = await agent.get(`/api/admin/videos/${videoId}/status`).expect(200);

    expect(res.body.data.videoId).toBe(videoId);
    expect(res.body.data.status).toBe('processing');
  });

  it('returns 422 for playback when video is not ready', async () => {
    mockCourseFindById.mockResolvedValue(sampleCourse);
    mockVideoFindById.mockResolvedValue(buildVideo({ status: 'processing' }));
    mockLessonFindById.mockResolvedValue(sampleLesson);
    mockCanViewCourseContent.mockResolvedValue(true);

    const res = await agent
      .get(`/api/courses/${courseId}/videos/${videoId}/playback`)
      .expect(422);

    expect(res.body.error).toBe('Video is not ready for playback');
  });

  it('returns playback url when video is ready', async () => {
    mockCourseFindById.mockResolvedValue(sampleCourse);
    mockVideoFindById.mockResolvedValue(
      buildVideo({
        status: 'ready',
        hlsKey: `videos/hls/${courseId}/${videoId}/index.m3u8`,
      }),
    );
    mockLessonFindById.mockResolvedValue(sampleLesson);
    mockCanViewCourseContent.mockResolvedValue(true);

    const res = await agent
      .get(`/api/courses/${courseId}/videos/${videoId}/playback`)
      .expect(200);

    expect(res.body.data.playbackUrl).toContain('https://s3-hn1-r1.longvan.net/test-bucket/videos/hls/');
    expect(res.body.data.playbackUrl).toContain('index.m3u8');
  });

  it('returns 403 for playback when user lacks lesson access', async () => {
    mockCourseFindById.mockResolvedValue(sampleCourse);
    mockVideoFindById.mockResolvedValue(
      buildVideo({
        status: 'ready',
        hlsKey: `videos/hls/${courseId}/${videoId}/index.m3u8`,
      }),
    );
    mockLessonFindById.mockResolvedValue(sampleLesson);
    mockCanViewCourseContent.mockResolvedValue(false);

    const res = await agent
      .get(`/api/courses/${courseId}/videos/${videoId}/playback`)
      .expect(403);

    expect(res.body.error).toBe('You do not have access to this content');
  });

  it('returns 403 for playback on draft course for guest', async () => {
    mockCourseFindById.mockResolvedValue({
      ...sampleCourse,
      status: 'draft',
    });
    mockVideoFindById.mockResolvedValue(
      buildVideo({
        status: 'ready',
        hlsKey: `videos/hls/${courseId}/${videoId}/index.m3u8`,
      }),
    );
    mockLessonFindById.mockResolvedValue(sampleLesson);
    mockCanViewCourseContent.mockResolvedValue(false);

    const res = await agent
      .get(`/api/courses/${courseId}/videos/${videoId}/playback`)
      .expect(403);

    expect(res.body.error).toBe('You do not have access to this content');
  });
});
