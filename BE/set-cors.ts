import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config({ path: './config/.env.development' });

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

async function setCors() {
  try {
    await s3.send(new PutBucketCorsCommand({
      Bucket: process.env.S3_BUCKET,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
            AllowedOrigins: ['*'],
            ExposeHeaders: ['ETag'],
            MaxAgeSeconds: 3000
          }
        ]
      }
    }));
    console.log('CORS set successfully on Long Van S3 bucket: ' + process.env.S3_BUCKET);
  } catch(e) {
    console.error('Error setting CORS:', e);
  }
}

setCors();
