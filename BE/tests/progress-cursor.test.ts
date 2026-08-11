import { describe, expect, it } from 'vitest';

describe('progress changes cursor encoding', () => {
  it('encodes compound cursor with processedAt + eventId', () => {
    const payload = {
      processedAt: '2026-07-28T10:00:00.000Z',
      eventId: '11111111-1111-4111-8111-111111111111',
      at: '2026-07-28T10:00:00.000Z',
    };
    const cursor = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const parsed = JSON.parse(
      Buffer.from(cursor, 'base64url').toString('utf8'),
    ) as typeof payload;
    expect(parsed.processedAt).toBe(payload.processedAt);
    expect(parsed.eventId).toBe(payload.eventId);
    expect(parsed.at).toBe(payload.at);
  });

  it('accepts legacy at-only cursor shape', () => {
    const legacy = Buffer.from(
      JSON.stringify({ at: '2026-07-28T10:00:00.000Z' }),
    ).toString('base64url');
    const parsed = JSON.parse(
      Buffer.from(legacy, 'base64url').toString('utf8'),
    ) as { at?: string; processedAt?: string; eventId?: string };
    const at = parsed.processedAt ?? parsed.at;
    expect(at).toBe('2026-07-28T10:00:00.000Z');
    expect(parsed.eventId).toBeUndefined();
  });
});
