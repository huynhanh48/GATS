import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type Job } from 'bullmq';
import path from 'path';

const courseId = '11111111-1111-4111-8111-111111111111';
const videoId = '33333333-3333-4333-8333-333333333333';

function buildVideo(overrides: Record<string, unknown> = {}) {
  return {
    id: videoId,
    courseId,
    lessonId: '22222222-2222-4222-8222-222222222222',
    title: 'Lesson 1',
    storageProvider: 's3' as const,
    originalKey: `videos/originals/${courseId}/${videoId}/input.mp4`,
    hlsKey: null,
    mp4Url: null,
    duration: null,
    size: null,
    status: 'pending_upload' as const,
    errorMessage: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

const mockResolveHttp = vi.fn();
const mockResolveFile = vi.fn();
const mockTranscode = vi.fn();
const mockUploaderStart = vi.fn();
const mockUploaderFinalize = vi.fn();
const mockUploaderAbort = vi.fn();
const mockFindById = vi.fn();
const mockUpdateStatus = vi.fn();
const mockUpdateAfterTranscode = vi.fn();
const mockMarkFailed = vi.fn();

vi.mock('@src/workers/helpers/s3-download', () => ({
  resolveOriginalInputHttp: (...args: unknown[]) => mockResolveHttp(...args),
  resolveOriginalInputFile: (...args: unknown[]) => mockResolveFile(...args),
}));

vi.mock('@src/workers/helpers/ffmpeg-hls', () => ({
  transcodeToHlsRenditions: (...args: unknown[]) => mockTranscode(...args),
}));

vi.mock('@src/workers/helpers/s3-upload-folder', () => ({
  createHlsProgressiveUploader: () => ({
    start: (...args: unknown[]) => mockUploaderStart(...args),
    stopAndFinalize: (...args: unknown[]) => mockUploaderFinalize(...args),
    abort: (...args: unknown[]) => mockUploaderAbort(...args),
    getUploadedPaths: () => [],
  }),
}));

vi.mock('@src/repos/VideoRepo', () => ({
  findById: (...args: unknown[]) => mockFindById(...args),
  updateStatus: (...args: unknown[]) => mockUpdateStatus(...args),
  updateAfterTranscode: (...args: unknown[]) =>
    mockUpdateAfterTranscode(...args),
  markFailed: (...args: unknown[]) => mockMarkFailed(...args),
}));

import { processTranscodeJob } from '@src/workers/video-transcode.worker';

function buildJob(attemptsMade = 0, attempts = 3): Job {
  return {
    data: {
      videoId,
      courseId,
      lessonId: '22222222-2222-4222-8222-222222222222',
      originalKey: `videos/originals/${courseId}/${videoId}/input.mp4`,
    },
    opts: { attempts },
    attemptsMade,
  } as unknown as Job;
}

function mockAbrResult(outputRoot: string) {
  return {
    masterPlaylistPath: path.join(outputRoot, 'index.m3u8'),
    renditions: [
      { resolution: '360p', width: 640, height: 360, bandwidth: 800_000 },
      { resolution: '720p', width: 1280, height: 720, bandwidth: 2_500_000 },
      { resolution: '1080p', width: 1920, height: 1080, bandwidth: 5_000_000 },
    ].map((rendition) => ({
      rendition,
      outputDir: path.join(outputRoot, rendition.resolution),
      playlistPath: path.join(outputRoot, rendition.resolution, 'index.m3u8'),
    })),
  };
}

describe('video transcode worker', () => {
  beforeEach(() => {
    mockResolveHttp.mockReset();
    mockResolveFile.mockReset();
    mockTranscode.mockReset();
    mockUploaderStart.mockReset();
    mockUploaderFinalize.mockReset();
    mockUploaderAbort.mockReset();
    mockFindById.mockReset();
    mockUpdateStatus.mockReset();
    mockUpdateAfterTranscode.mockReset();
    mockMarkFailed.mockReset();

    mockResolveHttp.mockResolvedValue({
      kind: 'http',
      input: 'https://example.com/presigned-original',
    });
    mockUploaderFinalize.mockResolvedValue(undefined);
    mockUploaderAbort.mockResolvedValue(undefined);
    mockFindById.mockResolvedValue(buildVideo({ status: 'uploaded' }));
    mockUpdateStatus.mockResolvedValue(buildVideo({ status: 'processing' }));
    mockUpdateAfterTranscode.mockResolvedValue(
      buildVideo({
        status: 'ready',
        hlsKey: `videos/hls/${courseId}/${videoId}/index.m3u8`,
      }),
    );
    mockTranscode.mockImplementation((_input: string, outputRoot: string) =>
      Promise.resolve(mockAbrResult(outputRoot)),
    );
  });

  it('uses HTTP FFmpeg input with progressive upload on success', async () => {
    await processTranscodeJob(buildJob());

    expect(mockResolveHttp).toHaveBeenCalledWith(
      `videos/originals/${courseId}/${videoId}/input.mp4`,
    );
    expect(mockResolveFile).not.toHaveBeenCalled();
    expect(mockUploaderStart).toHaveBeenCalledOnce();
    expect(mockUploaderFinalize).toHaveBeenCalledOnce();
    expect(mockUploaderAbort).not.toHaveBeenCalled();
    expect(mockTranscode).toHaveBeenCalledWith(
      'https://example.com/presigned-original',
      expect.any(String),
    );
    expect(mockUpdateAfterTranscode).toHaveBeenCalledWith(videoId, {
      hlsKey: `videos/hls/${courseId}/${videoId}/index.m3u8`,
      duration: null,
      renditions: [
        {
          resolution: '360p',
          bitrate: 800_000,
          playlistKey: `videos/hls/${courseId}/${videoId}/360p/index.m3u8`,
        },
        {
          resolution: '720p',
          bitrate: 2_500_000,
          playlistKey: `videos/hls/${courseId}/${videoId}/720p/index.m3u8`,
        },
        {
          resolution: '1080p',
          bitrate: 5_000_000,
          playlistKey: `videos/hls/${courseId}/${videoId}/1080p/index.m3u8`,
        },
      ],
    });
    expect(mockMarkFailed).not.toHaveBeenCalled();
  });

  it('falls back to disk and aborts first progressive uploader on HTTP failure', async () => {
    mockTranscode
      .mockRejectedValueOnce(new Error('http input failed'))
      .mockImplementation((_input: string, outputRoot: string) =>
        Promise.resolve(mockAbrResult(outputRoot)),
      );
    mockResolveFile.mockResolvedValue({
      kind: 'file',
      input: '/tmp/video-input',
    });

    await processTranscodeJob(buildJob());

    expect(mockResolveHttp).toHaveBeenCalledOnce();
    expect(mockResolveFile).toHaveBeenCalledWith(
      `videos/originals/${courseId}/${videoId}/input.mp4`,
      expect.any(String),
    );
    expect(mockUploaderAbort).toHaveBeenCalledOnce();
    expect(mockUploaderStart).toHaveBeenCalledTimes(2);
    expect(mockUploaderFinalize).toHaveBeenCalledOnce();
    expect(mockTranscode).toHaveBeenCalledTimes(2);
    expect(mockUpdateAfterTranscode).toHaveBeenCalledOnce();
  });

  it('marks failed only on final retry', async () => {
    mockTranscode.mockRejectedValue(new Error('ffmpeg failed'));
    mockResolveFile.mockResolvedValue({
      kind: 'file',
      input: '/tmp/video-input',
    });

    await expect(processTranscodeJob(buildJob(2, 3))).rejects.toThrow(
      'ffmpeg failed',
    );
    expect(mockMarkFailed).toHaveBeenCalledOnce();

    mockMarkFailed.mockReset();
    await expect(processTranscodeJob(buildJob(0, 3))).rejects.toThrow(
      'ffmpeg failed',
    );
    expect(mockMarkFailed).not.toHaveBeenCalled();
  });

  it('runs cleanup after failure via finally block', async () => {
    mockTranscode.mockRejectedValue(new Error('boom'));
    mockResolveFile.mockResolvedValue({
      kind: 'file',
      input: '/tmp/video-input',
    });

    await expect(processTranscodeJob(buildJob(2, 3))).rejects.toThrow('boom');
    expect(mockUpdateStatus).toHaveBeenCalled();
  });

  it('skips processing when video is already ready', async () => {
    mockFindById.mockResolvedValue(buildVideo({ status: 'ready' }));

    await processTranscodeJob(buildJob());

    expect(mockResolveHttp).not.toHaveBeenCalled();
    expect(mockUpdateAfterTranscode).not.toHaveBeenCalled();
  });

  it('skips quietly when video was deleted', async () => {
    mockFindById.mockResolvedValue(undefined);

    await processTranscodeJob(buildJob());

    expect(mockResolveHttp).not.toHaveBeenCalled();
    expect(mockTranscode).not.toHaveBeenCalled();
    expect(mockMarkFailed).not.toHaveBeenCalled();
  });
});
