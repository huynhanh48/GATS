// Tạo bucket + policy public-read cho S3 trong container dev.
// Chạy bằng node; dùng @aws-sdk của be (không cần cài thêm gì).
const resolveFrom = (name) =>
  require(require.resolve(name, { paths: ['/app/be/node_modules'] }));

const {
  S3Client,
  CreateBucketCommand,
  PutBucketPolicyCommand,
  HeadBucketCommand,
} = resolveFrom('@aws-sdk/client-s3');

const ENDPOINT = process.env.S3_INTERNAL_ENDPOINT || 'http://127.0.0.1:9010';
const VIDEO_BUCKET = 's3-video-gats';
const FILE_BUCKET = 'files-gats';

const client = new S3Client({
  region: 'us-east-1',
  endpoint: ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.RUSTFS_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.RUSTFS_SECRET_KEY || 'minioadmin',
  },
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForS3(attempts = 60) {
  for (let i = 1; i <= attempts; i += 1) {
    try {
      await client.send(new HeadBucketCommand({ Bucket: FILE_BUCKET }));
      return;
    } catch (err) {
      // Có response HTTP (kể cả 404 NotFound) nghĩa là S3 đã lên.
      if (err.$metadata?.httpStatusCode) return;
      await sleep(1000);
    }
  }
  throw new Error(`S3 chưa sẵn sàng sau ${attempts}s (${ENDPOINT})`);
}

async function ensureBucket(bucket) {
  try {
    await client.send(new CreateBucketCommand({ Bucket: bucket }));
    console.log(`[dev] created bucket ${bucket}`);
  } catch (err) {
    if (err.name === 'BucketAlreadyOwnedByYou' || err.name === 'BucketAlreadyExists') return;
    throw err;
  }
}

async function main() {
  await waitForS3();
  await ensureBucket(VIDEO_BUCKET);
  await ensureBucket(FILE_BUCKET);
  await client.send(
    new PutBucketPolicyCommand({
      Bucket: FILE_BUCKET,
      Policy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'PublicRead',
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${FILE_BUCKET}/*`],
          },
        ],
      }),
    }),
  );
  console.log('[dev] s3 buckets ready');
}

main().catch((err) => {
  console.error('[dev] s3 init failed:', err.message);
  process.exit(1);
});
