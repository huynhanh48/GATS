import path from 'path';

import {
  createPresignedDownloadUrl,
  downloadObjectToFile,
} from '@src/libs/s3-storage';

export type ResolvedOriginalInput =
  | { kind: 'http'; input: string }
  | { kind: 'file'; input: string };

export async function downloadOriginalToFile(
  key: string,
  destinationPath: string,
): Promise<void> {
  await downloadObjectToFile(key, destinationPath);
}

/** Prefer FFmpeg HTTPS input (seekable Range) — no full download first. */
export async function resolveOriginalInputHttp(
  key: string,
): Promise<ResolvedOriginalInput> {
  const input = await createPresignedDownloadUrl(key);
  return { kind: 'http', input };
}

/** Fallback: GetObject to local temp file (resume-capable; Long Van / gateway quirks). */
export async function resolveOriginalInputFile(
  key: string,
  destinationPath: string,
): Promise<ResolvedOriginalInput> {
  await downloadObjectToFile(key, destinationPath);
  return { kind: 'file', input: path.resolve(destinationPath) };
}
