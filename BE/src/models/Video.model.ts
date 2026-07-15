import path from 'path';

import {
  videoStatusEnum,
  videoStorageProviderEnum,
} from '@src/db/schema/video';
import { z } from 'zod';

export const videoStatusSchema = z.enum(videoStatusEnum.enumValues);
export const videoStorageProviderSchema = z.enum(
  videoStorageProviderEnum.enumValues,
);

export const ALLOWED_VIDEO_CONTENT_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
] as const;

export const MAX_VIDEO_UPLOAD_BYTES = 50 * 1024 * 1024 * 1024;

export const MAX_MULTIPART_PART_NUMBER = 10_000;

export const VIDEO_HLS_RENDITIONS = [
  {
    resolution: '360p',
    width: 640,
    height: 360,
    bandwidth: 800_000,
    videoBitrate: '800k',
    maxrate: '856k',
    bufsize: '1200k',
  },
  {
    resolution: '720p',
    width: 1280,
    height: 720,
    bandwidth: 2_500_000,
    videoBitrate: '2500k',
    maxrate: '2675k',
    bufsize: '3750k',
  },
  {
    resolution: '1080p',
    width: 1920,
    height: 1080,
    bandwidth: 5_000_000,
    videoBitrate: '5000k',
    maxrate: '5350k',
    bufsize: '7500k',
  },
] as const;

export type VideoHlsRendition = (typeof VIDEO_HLS_RENDITIONS)[number];
export type VideoHlsResolution = VideoHlsRendition['resolution'];

export const videoRecordSchema = z.object({
  id: z.string().uuid(),
  courseId: z.string().uuid(),
  lessonId: z.string().uuid(),
  title: z.string().nullable(),
  storageProvider: videoStorageProviderSchema,
  originalKey: z.string().nullable(),
  hlsKey: z.string().nullable(),
  mp4Url: z.string().nullable(),
  duration: z.number().int().nullable(),
  size: z.number().int().nullable(),
  uploadId: z.string().nullable(),
  status: videoStatusSchema,
  errorMessage: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const initUploadSchema = z.object({
  courseId: z.string().uuid(),
  lessonId: z.string().uuid(),
  title: z.string().min(1).max(255),
  filename: z.string().min(1).max(255),
  contentType: z.enum(ALLOWED_VIDEO_CONTENT_TYPES),
});

export const initMultipartUploadSchema = initUploadSchema.extend({
  size: z
    .number()
    .int()
    .positive()
    .max(MAX_VIDEO_UPLOAD_BYTES),
});

export const multipartPartUrlSchema = z.object({
  uploadId: z.string().min(1).max(255),
  partNumber: z.number().int().min(1).max(MAX_MULTIPART_PART_NUMBER),
});

export const multipartCompletePartSchema = z.object({
  partNumber: z.number().int().min(1).max(MAX_MULTIPART_PART_NUMBER),
  etag: z.string().min(1),
});

export const multipartCompleteSchema = z.object({
  uploadId: z.string().min(1).max(255),
  parts: z.array(multipartCompletePartSchema).min(1),
});

export const multipartAbortSchema = z.object({
  uploadId: z.string().min(1).max(255),
});

export const linkVideoSchema = z.object({
  courseId: z.string().uuid(),
  lessonId: z.string().uuid(),
  title: z.string().min(1).max(255),
  playbackUrl: z.string().url(),
  playbackType: z.enum(['hls', 'mp4']).default('hls'),
  duration: z.number().int().min(0).optional(),
});

export const videoIdParamSchema = z.object({
  videoId: z.string().uuid(),
});

export const playbackParamsSchema = z.object({
  courseId: z.string().uuid(),
  videoId: z.string().uuid(),
});

export const initUploadResponseSchema = z.object({
  data: z.object({
    videoId: z.string().uuid(),
    uploadUrl: z.string().url(),
    originalKey: z.string(),
    status: videoStatusSchema,
  }),
});

export const initMultipartUploadResponseSchema = z.object({
  data: z.object({
    videoId: z.string().uuid(),
    originalKey: z.string(),
    uploadId: z.string(),
    partSize: z.number().int().positive(),
    totalParts: z.number().int().positive(),
    status: videoStatusSchema,
  }),
});

export const multipartPartUrlResponseSchema = z.object({
  data: z.object({
    url: z.string().url(),
    partNumber: z.number().int().positive(),
    expiresIn: z.number().int().positive(),
  }),
});

export const multipartCompleteResponseSchema = z.object({
  data: z.object({
    videoId: z.string().uuid(),
    originalKey: z.string(),
    size: z.number().int(),
    status: videoStatusSchema,
  }),
});

export const uploadFileResponseSchema = z.object({
  data: z.object({
    videoId: z.string().uuid(),
    originalKey: z.string(),
    size: z.number().int(),
    status: videoStatusSchema,
  }),
});

export const videoStatusResponseSchema = z.object({
  data: z.object({
    videoId: z.string().uuid(),
    courseId: z.string().uuid(),
    lessonId: z.string().uuid(),
    status: videoStatusSchema,
    originalKey: z.string().nullable(),
    hlsKey: z.string().nullable(),
    mp4Url: z.string().nullable(),
    errorMessage: z.string().nullable(),
    duration: z.number().int().nullable(),
    size: z.number().int().nullable(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  }),
});

export const playbackResponseSchema = z.object({
  data: z.object({
    videoId: z.string().uuid(),
    courseId: z.string().uuid(),
    playbackUrl: z.string().url(),
    playbackType: z.enum(['hls', 'mp4']),
    hlsKey: z.string().nullable(),
    mp4Url: z.string().nullable(),
  }),
});

export type VideoRecord = z.infer<typeof videoRecordSchema>;
export type InitUploadInput = z.infer<typeof initUploadSchema>;
export type InitMultipartUploadInput = z.infer<typeof initMultipartUploadSchema>;
export type MultipartPartUrlInput = z.infer<typeof multipartPartUrlSchema>;
export type MultipartCompleteInput = z.infer<typeof multipartCompleteSchema>;
export type MultipartAbortInput = z.infer<typeof multipartAbortSchema>;
export type LinkVideoInput = z.infer<typeof linkVideoSchema>;
export type VideoStatus = z.infer<typeof videoStatusSchema>;

export function parseInitUploadInput(data: unknown): InitUploadInput {
  return initUploadSchema.parse(data);
}

export function parseInitMultipartUploadInput(
  data: unknown,
): InitMultipartUploadInput {
  return initMultipartUploadSchema.parse(data);
}

export function parseMultipartPartUrlInput(data: unknown): MultipartPartUrlInput {
  return multipartPartUrlSchema.parse(data);
}

export function parseMultipartCompleteInput(
  data: unknown,
): MultipartCompleteInput {
  return multipartCompleteSchema.parse(data);
}

export function parseMultipartAbortInput(data: unknown): MultipartAbortInput {
  return multipartAbortSchema.parse(data);
}

export function parseLinkVideoInput(data: unknown): LinkVideoInput {
  return linkVideoSchema.parse(data);
}

export function parseVideoIdParam(data: unknown): string {
  return videoIdParamSchema.parse(data).videoId;
}

export function parsePlaybackParams(data: unknown): {
  courseId: string;
  videoId: string;
} {
  return playbackParamsSchema.parse(data);
}

export function parseVideoRecord(data: unknown): VideoRecord {
  return videoRecordSchema.parse(data);
}

const UNSAFE_FILENAME_PATTERN = /[^a-zA-Z0-9._-]/g;

export function sanitizeFilename(filename: string): string {
  const normalized = filename.replace(/\0/g, '').trim();
  const basename = path.basename(normalized).replace(/\\/g, '/');
  const safe = basename
    .split('/')
    .pop()
    ?.replace(UNSAFE_FILENAME_PATTERN, '_')
    .replace(/^_+|_+$/g, '');

  if (!safe || safe === '.' || safe === '..') {
    throw new Error('Invalid filename');
  }

  return safe;
}

export function buildOriginalKey(
  courseId: string,
  videoId: string,
  filename: string,
): string {
  return `videos/originals/${courseId}/${videoId}/${filename}`;
}

export function buildHlsPrefix(courseId: string, videoId: string): string {
  return `videos/hls/${courseId}/${videoId}`;
}

export function buildHlsPlaylistKey(courseId: string, videoId: string): string {
  return `${buildHlsPrefix(courseId, videoId)}/index.m3u8`;
}

export function buildRenditionPlaylistKey(
  courseId: string,
  videoId: string,
  resolution: VideoHlsResolution,
): string {
  return `${buildHlsPrefix(courseId, videoId)}/${resolution}/index.m3u8`;
}

export function build720pPlaylistKey(
  courseId: string,
  videoId: string,
): string {
  return buildRenditionPlaylistKey(courseId, videoId, '720p');
}
