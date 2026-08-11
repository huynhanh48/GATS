import { z } from 'zod';

export const onboardingAnswersSchema = z.object({
  language: z.enum(['english', 'vietnamese']).optional(),
  referral: z
    .enum(['tiktok', 'facebook', 'youtube', 'friend', 'search', 'other'])
    .optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  profile: z.enum(['student', 'officeWorker', 'freelancer', 'other']),
  motivation: z.enum(['career', 'income', 'keepUp', 'curiosity']),
  interests: z
    .array(
      z.enum([
        'chatbot',
        'contentWriting',
        'dataAnalysis',
        'imageGen',
        'automation',
        'coding',
      ]),
    )
    .min(1)
    .max(6),
  ageRange: z.enum(['under25', 'age26to35', 'age36to45', 'above45']),
  dailyGoal: z.enum(['casual', 'regular', 'serious', 'intense']),
  purpose: z.enum([
    'officeWork',
    'skillUpgrade',
    'careerChange',
    'personalInterest',
  ]),
  dailyReminderEnabled: z.boolean().optional(),
  reminderHour: z.number().int().min(0).max(23).optional(),
  reminderMinute: z.number().int().min(0).max(59).optional(),
});

export type OnboardingAnswers = z.infer<typeof onboardingAnswersSchema>;

export function parseOnboardingAnswers(data: unknown): OnboardingAnswers {
  return onboardingAnswersSchema.parse(data);
}
