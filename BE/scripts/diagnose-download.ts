import 'dotenv/config';

import { GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { getS3Bucket, getS3Client } from '../src/libs/s3.client';

const KEY =
  process.argv[2] ??
  'videos/originals/7097e4f7-13a9-4af1-bb9a-3dd5574a6850/1ea90912-cae0-4808-b4d0-7d078b8ac6b1/video-test-large.mov';

function dumpError(label: string, error: unknown) {
  const err = error as {
    name?: string;
    message?: string;
    Code?: string;
    $metadata?: unknown;
    $response?: unknown;
  };
  console.error(`--- ${label} ---`);
  console.error('name   :', err.name);
  console.error('message:', err.message);
  console.error('Code   :', err.Code);
  console.error('meta   :', JSON.stringify(err.$metadata));
}

async function main() {
  const bucket = getS3Bucket();
  console.log('Bucket:', bucket);
  console.log('Key   :', KEY);

  try {
    const head = await getS3Client().send(
      new HeadObjectCommand({ Bucket: bucket, Key: KEY }),
    );
    console.log('HeadObject OK. size =', head.ContentLength);
  } catch (error) {
    dumpError('HeadObject FAILED', error);
  }

  try {
    const res = await getS3Client().send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: KEY,
        Range: 'bytes=0-1048575',
      }),
    );
    console.log('GetObject(Range) status:', res.$metadata.httpStatusCode);
    console.log('ContentRange:', res.ContentRange);
    const body = res.Body as unknown as {
      transformToByteArray: () => Promise<Uint8Array>;
    };
    const bytes = await body.transformToByteArray();
    console.log('Range download OK. bytes =', bytes.length);
  } catch (error) {
    dumpError('GetObject(Range) FAILED', error);
  }

  try {
    const res = await getS3Client().send(
      new GetObjectCommand({ Bucket: bucket, Key: KEY }),
    );
    console.log('GetObject(plain) status:', res.$metadata.httpStatusCode);
    const stream = res.Body as unknown as NodeJS.ReadableStream;
    let received = 0;
    await new Promise<void>((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => {
        received += chunk.length;
        if (received >= 5 * 1024 * 1024) {
          (stream as unknown as { destroy: () => void }).destroy();
          resolve();
        }
      });
      stream.on('end', () => resolve());
      stream.on('error', (err) => reject(err));
    });
    console.log('Plain download OK. first bytes received =', received);
  } catch (error) {
    dumpError('GetObject(plain) FAILED', error);
  }

  try {
    const url = await getSignedUrl(
      getS3Client(),
      new GetObjectCommand({ Bucket: bucket, Key: KEY }),
      { expiresIn: 3600 },
    );
    const res = await fetch(url, { headers: { Range: 'bytes=0-1048575' } });
    console.log('Presigned+Range status:', res.status);
    console.log('Content-Range:', res.headers.get('content-range'));
    const buf = await res.arrayBuffer();
    console.log('Presigned+Range bytes =', buf.byteLength);
  } catch (error) {
    dumpError('Presigned+Range FAILED', error);
  }

  process.exit(0);
}

main().catch((err: unknown) => {
  console.error('Diagnostic crashed');
  console.error(err);
  process.exit(1);
});
