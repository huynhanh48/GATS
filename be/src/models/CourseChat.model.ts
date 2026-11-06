import { z } from 'zod';

const createMessageSchema = z.object({
  content: z.string().trim().min(1).max(2000),
});

const pinMessageSchema = z.object({
  isPinned: z.boolean().default(true),
});

export type CreateCourseChatMessageInput = z.infer<
  typeof createMessageSchema
>;
export type PinCourseChatMessageInput = z.infer<typeof pinMessageSchema>;

export const parseCreateCourseChatMessage = (value: unknown) =>
  createMessageSchema.parse(value);
export const parsePinCourseChatMessage = (value: unknown) =>
  pinMessageSchema.parse(value);
