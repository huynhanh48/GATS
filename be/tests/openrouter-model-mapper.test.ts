import { describe, expect, it } from 'vitest';

import {
  isEligibleFreeModel,
  makeOpenRouterItemKey,
  mapOpenRouterModel,
  openRouterModelsResponseSchema,
  type OpenRouterModel,
} from '@src/services/OpenRouterModelMapper';

const freeTextModel: OpenRouterModel = {
  id: 'google/gemma-3-12b-it:free',
  name: 'Google: Gemma 3 12B (free)',
  description: 'A useful model.',
  context_length: 32768,
  supported_parameters: ['tools', 'response_format'],
  architecture: {
    input_modalities: ['text', 'image'],
    output_modalities: ['text'],
  },
};

describe('OpenRouter free model mapping', () => {
  it('accepts only concrete :free text models', () => {
    expect(isEligibleFreeModel(freeTextModel)).toBe(true);
    expect(isEligibleFreeModel({ ...freeTextModel, id: 'openrouter/free' })).toBe(false);
    expect(isEligibleFreeModel({ ...freeTextModel, id: 'google/gemma-3-12b-it' })).toBe(false);
    expect(
      isEligibleFreeModel({
        ...freeTextModel,
        architecture: { input_modalities: ['image'], output_modalities: ['image'] },
      }),
    ).toBe(false);
  });

  it('builds a stable database key no longer than 100 characters', () => {
    const shortKey = makeOpenRouterItemKey(freeTextModel.id);
    const longId = `publisher/${'very-long-model-name-'.repeat(8)}:free`;
    expect(shortKey).toBe('openrouter-google-gemma-3-12b-it-free');
    expect(makeOpenRouterItemKey(longId)).toHaveLength(100);
    expect(makeOpenRouterItemKey(longId)).toBe(makeOpenRouterItemKey(longId));
  });

  it('maps source fields and creates runnable OpenAI-compatible examples', () => {
    const mapped = mapOpenRouterModel(freeTextModel, new Date('2026-09-05T00:00:00.000Z'));
    expect(mapped.title).toBe(freeTextModel.name);
    expect(mapped.payload.provider).toBe('Google');
    expect(mapped.payload.contextWindow).toBe('32,768 tokens');
    expect(mapped.payload.features).toEqual(
      expect.arrayContaining(['Hỗ trợ gọi công cụ', 'Hỗ trợ đầu vào hình ảnh']),
    );
    expect(mapped.payload.codePython).toContain('import os');
    expect(mapped.payload.codeNode).toContain(freeTextModel.id);
    expect(mapped.payload.sync).toMatchObject({
      source: 'openrouter',
      externalId: freeTextModel.id,
      missCount: 0,
      managed: true,
    });
  });

  it('rejects malformed catalogue responses before writing to the database', () => {
    expect(() => openRouterModelsResponseSchema.parse({ data: [{ id: '' }] })).toThrow();
  });
});
