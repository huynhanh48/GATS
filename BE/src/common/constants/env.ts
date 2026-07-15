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
  /** Bank transfer / Sepay (same keys as Web_HuynhAnh Ecommerce) */
  BankAccountNumber: defaultStr(''),
  /** Sepay QR `bank=` query — e.g. VietinBank (name) or BIN */
  BankName: defaultStr('VietinBank'),
  BankAccountName: optionalStr,
  SepayApiKey: optionalStr,
  /** VNPay */
  VnpTmnCode: optionalStr,
  VnpHashSecret: optionalStr,
});

/******************************************************************************
                            Export default
******************************************************************************/

export default EnvVars;
