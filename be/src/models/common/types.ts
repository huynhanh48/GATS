import { z } from 'zod';

export const authUserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  roles: z.array(z.string()),
  sessionId: z.string().uuid().optional(),
});

export type AuthUser = z.infer<typeof authUserSchema>;

export function parseAuthUser(data: unknown): AuthUser {
  return authUserSchema.parse(data);
}
