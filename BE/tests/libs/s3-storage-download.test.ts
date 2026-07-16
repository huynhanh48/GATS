import { access, mkdtemp, readFile, rm, writeFile } from 'fs/promises';
import { Readable } from 'stream';
import os from 'os';
import path from 'path';

import { GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockS3Send } = vi.hoisted(() => ({
  mockS3Send: vi.fn(),
}));

vi.mock('@src/libs/s3.client', () => ({
  getS3Bucket: () => 'test-bucket',
  getS3Client: () => ({ send: mockS3Send }),
}));

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn(),
}));

import {
  downloadObjectToFile,
  getDownloadPartialPaths,
} from '@src/libs/s3-storage';

function buildSourceBuffer(bytes: number): Buffer {
  const source = Buffer.allocUnsafe(bytes);
  for (let i = 0; i < source.length; i += 1) {
    source[i] = i % 251;
  }
  return source;
}

function installHeadAndGet(
  source: Buffer,
  etag = '"etag-1"',
  getObjectImpl?: (command: GetObjectCommand) => Promise<{
    Body: Readable;
    ContentLength?: number;
    ContentRange?: string;
  }>,
): void {
  mockS3Send.mockImplementation(async (command: unknown) => {
    if (command instanceof HeadObjectCommand) {
      return { ContentLength: source.length, ETag: etag };
    }
    if (command instanceof GetObjectCommand) {
      if (getObjectImpl) return getObjectImpl(command);
      return {
        Body: Readable.from([source]),
        ContentLength: source.length,
      };
    }
    throw new Error(`Unexpected S3 command: ${String(command)}`);
  });
}

function installHttpRangeResume(source: Buffer, offset: number): void {
  vi.mocked(getSignedUrl).mockResolvedValue('https://example.test/object');
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      expect(headers.get('Range')).toBe(`bytes=${offset}-`);
      const rest = source.subarray(offset);
      return new Response(rest, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${offset}-${source.length - 1}/${source.length}`,
          'Content-Length': String(rest.length),
        },
      });
    }),
  );
}

describe('downloadObjectToFile', () => {
  let tempRoot: string;
  const key = 'videos/original.mp4';

  beforeEach(async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), 's3-download-test-'));
    mockS3Send.mockReset();
    vi.mocked(getSignedUrl).mockReset();
    vi.unstubAllGlobals();
    const { partialPath, etagPath } = getDownloadPartialPaths(key);
    await rm(partialPath, { force: true }).catch(() => undefined);
    await rm(etagPath, { force: true }).catch(() => undefined);
  });

  afterEach(async () => {
    await rm(tempRoot, { force: true, recursive: true });
    const { partialPath, etagPath } = getDownloadPartialPaths(key);
    await rm(partialPath, { force: true }).catch(() => undefined);
    await rm(etagPath, { force: true }).catch(() => undefined);
    vi.unstubAllGlobals();
  });

  it('downloads via HeadObject + full GetObject (no Range)', async () => {
    const source = buildSourceBuffer(1024 * 1024 + 123);
    const destinationPath = path.join(tempRoot, 'output.mp4');
    installHeadAndGet(source);

    await downloadObjectToFile(key, destinationPath);

    const output = await readFile(destinationPath);
    expect(output.equals(source)).toBe(true);
    const commands = mockS3Send.mock.calls.map(([c]) => c);
    expect(commands.some((c) => c instanceof HeadObjectCommand)).toBe(true);
    const getObject = commands.find((c) => c instanceof GetObjectCommand) as
      | GetObjectCommand
      | undefined;
    expect(getObject?.input.Range).toBeUndefined();
    expect(getSignedUrl).not.toHaveBeenCalled();
  });

  it('resumes via HTTP Range on presigned GET when a partial file exists', async () => {
    const source = buildSourceBuffer(8 * 1024);
    const destinationPath = path.join(tempRoot, 'resumed.mp4');
    const { partialPath, etagPath } = getDownloadPartialPaths(key);
    const offset = 3000;
    await writeFile(partialPath, source.subarray(0, offset));
    await writeFile(etagPath, '"etag-1"', 'utf8');

    installHeadAndGet(source);
    installHttpRangeResume(source, offset);

    await downloadObjectToFile(key, destinationPath);

    const output = await readFile(destinationPath);
    expect(output.equals(source)).toBe(true);
    await expect(access(partialPath)).rejects.toThrow();
    expect(getSignedUrl).toHaveBeenCalled();
    // Resume must not use SDK GetObject (LongVan SignatureDoesNotMatch on Range).
    const getCalls = mockS3Send.mock.calls.filter(
      ([c]) => c instanceof GetObjectCommand,
    );
    expect(getCalls).toHaveLength(0);
  });

  it('retries HTTP Range after ECONNRESET and keeps partial bytes', async () => {
    const source = buildSourceBuffer(4096);
    const destinationPath = path.join(tempRoot, 'retried.mp4');
    const { partialPath, etagPath } = getDownloadPartialPaths(key);
    const seeded = 1500;
    await writeFile(partialPath, source.subarray(0, seeded));
    await writeFile(etagPath, '"etag-1"', 'utf8');
    let fetchCalls = 0;

    installHeadAndGet(source);
    vi.mocked(getSignedUrl).mockResolvedValue('https://example.test/object');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        fetchCalls += 1;
        if (fetchCalls === 1) {
          throw Object.assign(new Error('aborted'), { code: 'ECONNRESET' });
        }
        const onDisk = (await readFile(partialPath)).length;
        expect(onDisk).toBe(seeded);
        const rest = source.subarray(onDisk);
        return new Response(rest, {
          status: 206,
          headers: {
            'Content-Range': `bytes ${onDisk}-${source.length - 1}/${source.length}`,
          },
        });
      }),
    );

    await downloadObjectToFile(key, destinationPath);

    const output = await readFile(destinationPath);
    expect(output.equals(source)).toBe(true);
    expect(fetchCalls).toBe(2);
  });

  it('clears partial and redownloads when ETag changes', async () => {
    const source = buildSourceBuffer(2048);
    const destinationPath = path.join(tempRoot, 'etag.mp4');
    const { partialPath, etagPath } = getDownloadPartialPaths(key);
    await writeFile(partialPath, Buffer.from('stale-partial-data-xxxxx'));
    await writeFile(etagPath, '"old-etag"', 'utf8');

    installHeadAndGet(source, '"new-etag"', async (command) => {
      expect(command.input.Range).toBeUndefined();
      return {
        Body: Readable.from([source]),
        ContentLength: source.length,
      };
    });

    await downloadObjectToFile(key, destinationPath);

    const output = await readFile(destinationPath);
    expect(output.equals(source)).toBe(true);
  });

  it('removes destination and partial after exhausting incomplete downloads', async () => {
    const source = buildSourceBuffer(1024);
    const destinationPath = path.join(tempRoot, 'fail.mp4');
    installHeadAndGet(source, '"etag-1"', async () => ({
      Body: Readable.from([source.subarray(0, 100)]),
      ContentLength: 100,
    }));
    vi.mocked(getSignedUrl).mockResolvedValue('https://example.test/object');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        const rest = source.subarray(100, 150);
        return new Response(rest, {
          status: 206,
          headers: {
            'Content-Range': `bytes 100-149/${source.length}`,
          },
        });
      }),
    );

    await expect(downloadObjectToFile(key, destinationPath)).rejects.toThrow(
      /incomplete|expected|S3 download/i,
    );
    await expect(access(destinationPath)).rejects.toThrow();
    const { partialPath } = getDownloadPartialPaths(key);
    await expect(access(partialPath)).rejects.toThrow();
  });
});
