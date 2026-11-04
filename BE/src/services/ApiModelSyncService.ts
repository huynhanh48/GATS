import { request } from 'node:https';
import { Client } from 'pg';
import { and, eq, like } from 'drizzle-orm';
import logger from 'jet-logger';

import EnvVars from '@src/common/constants/env';
import db from '@src/db';
import { aiToolConfigsTable } from '@src/db/schema/ai-tool-config';
import {
  isEligibleFreeModel,
  openRouterModelsResponseSchema,
} from '@src/services/OpenRouterModelMapper';

const OPENROUTER_MODELS_URL = 'https://openrouter.ai/api/v1/models';
const LOCK_ID = 1_846_274_011;
const MAX_RESPONSE_BYTES = 12 * 1024 * 1024;

export type ApiModelSyncResult = {
  totalFetched: number;
  freeFound: number;
  createdCount: number;
  updatedCount: number;
  unchangedCount: number;
  hiddenCount: number;
  failedCount: number;
  skippedLocked: boolean;
  durationMs: number;
};

function fetchJson(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const req = request(
      url,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'GATS-Academy-ApiModelSync/1.0',
        },
      },
      (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`OpenRouter returned HTTP ${res.statusCode ?? 0}`));
          return;
        }
        let size = 0;
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => {
          size += chunk.length;
          if (size > MAX_RESPONSE_BYTES) {
            req.destroy(new Error('OpenRouter response exceeded size limit'));
            return;
          }
          chunks.push(chunk);
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
          } catch {
            reject(new Error('OpenRouter returned invalid JSON'));
          }
        });
      },
    );
    req.setTimeout(20_000, () => req.destroy(new Error('OpenRouter request timed out')));
    req.on('error', reject);
    req.end();
  });
}

async function acquireLock(client: Client): Promise<boolean> {
  await client.connect();
  const result = await client.query<{ locked: boolean }>(
    'SELECT pg_try_advisory_lock($1) AS locked',
    [LOCK_ID],
  );
  return result.rows[0]?.locked === true;
}

async function releaseLock(client: Client): Promise<void> {
  try {
    await client.query('SELECT pg_advisory_unlock($1)', [LOCK_ID]);
  } finally {
    await client.end();
  }
}

export async function syncFreeApiModels(): Promise<ApiModelSyncResult> {
  const startedAt = Date.now();
  const lockClient = new Client({ connectionString: EnvVars.DatabaseUrl });
  let locked = false;

  const result: ApiModelSyncResult = {
    totalFetched: 0,
    freeFound: 0,
    createdCount: 0,
    updatedCount: 0,
    unchangedCount: 0,
    hiddenCount: 0,
    failedCount: 0,
    skippedLocked: false,
    durationMs: 0,
  };

  try {
    locked = await acquireLock(lockClient);
    if (!locked) {
      result.skippedLocked = true;
      return result;
    }

    const raw = openRouterModelsResponseSchema.parse(
      await fetchJson(OPENROUTER_MODELS_URL),
    );
    const eligible = raw.data.filter(isEligibleFreeModel);
    if (eligible.length === 0) {
      throw new Error('OpenRouter returned no eligible :free text models; sync aborted');
    }
    result.totalFetched = raw.data.length;
    result.freeFound = eligible.length;

    const seenAt = new Date();
    const models = eligible.map((model) => ({ id: model.id, isActive: true }));

    await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(aiToolConfigsTable)
        .where(and(eq(aiToolConfigsTable.type, 'api_provider'), eq(aiToolConfigsTable.itemKey, 'openrouter')))
        .limit(1);
      const existingPayload = existing?.payload ?? {};
      const payload = {
        description: existingPayload.description ?? 'API gateway cung cấp một endpoint thống nhất cho nhiều mô hình AI.',
        provider: 'OpenRouter',
        category: existingPayload.category ?? 'AI Gateway',
        imageUrl: existingPayload.imageUrl ?? 'https://openrouter.ai/favicon.ico',
        endpointUrl: 'https://openrouter.ai/api/v1',
        pricingType: existingPayload.pricingType ?? 'free',
        price: existingPayload.price ?? 0,
        models,
      };

      await tx
        .insert(aiToolConfigsTable)
        .values({
          type: 'api_provider',
          itemKey: 'openrouter',
          title: 'OpenRouter',
          isPublic: true,
          isPaid: existing?.isPaid ?? false,
          websiteUrl: 'https://openrouter.ai',
          payload,
        })
        .onConflictDoUpdate({
          target: [aiToolConfigsTable.type, aiToolConfigsTable.itemKey],
          set: { payload, updatedAt: seenAt },
        });

      const removed = await tx
        .delete(aiToolConfigsTable)
        .where(and(eq(aiToolConfigsTable.type, 'api_provider'), like(aiToolConfigsTable.itemKey, 'openrouter-%')))
        .returning({ id: aiToolConfigsTable.id });
      result.hiddenCount = removed.length;
      if (existing) result.updatedCount = 1;
      else result.createdCount = 1;
    });

    return result;
  } finally {
    result.durationMs = Date.now() - startedAt;
    if (locked) await releaseLock(lockClient);
    else await lockClient.end().catch(() => undefined);
  }
}

export function startApiModelSyncScheduler(): void {
  if (!EnvVars.ApiModelSyncEnabled) return;
  const scheduleNext = () => {
    const now = new Date();
    const next = new Date(now);
    const hourUtc = Math.max(0, Math.min(23, Math.trunc(EnvVars.ApiModelSyncHourUtc)));
    next.setUTCHours(hourUtc, 0, 0, 0);
    if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
    const timer = setTimeout(() => {
      void syncFreeApiModels()
        .then((summary) => logger.info(`OpenRouter free model sync: ${JSON.stringify(summary)}`))
        .catch((error) => logger.err(error, true))
        .finally(scheduleNext);
    }, next.getTime() - now.getTime());
    timer.unref();
  };
  scheduleNext();
}

export default { syncFreeApiModels, startApiModelSyncScheduler };
