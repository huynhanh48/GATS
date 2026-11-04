import { z } from 'zod';

export const aiToolTypeSchema = z.enum([
  'prompt',
  'api_provider',
  'skill',
  'mcp',
  'tool',
  'stem',
]);
export const listAiToolConfigQuerySchema = z.object({
  type: aiToolTypeSchema.optional(),
  q: z.string().trim().max(100).optional(),
  pricingType: z.enum(['free', 'paid']).optional(),
  provider: z.string().trim().max(100).optional(),
  category: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  take: z.coerce.number().int().min(1).max(100).default(20),
});
const itemKeySchema = z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/);
const pricingPayloadSchema = z.object({
  description: z.string().trim().min(1),
  pricingType: z.enum(['free', 'paid']),
  price: z.number().int().min(0).default(0),
}).refine((value) => value.pricingType === 'free' || value.price > 0, {
  message: 'Paid resources require a positive price',
  path: ['price'],
});
export const updateAiToolConfigSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  isPublic: z.boolean().optional(),
  isPaid: z.boolean().optional(),
  websiteUrl: z.string().url('Link website không hợp lệ').max(1000).nullable().optional(),
  payload: z.record(z.string(), z.unknown()).nullable().optional(),
});
export const createPromptSchema = z.object({
  itemKey: z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/),
  title: z.string().trim().min(1).max(255),
  isPublic: z.boolean().default(true),
  isPaid: z.boolean().default(false),
  payload: z.record(z.string(), z.unknown()),
});
export const createApiModelSchema = z.object({
  itemKey: z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/),
  title: z.string().trim().min(1).max(255),
  isPublic: z.boolean().default(true),
  isPaid: z.boolean().default(false),
  websiteUrl: z.string().url('Link website không hợp lệ').max(1000),
  payload: pricingPayloadSchema.extend({
    provider: z.string().trim().min(1).max(100),
    category: z.string().trim().min(1).max(100),
    imageUrl: z.string().url().max(1000),
    endpointUrl: z.string().url().max(1000),
    models: z.array(z.object({
      id: z.string().trim().min(1).max(255),
      isActive: z.boolean().default(true),
    })).default([]),
  }),
});
export const createSkillSchema = z.object({
  itemKey: z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/),
  title: z.string().trim().min(1).max(255),
  isPublic: z.boolean().default(true),
  isPaid: z.boolean().default(false),
  payload: z.record(z.string(), z.unknown()).and(z.object({
    description: z.string().trim().min(1),
    category: z.string().trim().min(1).max(100),
    imageUrl: z.string().url().max(1000),
  })),
});

export const createMcpSchema = z.object({
  itemKey: itemKeySchema,
  title: z.string().trim().min(1).max(255),
  isPublic: z.boolean().default(true),
  isPaid: z.boolean().default(false),
  websiteUrl: z.string().url().max(1000).nullable().optional(),
  payload: pricingPayloadSchema.extend({
    providerType: z.enum(['gemini', 'openai', 'claude', 'custom']),
    imageUrl: z.string().url().max(1000),
    installation: z.string().trim().min(1),
  }),
});

export const createToolSchema = z.object({
  itemKey: itemKeySchema,
  title: z.string().trim().min(1).max(255),
  isPublic: z.boolean().default(true),
  isPaid: z.boolean().default(false),
  websiteUrl: z.string().url().max(1000).nullable().optional(),
  payload: pricingPayloadSchema.extend({
    provider: z.string().trim().min(1).max(100),
    imageUrl: z.string().url().max(1000),
  }),
});

export const createStemSchema = z.object({
  itemKey: itemKeySchema,
  title: z.string().trim().min(1).max(255),
  isPublic: z.boolean().default(true),
  isPaid: z.boolean().default(false),
  websiteUrl: z.string().url().max(1000).nullable().optional(),
  payload: pricingPayloadSchema.extend({
    provider: z.string().trim().min(1).max(100).default('GATS STEM Lab'),
    category: z.string().trim().min(1).max(100).default('STEM'),
    imageUrl: z.string().url().max(1000).optional().or(z.literal('')),
    level: z.string().trim().max(100).optional(),
    hardware: z.array(z.string()).default([]),
    software: z.array(z.string()).default([]),
    specifications: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  }),
});
