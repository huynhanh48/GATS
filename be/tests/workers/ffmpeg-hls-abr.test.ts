import { describe, expect, it } from 'vitest';

import { VIDEO_HLS_RENDITIONS } from '@src/models/Video.model';
import {
  buildAbrFfmpegArgs,
  buildFfprobeAudioArgs,
  FFPROBE_ANALYZEDURATION,
  FFPROBE_PROBESIZE,
  parseFfprobeAudioResult,
  shouldFallbackFromHttpProbe,
} from '@src/workers/helpers/ffmpeg-hls';
import { progressiveUploadPhase } from '@src/workers/helpers/s3-upload-folder';

describe('buildFfprobeAudioArgs', () => {
  it('includes probesize and analyzeduration bounds', () => {
    const args = buildFfprobeAudioArgs('https://cdn.example/video.mp4');
    expect(args).toContain('-probesize');
    expect(args[args.indexOf('-probesize') + 1]).toBe(FFPROBE_PROBESIZE);
    expect(args).toContain('-analyzeduration');
    expect(args[args.indexOf('-analyzeduration') + 1]).toBe(
      FFPROBE_ANALYZEDURATION,
    );
    expect(args).toContain('a:0');
    expect(args).toContain('json');
    expect(args[args.length - 1]).toBe('https://cdn.example/video.mp4');
  });
});

describe('parseFfprobeAudioResult', () => {
  it('detects an AAC audio stream from JSON output', () => {
    expect(
      parseFfprobeAudioResult(
        JSON.stringify({
          streams: [{ codec_name: 'aac', codec_type: 'audio' }],
        }),
      ),
    ).toEqual({
      hasAudio: true,
      codecName: 'aac',
      copySafe: true,
      timedOut: false,
      error: null,
    });
  });

  it('returns no audio when ffprobe reports no streams', () => {
    expect(parseFfprobeAudioResult(JSON.stringify({ streams: [] }))).toEqual({
      hasAudio: false,
      codecName: null,
      copySafe: false,
      timedOut: false,
      error: null,
    });
  });
});

describe('buildAbrFfmpegArgs', () => {
  it('builds a single ABR HLS command with re-encoded audio', () => {
    const args = buildAbrFfmpegArgs(
      'https://cdn.example/video.mp4',
      VIDEO_HLS_RENDITIONS,
      { includeAudio: true, copyAudio: false },
    );

    expect(args).toContain('-filter_complex');
    expect(args).toContain('-var_stream_map');
    expect(args).toContain('-master_pl_name');
    expect(args).toContain('index.m3u8');
    expect(args).toContain('%v/index.m3u8');
    expect(args).toContain('%v/segment_%03d.ts');

    const mapIdx = args.indexOf('-var_stream_map');
    expect(args[mapIdx + 1]).toBe(
      'v:0,a:0,name:360p v:1,a:1,name:720p v:2,a:2,name:1080p',
    );

    expect(args.filter((a) => a === 'a:0')).toHaveLength(3);
    expect(args).toContain('libx264');
    expect(args).toContain('aac');
    expect(args).toContain('800k');
    expect(args).toContain('2500k');
    expect(args).toContain('5000k');
  });

  it('uses -c:a copy when copyAudio is true', () => {
    const args = buildAbrFfmpegArgs(
      '/tmp/input.mp4',
      VIDEO_HLS_RENDITIONS,
      { includeAudio: true, copyAudio: true },
    );

    const ca = args.indexOf('-c:a');
    expect(args[ca + 1]).toBe('copy');
    expect(args).not.toContain('128k');
  });

  it('omits audio maps when includeAudio is false', () => {
    const args = buildAbrFfmpegArgs(
      '/tmp/input.mp4',
      VIDEO_HLS_RENDITIONS,
      { includeAudio: false, copyAudio: false },
    );

    expect(args).toContain('-an');
    const mapIdx = args.indexOf('-var_stream_map');
    expect(args[mapIdx + 1]).toBe(
      'v:0,name:360p v:1,name:720p v:2,name:1080p',
    );
    expect(args.filter((a) => a === 'a:0')).toHaveLength(0);
  });

  it('applies x264 preset from argument', () => {
    const args = buildAbrFfmpegArgs(
      '/tmp/input.mp4',
      VIDEO_HLS_RENDITIONS.slice(0, 1),
      { includeAudio: false, copyAudio: false },
      'ultrafast',
    );
    expect(args).toContain('ultrafast');
  });

  it('rejects an empty rendition list', () => {
    expect(() =>
      buildAbrFfmpegArgs('/tmp/in.mp4', [], {
        includeAudio: true,
        copyAudio: false,
      }),
    ).toThrow(/At least one rendition/);
  });
});

describe('shouldFallbackFromHttpProbe', () => {
  it('forces disk fallback when HTTP probe times out', () => {
    expect(
      shouldFallbackFromHttpProbe('https://cdn.example/a.mp4', {
        hasAudio: true,
        codecName: null,
        copySafe: false,
        timedOut: true,
        error: null,
      }),
    ).toBe(true);
    expect(
      shouldFallbackFromHttpProbe('/tmp/a.mp4', {
        hasAudio: true,
        codecName: null,
        copySafe: false,
        timedOut: true,
        error: null,
      }),
    ).toBe(false);
    expect(
      shouldFallbackFromHttpProbe('https://cdn.example/a.mp4', {
        hasAudio: true,
        codecName: 'aac',
        copySafe: true,
        timedOut: false,
        error: null,
      }),
    ).toBe(false);
  });
});

describe('progressiveUploadPhase', () => {
  it('uploads .ts early and playlists on finalize', () => {
    expect(progressiveUploadPhase('360p/segment_001.ts')).toBe('early');
    expect(progressiveUploadPhase('360p/index.m3u8')).toBe('finalize');
    expect(progressiveUploadPhase('index.m3u8')).toBe('finalize');
  });
});
