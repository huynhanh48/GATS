import { S3Client } from '@aws-sdk/client-s3';

import EnvVars from '@src/common/constants/env';

let minioClient: S3Client | undefined;

export function getMinioClient(): S3Client {
  if (!minioClient) {
    minioClient = new S3Client({
      region: EnvVars.MinioRegion,
      endpoint: EnvVars.MinioEndpoint,
      forcePathStyle: EnvVars.MinioForcePathStyle,
      maxAttempts: 5,
      credentials: {
        accessKeyId: EnvVars.MinioAccessKey,
        secretAccessKey: EnvVars.MinioSecretKey,
      },
    });
  }
  return minioClient;
}

export function getMinioBucket(): string {
  return EnvVars.MinioBucketName;
}

export function resetMinioClientForTests(): void {
  minioClient = undefined;
}
