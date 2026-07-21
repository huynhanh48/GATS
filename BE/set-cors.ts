/**
 * Apply CORS on the LongVan (S3-compatible) video bucket so browsers on
 * gats.vn / admin.gats.vn can:
 *   - PUT multipart upload parts (admin)
 *   - GET HLS playlists + .ts segments (web-app via hls.js)
 *
 * Run from BE/:
 *   npx ts-node set-cors.ts
 * or with env already loaded:
 *   node -r dotenv/config -r ts-node/register set-cors.ts dotenv_config_path=./config/.env.development
 */
import { PutBucketCorsCommand, S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config({ path: './config/.env.development' });

const endpoint = process.env.S3_ENDPOINT;
const bucket = process.env.S3_BUCKET;
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
  console.error(
    'Missing S3_ENDPOINT / S3_BUCKET / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY',
  );
  process.exit(1);
}

const s3 = new S3Client({
  endpoint,
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
});

const ALLOWED_ORIGINS = [
  'https://gats.vn',
  'https://www.gats.vn',
  'https://admin.gats.vn',
  'http://localhost:3005',
  'http://127.0.0.1:3005',
  'http://localhost:9000',
  'http://127.0.0.1:9000',
  'http://localhost:9100',
  'http://127.0.0.1:9100',
];

async function setCors() {
  await s3.send(
    new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
            AllowedOrigins: ALLOWED_ORIGINS,
            ExposeHeaders: ['ETag', 'Content-Length', 'Content-Range', 'Accept-Ranges'],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    }),
  );
  console.log(`CORS set on ${bucket} @ ${endpoint}`);
  console.log('Origins:', ALLOWED_ORIGINS.join(', '));
}

setCors().catch((e) => {
  console.error('Error setting CORS:', e);
  process.exit(1);
});
