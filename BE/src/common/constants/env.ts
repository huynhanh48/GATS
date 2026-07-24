import jetEnv, { num, str, transform } from 'jet-env';
import tspo from 'tspo';

/******************************************************************************
                                 Constants
******************************************************************************/

// NOTE: These need to match the names of your ".env" files
export const NodeEnvs = {
  DEV: 'development',
  TEST: 'test',
  PRODUCTION: 'production',
} as const;

const optionalStr = transform(
  (v) => (typeof v === 'string' && v.length > 0 ? v : undefined),
  (v): v is string | undefined => v === undefined || typeof v === 'string',
);

const defaultNum =
  (defaultValue: number) =>
  (v: unknown, cb?: (transformedVal: number) => void): v is number => {
    const value = v === undefined || v === '' ? defaultValue : Number(v);
    cb?.(value);
    return Number.isFinite(value);
  };

const defaultStr =
  (defaultValue: string) =>
  (v: unknown, cb?: (transformedVal: string) => void): v is string => {
    const value = v === undefined || v === '' ? defaultValue : v;
    if (typeof value !== 'string') return false;
    cb?.(value);
    return true;
  };

const defaultBool =
  (defaultValue: boolean) =>
  (v: unknown, cb?: (transformedVal: boolean) => void): v is boolean => {
    const value =
      v === undefined || v === '' || v === null
        ? defaultValue
        : v === 'true' || v === true;
    cb?.(value);
    return typeof value === 'boolean';
  };

/******************************************************************************
                                 Setup
******************************************************************************/

const EnvVars = jetEnv({
  NodeEnv: (v) => tspo.isValue(NodeEnvs, v),
  Port: num,
  DatabaseUrl: str,
  JwtSecret: str,
  JwtExpiresIn: str,
  /** Parent domain for Web/Admin SSO cookies in production, e.g. `.gats.vn`. */
  AuthCookieDomain: optionalStr,
  EmailUser: str,
  EmailPassword: str,
  FrontendUrl: str,
  AppUrl: str,
  RedisUrl: str,
  VideoStorageProvider: defaultStr('s3'),
  AwsRegion: defaultStr('us-east-1'),
  S3Endpoint: str,
  S3Bucket: str,
  S3AccessKeyId: str,
  S3SecretAccessKey: str,
  S3ForcePathStyle: defaultBool(true),
  /**
   * Browser-facing S3 endpoint for presigned PUT/GET (must be HTTPS on prod).
   * Keep `S3_ENDPOINT` as the in-cluster URL (e.g. http://minio:9000) for the API/worker.
   */
  S3PublicEndpoint: optionalStr,
  S3PublicBaseUrl: optionalStr,
  MinioEndpoint: str,
  MinioAccessKey: str,
  MinioSecretKey: str,
  MinioBucketName: str,
  MinioRegion: defaultStr('us-east-1'),
  MinioForcePathStyle: defaultBool(true),
  MinioPublicBaseUrl: optionalStr,
  VideoWorkerConcurrency: defaultNum(1),
  /** BullMQ lock/stalled tuning for long video download/transcode jobs. */
  VideoWorkerLockDurationMs: defaultNum(10 * 60 * 1000),
  VideoWorkerStalledIntervalMs: defaultNum(60 * 1000),
  VideoWorkerMaxStalledCount: defaultNum(3),
  /** Parallel HLS segment uploads (progressive + finalize). */
  HlsUploadConcurrency: defaultNum(16),
  /** libx264 preset: veryfast (default) | superfast | ultrafast */
  FfmpegX264Preset: defaultStr('veryfast'),
  AdminDefaultEmail: optionalStr,
  AdminDefaultPassword: optionalStr,
  /** Inbox for consultation lead notifications (falls back to EmailUser). */
  LeadNotifyEmail: optionalStr,
  /** Bank transfer / Sepay (same keys as Web_HuynhAnh Ecommerce) */
  BankAccountNumber: defaultStr(''),
  /** Sepay QR `bank=` query — e.g. VietinBank (name) or BIN */
  BankName: defaultStr('VietinBank'),
  BankAccountName: optionalStr,
  /** Legacy my.sepay.vn API token (bank webhook poll). Prefer PG merchant creds. */
  SepayApiKey: optionalStr,
  /** SePay Payment Gateway — merchant_id (e.g. SP-LIVE-…) */
  SepayMerchantId: optionalStr,
  /** SePay Payment Gateway — secret_key (e.g. spsk_live_…) */
  SepaySecretKey: optionalStr,
  /** production | sandbox */
  SepayPgEnv: defaultStr('production'),
  /** VNPay */
  VnpTmnCode: optionalStr,
  VnpHashSecret: optionalStr,
  GoogleClientId: optionalStr,
});

const INSECURE_PRODUCTION_VALUES = new Set([
  'dev-secret-change-me-please-min-32-characters',
  'changeme',
  'admin12345',
  'minioadmin',
]);

/**
 * Fail before serving traffic when production accidentally inherits local
 * compose defaults. This intentionally does not print secret values.
 */
export function assertProductionConfiguration(): void {
  if (EnvVars.NodeEnv !== NodeEnvs.PRODUCTION) return;

  const missing: string[] = [];
  const insecure: string[] = [];
  const required = [
    ['JWT_SECRET', EnvVars.JwtSecret],
    ['EMAIL_PASSWORD', EnvVars.EmailPassword],
    ['FRONTEND_URL', EnvVars.FrontendUrl],
    ['APP_URL', EnvVars.AppUrl],
    [
      'SEPAY_MERCHANT_ID',
      EnvVars.SepayMerchantId || EnvVars.SepayApiKey,
    ],
    [
      'SEPAY_SECRET_KEY',
      EnvVars.SepaySecretKey || EnvVars.SepayApiKey,
    ],
    ['S3_ACCESS_KEY_ID', EnvVars.S3AccessKeyId],
    ['S3_SECRET_ACCESS_KEY', EnvVars.S3SecretAccessKey],
    ['MINIO_ACCESS_KEY', EnvVars.MinioAccessKey],
    ['MINIO_SECRET_KEY', EnvVars.MinioSecretKey],
  ] as const;

  for (const [name, value] of required) {
    if (!value?.trim()) missing.push(name);
    else if (INSECURE_PRODUCTION_VALUES.has(value.trim())) insecure.push(name);
  }

  if (
    EnvVars.AdminDefaultPassword &&
    INSECURE_PRODUCTION_VALUES.has(EnvVars.AdminDefaultPassword)
  ) {
    insecure.push('ADMIN_DEFAULT_PASSWORD');
  }

  if (missing.length || insecure.length) {
    const details = [
      missing.length ? `missing: ${missing.join(', ')}` : '',
      insecure.length ? `insecure defaults: ${insecure.join(', ')}` : '',
    ]
      .filter(Boolean)
      .join('; ');
    throw new Error(`Unsafe production configuration (${details})`);
  }
}

/******************************************************************************
                            Export default
******************************************************************************/

export default EnvVars;
