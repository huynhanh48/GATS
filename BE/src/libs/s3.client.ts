import { S3Client } from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { Agent as HttpsAgent } from 'node:https';

import EnvVars from '@src/common/constants/env';

let s3Client: S3Client | undefined;

/** Connect give-up; hang at TLS/TCP must not block workers forever. */
const S3_CONNECTION_TIMEOUT_MS = 20_000;
/**
 * Idle socket timeout (Smithy): closes if no data for this long.
 * Must stay high enough for multi-GB downloads on slow links; 0 = disabled.
 * Do NOT use requestTimeout for large GetObject — that bounds total wall time.
 */
const S3_SOCKET_IDLE_TIMEOUT_MS = 120_000;

export function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: EnvVars.AwsRegion,
      endpoint: EnvVars.S3Endpoint,
      forcePathStyle: EnvVars.S3ForcePathStyle,
      maxAttempts: 5,
      // Compatible S3 (LongVan etc.): default SDK checksums often break signing.
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
      credentials: {
        accessKeyId: EnvVars.S3AccessKeyId,
        secretAccessKey: EnvVars.S3SecretAccessKey,
      },
      // Context7 /aws/aws-sdk-js-v3 CLIENTS.md + NodeHttpHandlerOptions:
      // connectionTimeout / socketTimeout / requestTimeout(0 for large streams).
      requestHandler: new NodeHttpHandler({
        connectionTimeout: S3_CONNECTION_TIMEOUT_MS,
        socketTimeout: S3_SOCKET_IDLE_TIMEOUT_MS,
        requestTimeout: 0,
        httpsAgent: new HttpsAgent({
          keepAlive: true,
          maxSockets: 50,
        }),
      }),
    });
  }
  return s3Client;
}

export function getS3Bucket(): string {
  return EnvVars.S3Bucket;
}

export function resetS3ClientForTests(): void {
  s3Client = undefined;
}
