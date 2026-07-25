import { describe, expect, it } from 'vitest';

import {
  buildAudioFlacKey,
  buildAudioPrefix,
  buildHlsPlaylistKey,
} from '@src/models/Video.model';
import { buildExtractFlacArgs } from '@src/workers/helpers/ffmpeg-audio';

describe('dual-output media keys', () => {
  it('builds distinct HLS and FLAC keys', () => {
    const courseId = '11111111-1111-1111-1111-111111111111';
    const videoId = '22222222-2222-2222-2222-222222222222';
    expect(buildHlsPlaylistKey(courseId, videoId)).toBe(
      `videos/hls/${courseId}/${videoId}/index.m3u8`,
    );
    expect(buildAudioPrefix(courseId, videoId)).toBe(
      `videos/audio/${courseId}/${videoId}`,
    );
    expect(buildAudioFlacKey(courseId, videoId)).toBe(
      `videos/audio/${courseId}/${videoId}/audio.flac`,
    );
  });
});

describe('ffmpeg FLAC argv', () => {
  it('builds lossless extract command without video', () => {
    expect(buildExtractFlacArgs('/in.mp4', '/out/audio.flac')).toEqual([
      '-y',
      '-i',
      '/in.mp4',
      '-vn',
      '-c:a',
      'flac',
      '/out/audio.flac',
    ]);
  });
});
