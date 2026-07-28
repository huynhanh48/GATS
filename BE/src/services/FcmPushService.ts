import { GoogleAuth } from 'google-auth-library';

import EnvVars from '@src/common/constants/env';

type FcmMessage = {
  token: string;
  title: string;
  body?: string | null;
  deepLink?: string | null;
};

let cachedAuth: GoogleAuth | null = null;
let cachedProjectId: string | null = null;

function loadServiceAccount(): {
  auth: GoogleAuth;
  projectId: string;
} | null {
  const raw = EnvVars.FcmServiceAccountJson;
  if (!raw) return null;
  try {
    const credentials = JSON.parse(raw) as {
      project_id?: string;
      client_email?: string;
      private_key?: string;
    };
    const projectId =
      EnvVars.FcmProjectId || credentials.project_id || '';
    if (!projectId || !credentials.client_email || !credentials.private_key) {
      return null;
    }
    if (!cachedAuth) {
      cachedAuth = new GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
      });
      cachedProjectId = projectId;
    }
    return { auth: cachedAuth, projectId: cachedProjectId! };
  } catch {
    return null;
  }
}

export function isFcmConfigured(): boolean {
  return loadServiceAccount() != null;
}

/**
 * Send via FCM HTTP v1. Returns { ok, invalidToken }.
 * When FCM is not configured, returns ok=true (dev stub path).
 */
export async function sendPush(
  message: FcmMessage,
): Promise<{ ok: boolean; invalidToken?: boolean; error?: string }> {
  const cfg = loadServiceAccount();
  if (!cfg) {
    return { ok: true };
  }

  try {
    const client = await cfg.auth.getClient();
    const accessToken = await client.getAccessToken();
    const token =
      typeof accessToken === 'string' ? accessToken : accessToken?.token;
    if (!token) {
      return { ok: false, error: 'No FCM access token' };
    }

    const url = `https://fcm.googleapis.com/v1/projects/${cfg.projectId}/messages:send`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          token: message.token,
          notification: {
            title: message.title,
            body: message.body ?? undefined,
          },
          data: message.deepLink
            ? { deepLink: message.deepLink }
            : undefined,
        },
      }),
    });

    if (res.ok) return { ok: true };

    const text = await res.text();
    const invalid =
      res.status === 404 ||
      text.includes('UNREGISTERED') ||
      text.includes('INVALID_ARGUMENT');
    return { ok: false, invalidToken: invalid, error: text.slice(0, 500) };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export default { isFcmConfigured, sendPush };
