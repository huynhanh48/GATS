import { z } from 'zod';

export const createAiCoachSessionSchema = z.object({
  title: z.string().optional(),
  initialMessage: z
    .object({
      text: z.string().min(1, 'Message text is required'),
      isUser: z.boolean().default(true),
    })
    .optional(),
});

export const updateAiCoachSessionSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty'),
});

export const addAiCoachMessageSchema = z.object({
  text: z.string().min(1, 'Message text is required'),
  isUser: z.boolean(),
  timestamp: z.string().datetime().optional(),
});
