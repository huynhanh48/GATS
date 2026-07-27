import { type Job, Worker, type WorkerOptions } from 'bullmq';
import { mkdir, mkdtemp, rm } from 'fs/promises';
import logger from 'jet-logger';
import os from 'os';
import path from 'path';

import EnvVars from '@src/common/constants/env';
import { getQueueConnectionOptions } from '@src/libs/redis.client';
import {
  buildHlsPlaylistKey,
  buildHlsPrefix,
  buildAudioFlacKey,
  buildRenditionPlaylistKey,
} from '@src/models/Video.model';
import {
  TRANSCODE_VIDEO_JOB,
  type TranscodeVideoJobData,
  VIDEO_TRANSCODE_QUEUE,
} from '@src/queues/video.queue';
import * as VideoRepo from '@src/repos/VideoRepo';
import { extractFlacAudio } from '@src/workers/helpers/ffmpeg-audio';
import { transcodeToHlsRenditions } from '@src/workers/helpers/ffmpeg-hls';
import {
  resolveOriginalInputFile,
  resolveOriginalInputHttp,
} from '@src/workers/helpers/s3-download';
import { createHlsProgressiveUploader } from '@src/workers/helpers/s3-upload-folder';
import { uploadFileFromPath } from '@src/libs/s3-storage';

function sanitizeErrorMessage(error: unknown): string {
  const err = error as {
    name?: string;
    message?: string;
    code?: string;
    cause?: unknown;
    $metadata?: { httpStatusCode?: number; attempts?: number };
  };

  const mainMessage =
    error instanceof Error
      ? err.name && err.name !== err.message
        ? `${err.name}: ${err.message}`
        : err.message
      : 'Unknown transcode error';

  const details = [
    mainMessage,
    err.code ? `code=${err.code}` : undefined,
    err.$metadata?.httpStatusCode
      ? `status=${err.$metadata.httpStatusCode}`
      : undefined,
    err.$metadata?.attempts ? `attempts=${err.$metadata.attempts}` : undefined,
    err.cause instanceof Error ? `cause=${err.cause.message}` : undefined,
  ].filter(Boolean);

  const message = details.join(' ');
  return message.replace(/AWS[^\s]*/gi, '[redacted]').slice(0, 500);
}

function elapsedMs(startedAt: number): number {
  return Date.now() - startedAt;
}

function getVideoWorkerOptions(): WorkerOptions {
  return {
    connection: getQueueConnectionOptions(),
    concurrency: EnvVars.VideoWorkerConcurrency,
    lockDuration: EnvVars.VideoWorkerLockDurationMs,
    maxStalledCount: EnvVars.VideoWorkerMaxStalledCount,
    stalledInterval: EnvVars.VideoWorkerStalledIntervalMs,
  };
}

async function encodeAndUpload(
  input: string,
  hlsRoot: string,
  storagePrefix: string,
): Promise<Awaited<ReturnType<typeof transcodeToHlsRenditions>>> {
  const uploader = createHlsProgressiveUploader({
    localDir: hlsRoot,
    storagePrefix,
    concurrency: EnvVars.HlsUploadConcurrency,
  });
  uploader.start();
  try {
    const result = await transcodeToHlsRenditions(input, hlsRoot);
    await uploader.stopAndFinalize();
    return result;
  } catch (error) {
    await uploader.abort();
    throw error;
  }
}

export async function processTranscodeJob(
  job: Job<TranscodeVideoJobData>,
): Promise<void> {
  const { videoId, courseId, originalKey } = job.data;
  const video = await VideoRepo.findById(videoId);

  // Video was deleted while job was queued/retrying — finish quietly (no retries).
  if (!video) {
    logger.info(
      `Transcode skip (${job.id}): video ${videoId} no longer exists`,
    );
    return;
  }

  if (video.status === 'ready') {
    return;
  }

  if (!originalKey) {
    throw new Error('Original key is missing');
  }

  logger.info(
    `Transcode job started (${job.id}): video=${videoId}, key=${originalKey}`,
  );

  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'video-transcode-'));
  const inputPath = path.join(tempRoot, 'input');
  const hlsRoot = path.join(tempRoot, 'hls');
  const jobStartedAt = Date.now();
  const storagePrefix = buildHlsPrefix(courseId, videoId);

  try {
    await VideoRepo.updateStatus(videoId, 'processing', { errorMessage: null });
    await mkdir(hlsRoot, { recursive: true });

    let inputKind: 'http' | 'disk-fallback' = 'http';
    let ffmpegInput = '';
    let abrResult: Awaited<ReturnType<typeof transcodeToHlsRenditions>>;

    const encodeStartedAt = Date.now();
    try {
      const httpInput = await resolveOriginalInputHttp(originalKey);
      ffmpegInput = httpInput.input;
      logger.info(
        `Video ${videoId}: FFmpeg ABR input=http (presigned URL), progressive upload on`,
      );
      abrResult = await encodeAndUpload(
        ffmpegInput,
        hlsRoot,
        storagePrefix,
      );
    } catch (httpError) {
      const reason =
        httpError instanceof Error &&
        httpError.name === 'HttpInputUnreliableError'
          ? httpError.message
          : sanitizeErrorMessage(httpError);
      logger.err(
        `Video ${videoId}: HTTP FFmpeg path failed (${reason}), falling back to disk download`,
      );
      inputKind = 'disk-fallback';
      await rm(hlsRoot, { recursive: true, force: true });
      await mkdir(hlsRoot, { recursive: true });
      const downloadStartedAt = Date.now();
      const fileInput = await resolveOriginalInputFile(originalKey, inputPath);
      ffmpegInput = fileInput.input;
      logger.info(
        `Video ${videoId}: disk-fallback download done in ${elapsedMs(downloadStartedAt)}ms, starting FFmpeg`,
      );
      abrResult = await encodeAndUpload(
        ffmpegInput,
        hlsRoot,
        storagePrefix,
      );
    }

    logger.info(
      `Video ${videoId}: FFmpeg ABR + HLS upload finished (input=${inputKind}) in ${elapsedMs(encodeStartedAt)}ms`,
    );

    // Dual-output: extract FLAC after HLS. Failure/skip must not block ready.
    // Prefer a local original file — reusing the LongVan HTTP URL after ABR often
    // fails ffprobe and was mislabeled as "no audio".
    let audioFlacKey: string | null = null;
    const flacStartedAt = Date.now();
    const flacPath = path.join(tempRoot, 'audio.flac');
    try {
      await job.updateProgress({ phase: 'extracting_audio' });
    } catch {
      // Progress is best-effort (older BullMQ / missing listeners).
    }

    let flacInput = ffmpegInput;
    if (inputKind === 'http') {
      const downloadStartedAt = Date.now();
      const fileInput = await resolveOriginalInputFile(originalKey, inputPath);
      flacInput = fileInput.input;
      logger.info(
        `Video ${videoId}: FLAC input=disk (downloaded in ${elapsedMs(downloadStartedAt)}ms)`,
      );
    }

    const flacResult = await extractFlacAudio(flacInput, flacPath);
    if (flacResult.status === 'ok') {
      const key = buildAudioFlacKey(courseId, videoId);
      try {
        await uploadFileFromPath(
          flacPath,
          key,
          'audio/flac',
          'public, max-age=31536000, immutable',
        );
        audioFlacKey = key;
        logger.info(
          `Video ${videoId}: FLAC uploaded key=${audioFlacKey} in ${elapsedMs(flacStartedAt)}ms`,
        );
      } catch (uploadError) {
        logger.err(
          `Video ${videoId}: FLAC upload failed (HLS still ready): ${sanitizeErrorMessage(uploadError)}`,
        );
      }
    } else if (flacResult.status === 'no_audio') {
      logger.info(`Video ${videoId}: FLAC skipped (no audio stream)`);
    } else {
      logger.err(
        `Video ${videoId}: FLAC extract failed (HLS still ready): ${flacResult.message}`,
      );
    }

    const hlsKey = buildHlsPlaylistKey(courseId, videoId);
    await VideoRepo.updateAfterTranscode(videoId, {
      hlsKey,
      audioFlacKey,
      duration: video.duration,
      renditions: abrResult.renditions.map(({ rendition }) => ({
        resolution: rendition.resolution,
        bitrate: rendition.bandwidth,
        playlistKey: buildRenditionPlaylistKey(
          courseId,
          videoId,
          rendition.resolution,
        ),
      })),
    });

    logger.info(
      `Video ${videoId} transcoded successfully (input=${inputKind}, flac=${audioFlacKey ? 'yes' : 'no'}, totalMs=${elapsedMs(jobStartedAt)})`,
    );
  } catch (error) {
    logger.err(
      `Video ${videoId}: transcode failed: ${sanitizeErrorMessage(error)}`,
    );
    const attempts = job.opts.attempts ?? 1;
    if (job.attemptsMade + 1 >= attempts) {
      await VideoRepo.markFailed(videoId, sanitizeErrorMessage(error));
    }
    throw error;
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

export function createVideoTranscodeWorker(): Worker<TranscodeVideoJobData> {
  const workerOptions = getVideoWorkerOptions();
  logger.info(
    `Video transcode worker config: concurrency=${workerOptions.concurrency}, lockDurationMs=${workerOptions.lockDuration}, stalledIntervalMs=${workerOptions.stalledInterval}, maxStalledCount=${workerOptions.maxStalledCount}`,
  );

  const worker = new Worker<TranscodeVideoJobData>(
    VIDEO_TRANSCODE_QUEUE,
    async (job) => {
      if (job.name !== TRANSCODE_VIDEO_JOB) {
        throw new Error(`Unknown job name: ${job.name}`);
      }
      await processTranscodeJob(job);
    },
    workerOptions,
  );

  worker.on('failed', (job, error) => {
    logger.err(
      `Transcode job failed (${job?.id}): ${sanitizeErrorMessage(error)}`,
    );
  });

  worker.on('completed', (job) => {
    logger.info(`Transcode job completed (${job.id})`);
  });

  worker.on('stalled', (jobId, prev) => {
    logger.err(`Transcode job stalled (${jobId}, prev=${prev})`);
  });

  worker.on('lockRenewalFailed', (jobIds) => {
    logger.err(`Transcode job lock renewal failed: ${jobIds.join(', ')}`);
  });

  worker.on('error', (error) => {
    logger.err(`Video transcode worker error: ${sanitizeErrorMessage(error)}`);
  });

  return worker;
}
