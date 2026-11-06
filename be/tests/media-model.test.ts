import { describe, expect, it } from 'vitest';

import {
  ALLOWED_IMAGE_CONTENT_TYPES,
  ensureFilenameExtension,
  MAX_IMAGE_UPLOAD_BYTES,
  resolveMimeTypeFromFilename,
  sanitizeFilename,
} from '@src/models/Media.model';

describe('sanitizeFilename', () => {
  it('preserves Vietnamese characters in uploaded filenames', () => {
    expect(sanitizeFilename('Logo mẫu bản 1.zip')).toBe('Logo mẫu bản 1.zip');
  });

  it('removes path traversal and replaces unsafe filename characters', () => {
    expect(sanitizeFilename('../../Tài liệu: bản 1?.zip')).toBe(
      'Tài liệu_ bản 1_.zip',
    );
  });
});

describe('image upload configuration', () => {
  it('accepts SVG thumbnails up to 30 MB', () => {
    expect(ALLOWED_IMAGE_CONTENT_TYPES).toContain('image/svg+xml');
    expect(MAX_IMAGE_UPLOAD_BYTES).toBe(30 * 1024 * 1024);
  });

  it('accepts mobile photo formats including HEIC, HEIF, and AVIF', () => {
    expect(ALLOWED_IMAGE_CONTENT_TYPES).toContain('image/heic');
    expect(ALLOWED_IMAGE_CONTENT_TYPES).toContain('image/heif');
    expect(ALLOWED_IMAGE_CONTENT_TYPES).toContain('image/avif');
    expect(ALLOWED_IMAGE_CONTENT_TYPES).toContain('image/jpeg');
    expect(ALLOWED_IMAGE_CONTENT_TYPES).toContain('image/png');
  });

  it('resolves image MIME type from filename extension for mobile uploads', () => {
    expect(resolveMimeTypeFromFilename('photo.HEIC', 'thumbnail')).toBe(
      'image/heic',
    );
    expect(resolveMimeTypeFromFilename('avatar.jpg', 'thumbnail')).toBe(
      'image/jpeg',
    );
    expect(resolveMimeTypeFromFilename('image.png', 'thumbnail')).toBe(
      'image/png',
    );
    expect(resolveMimeTypeFromFilename('image.webp', 'thumbnail')).toBe(
      'image/webp',
    );
  });

  it('ensures proper extension when filename lacks one', () => {
    expect(ensureFilenameExtension('image_picker_123', 'image/jpeg')).toBe(
      'image_picker_123.jpg',
    );
    expect(ensureFilenameExtension('photo', 'image/png')).toBe('photo.png');
    expect(ensureFilenameExtension('already.heic', 'image/heic')).toBe(
      'already.heic',
    );
  });
});
