import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

async function listBucket() {
  const s3 = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  });

  try {
    const data = await s3.send(
      new ListObjectsV2Command({
        Bucket: process.env.S3_BUCKET!,
        Prefix: 'videos/hls/',
      })
    );
    const masters = data.Contents?.map(c => c.Key).filter(k => k?.endsWith('.m3u8'));
    console.log(masters);
  } catch (error) {
    console.error(error);
  }
}

listBucket();
