import { S3Client } from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { Agent as HttpsAgent } from 'node:https';

import EnvVars from '@src/common/constants/env';

let s3Client: S3Client | undefined;
let s3BrowserClient: S3Client | undefined;

/** Connect give-up; hang at TLS/TCP must not block workers forever. */
const S3_CONNECTION_TIMEOUT_MS = 20_000;
/**
 * Idle socket timeout (Smithy): closes if no data for this long.
 * Must stay high enough for multi-GB downloads on slow links; 0 = disabled.
 * Do NOT use requestTimeout for large GetObject — that bounds total wall time.
 */
const S3_SOCKET_IDLE_TIMEOUT_MS = 120_000;

function createS3Client(endpoint: string): S3Client {
  return new S3Client({
    region: EnvVars.AwsRegion,
    endpoint,
    forcePathStyle: EnvVars.S3ForcePathStyle,
    maxAttempts: 5,
    // Compatible S3 (LongVan etc.): default SDK checksums often break signing.
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
    credentials: {
      accessKeyId: EnvVars.S3AccessKeyId,
      secretAccessKey: EnvVars.S3SecretAccessKey,
    },
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

/**
 * Endpoint used when signing URLs the browser will call.
 * Prefer S3_PUBLIC_ENDPOINT, else origin of S3_PUBLIC_BASE_URL, else S3_ENDPOINT.
 */
export function resolveS3BrowserEndpoint(): string {
  if (EnvVars.S3PublicEndpoint) {
    return EnvVars.S3PublicEndpoint.replace(/\/$/, '');
  }

  if (EnvVars.S3PublicBaseUrl) {
    try {
      return new URL(EnvVars.S3PublicBaseUrl).origin;
    } catch {
      // fall through
    }
  }

  return EnvVars.S3Endpoint.replace(/\/$/, '');
}

/** Server-side client (may be http://s3:9000 inside Docker). */
export function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = createS3Client(EnvVars.S3Endpoint);
  }
  return s3Client;
}

/**
 * Client for browser-facing presigned URLs.
 * Must use an HTTPS public host on production or browsers block mixed content.
 */
export function getS3BrowserClient(): S3Client {
  const endpoint = resolveS3BrowserEndpoint();
  if (endpoint === EnvVars.S3Endpoint.replace(/\/$/, '')) {
    return getS3Client();
  }

  if (!s3BrowserClient) {
    s3BrowserClient = createS3Client(endpoint);
  }
  return s3BrowserClient;
}

export function getS3Bucket(): string {
  return EnvVars.S3Bucket;
}

export function resetS3ClientForTests(): void {
  s3Client = undefined;
  s3BrowserClient = undefined;
}
