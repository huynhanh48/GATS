import { spawn } from 'child_process';
import { access, mkdir } from 'fs/promises';
import logger from 'jet-logger';
import path from 'path';

import EnvVars from '@src/common/constants/env';
import {
  VIDEO_HLS_RENDITIONS,
  type VideoHlsRendition,
} from '@src/models/Video.model';

const FFMPEG_BIN = 'ffmpeg';
const FFPROBE_BIN = 'ffprobe';

/** Bound probe so HTTPS inputs do not scan multi‑GB objects. */
export const FFPROBE_PROBESIZE = '5M';
export const FFPROBE_ANALYZEDURATION = '10M';
export const FFPROBE_TIMEOUT_MS = 20_000;

/** ~2× hls_time=6 at 24–30fps; keeps ABR variant keyframes aligned. */
const GOP_SIZE = 48;

const ALLOWED_PRESETS = new Set([
  'ultrafast',
  'superfast',
  'veryfast',
  'faster',
  'fast',
  'medium',
]);

export type HlsRenditionOutput = {
  rendition: VideoHlsRendition;
  outputDir: string;
  playlistPath: string;
};

export type AbrTranscodeResult = {
  masterPlaylistPath: string;
  renditions: HlsRenditionOutput[];
};

export type AudioProbeResult = {
  hasAudio: boolean;
  codecName: string | null;
  /** True when stream is AAC — safe to `-c:a copy` into HLS. */
  copySafe: boolean;
  timedOut: boolean;
  /**
   * Set when ffprobe crashed or exited non-zero — distinct from "no audio stream".
   * Callers that need certainty (FLAC) must treat this as failure, not no_audio.
   */
  error: string | null;
};

/** Thrown when HTTPS probe times out — worker should download to disk and retry. */
export class HttpInputUnreliableError extends Error {
  constructor(
    message = 'HTTP input probe timed out; prefer disk fallback for large objects',
  ) {
    super(message);
    this.name = 'HttpInputUnreliableError';
  }
}

export function shouldFallbackFromHttpProbe(
  input: string,
  probe: AudioProbeResult,
): boolean {
  return /^https?:\/\//i.test(input) && probe.timedOut;
}

export type AbrAudioOptions = {
  includeAudio: boolean;
  copyAudio: boolean;
};

export function resolveX264Preset(preset?: string): string {
  const value = (
    preset ??
    EnvVars.FfmpegX264Preset ??
    'veryfast'
  ).toLowerCase();
  return ALLOWED_PRESETS.has(value) ? value : 'veryfast';
}

/** Exported for unit tests — bounded HTTP-safe ffprobe argv. */
export function buildFfprobeAudioArgs(input: string): string[] {
  return [
    '-v',
    'error',
    '-probesize',
    FFPROBE_PROBESIZE,
    '-analyzeduration',
    FFPROBE_ANALYZEDURATION,
    '-select_streams',
    'a:0',
    '-show_entries',
    'stream=codec_type,codec_name',
    '-of',
    'json',
    input,
  ];
}

type FfprobeStreamJson = {
  codec_name?: unknown;
  codec_type?: unknown;
};

type FfprobeJson = {
  streams?: unknown;
};

export function parseFfprobeAudioResult(stdout: string): AudioProbeResult {
  try {
    const parsed = JSON.parse(stdout) as FfprobeJson;
    const streams = Array.isArray(parsed.streams) ? parsed.streams : [];
    const audioStream = streams.find((stream): stream is FfprobeStreamJson => {
      const item = stream as FfprobeStreamJson;
      return item.codec_type === 'audio';
    });

    if (!audioStream) {
      return {
        hasAudio: false,
        codecName: null,
        copySafe: false,
        timedOut: false,
        error: null,
      };
    }

    const codecName =
      typeof audioStream.codec_name === 'string'
        ? audioStream.codec_name.toLowerCase()
        : null;

    return {
      hasAudio: true,
      codecName,
      copySafe: codecName === 'aac',
      timedOut: false,
      error: null,
    };
  } catch {
    return {
      hasAudio: false,
      codecName: null,
      copySafe: false,
      timedOut: false,
      error: 'ffprobe returned invalid JSON',
    };
  }
}

/**
 * Probe first audio stream with size/time bounds.
 * On timeout: assume audio present (include in ABR maps) but re-encode (not copy).
 */
export async function probeAudioStream(
  input: string,
): Promise<AudioProbeResult> {
  const startedAt = Date.now();
  logger.info(`ffprobe start (audio): probesize=${FFPROBE_PROBESIZE}`);

  return new Promise((resolve) => {
    const proc = spawn(FFPROBE_BIN, buildFfprobeAudioArgs(input), {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let settled = false;

    const finish = (result: AudioProbeResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const ms = Date.now() - startedAt;
      if (result.timedOut) {
        logger.info(
          `ffprobe timed out after ${ms}ms, assuming audio=true copySafe=false`,
        );
      } else if (result.error) {
        logger.err(
          `ffprobe failed in ${ms}ms: ${result.error}`,
        );
      } else {
        logger.info(
          `ffprobe done in ${ms}ms hasAudio=${result.hasAudio} codec=${result.codecName ?? 'none'} copySafe=${result.copySafe}`,
        );
      }
      resolve(result);
    };

    const timer = setTimeout(() => {
      proc.kill('SIGKILL');
      finish({
        hasAudio: true,
        codecName: null,
        copySafe: false,
        timedOut: true,
        error: null,
      });
    }, FFPROBE_TIMEOUT_MS);

    proc.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        finish({
          hasAudio: false,
          codecName: null,
          copySafe: false,
          timedOut: false,
          error: `ffprobe exited with code ${code}`,
        });
        return;
      }

      finish(parseFfprobeAudioResult(stdout));
    });

    proc.on('error', (err) => {
      finish({
        hasAudio: false,
        codecName: null,
        copySafe: false,
        timedOut: false,
        error: err.message || 'ffprobe spawn failed',
      });
    });
  });
}

function runFfmpeg(args: string[], cwd?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(FFMPEG_BIN, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd,
    });

    let stderr = '';
    proc.stderr.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      stderr += text;
      if (stderr.length > 8000) {
        stderr = stderr.slice(-8000);
      }
    });

    proc.on('error', (error) => reject(error));
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`FFmpeg exited with code ${code}: ${stderr.trim()}`));
    });
  });
}

function scaleFilter(rendition: VideoHlsRendition): string {
  return (
    [
      `scale=${rendition.width}:${rendition.height}`,
      'force_original_aspect_ratio=decrease',
      'force_divisible_by=2',
    ].join(':') + ',setsar=1'
  );
}

/**
 * Build a single ABR HLS FFmpeg argv (one demux/decode, N encodes).
 * Exported for unit tests — do not rely on spawn side effects.
 */
export function buildAbrFfmpegArgs(
  input: string,
  renditions: readonly VideoHlsRendition[],
  audio: AbrAudioOptions,
  preset?: string,
): string[] {
  if (renditions.length === 0) {
    throw new Error('At least one rendition is required');
  }

  const x264Preset = resolveX264Preset(preset);
  const splitLabels = renditions.map((_, i) => `[v${i}]`).join('');
  const scaleGraph = renditions
    .map((rendition, i) => `[v${i}]${scaleFilter(rendition)}[out${i}]`)
    .join(';');
  const filterComplex = `[0:v]split=${renditions.length}${splitLabels};${scaleGraph}`;

  const args: string[] = ['-y', '-i', input, '-filter_complex', filterComplex];

  for (let i = 0; i < renditions.length; i++) {
    const r = renditions[i];
    args.push(
      '-map',
      `[out${i}]`,
      `-c:v:${i}`,
      'libx264',
      `-preset:v:${i}`,
      x264Preset,
      `-b:v:${i}`,
      r.videoBitrate,
      `-maxrate:v:${i}`,
      r.maxrate,
      `-bufsize:v:${i}`,
      r.bufsize,
      `-g:v:${i}`,
      String(GOP_SIZE),
      `-keyint_min:v:${i}`,
      String(GOP_SIZE),
      `-sc_threshold:v:${i}`,
      '0',
      `-x264-params:v:${i}`,
      `keyint=${GOP_SIZE}:min-keyint=${GOP_SIZE}:scenecut=0`,
    );
  }

  const varStreamParts: string[] = [];

  if (audio.includeAudio) {
    for (let i = 0; i < renditions.length; i++) {
      args.push('-map', 'a:0');
    }
    if (audio.copyAudio) {
      args.push('-c:a', 'copy');
    } else {
      args.push('-c:a', 'aac', '-b:a', '128k', '-ac', '2');
    }
    for (let i = 0; i < renditions.length; i++) {
      varStreamParts.push(`v:${i},a:${i},name:${renditions[i].resolution}`);
    }
  } else {
    args.push('-an');
    for (let i = 0; i < renditions.length; i++) {
      varStreamParts.push(`v:${i},name:${renditions[i].resolution}`);
    }
  }

  args.push(
    '-f',
    'hls',
    '-hls_time',
    '6',
    '-hls_playlist_type',
    'vod',
    '-hls_flags',
    'independent_segments',
    '-hls_segment_filename',
    '%v/segment_%03d.ts',
    '-master_pl_name',
    'index.m3u8',
    '-var_stream_map',
    varStreamParts.join(' '),
    '%v/index.m3u8',
  );

  return args;
}

/**
 * Single-process ABR ladder: decode once, encode all renditions, write HLS + master.
 */
export async function transcodeToHlsRenditions(
  input: string,
  outputRoot: string,
  renditions: readonly VideoHlsRendition[] = VIDEO_HLS_RENDITIONS,
): Promise<AbrTranscodeResult> {
  await mkdir(outputRoot, { recursive: true });
  for (const rendition of renditions) {
    await mkdir(path.join(outputRoot, rendition.resolution), {
      recursive: true,
    });
  }

  const probe = await probeAudioStream(input);
  if (shouldFallbackFromHttpProbe(input, probe)) {
    throw new HttpInputUnreliableError(
      `ffprobe timed out on HTTP input after ${FFPROBE_TIMEOUT_MS}ms`,
    );
  }

  const args = buildAbrFfmpegArgs(input, renditions, {
    includeAudio: probe.hasAudio,
    copyAudio: probe.copySafe,
  });
  await runFfmpeg(args, outputRoot);

  const masterPlaylistPath = path.join(outputRoot, 'index.m3u8');
  await access(masterPlaylistPath);

  const outputs: HlsRenditionOutput[] = [];
  for (const rendition of renditions) {
    const outputDir = path.join(outputRoot, rendition.resolution);
    const playlistPath = path.join(outputDir, 'index.m3u8');
    await access(playlistPath);
    outputs.push({ rendition, outputDir, playlistPath });
  }

  return { masterPlaylistPath, renditions: outputs };
}

export async function transcodeToHls720p(
  inputPath: string,
  outputDir: string,
): Promise<{ outputDir: string; playlistPath: string }> {
  const result = await transcodeToHlsRenditions(
    inputPath,
    path.dirname(outputDir),
    [VIDEO_HLS_RENDITIONS[1]],
  );
  const output = result.renditions[0];
  return {
    outputDir: output.outputDir,
    playlistPath: output.playlistPath,
  };
}
