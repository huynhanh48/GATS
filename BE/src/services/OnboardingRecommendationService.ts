import type { CoursePublic } from '@src/models/Course.model';
import type { OnboardingAnswers } from '@src/models/Onboarding.model';
import * as UserRepo from '@src/repos/UserRepo';
import CourseService from '@src/services/CourseService';
import RecommendationAnalyticsService from '@src/services/RecommendationAnalyticsService';

const interestTags: Record<OnboardingAnswers['interests'][number], string[]> = {
  chatbot: ['chatbot', 'chatgpt', 'prompt-engineering', 'prompt'],
  contentWriting: ['content-writing', 'marketing', 'copywriting', 'content'],
  dataAnalysis: [
    'data-analysis',
    'excel',
    'business-intelligence',
    'analytics',
  ],
  imageGen: ['image-generation', 'midjourney', 'design', 'creative-ai'],
  automation: ['automation', 'ai-agent', 'workflow', 'agent'],
  coding: ['coding', 'programming', 'ai-coding', 'developer'],
};

const purposeCategories: Partial<
  Record<OnboardingAnswers['purpose'], string[]>
> = {
  officeWork: ['ai-office', 'office', 'productivity'],
  careerChange: ['career', 'professional-skills'],
};

const profileSignals: Partial<Record<OnboardingAnswers['profile'], string[]>> =
  {
    student: ['student', 'foundation', 'beginner'],
    officeWorker: ['ai-office', 'office', 'productivity'],
    freelancer: ['freelance', 'content', 'automation'],
  };

const motivationSignals: Record<OnboardingAnswers['motivation'], string[]> = {
  career: ['career', 'professional'],
  income: ['freelance', 'automation', 'content'],
  keepUp: ['foundation', 'ai-office', 'beginner'],
  curiosity: ['creative-ai', 'explore', 'foundation'],
};

function normalizedSignals(course: CoursePublic): Set<string> {
  return new Set(
    [
      course.category?.slug,
      ...course.tags.map((tag) => tag.slug),
      ...course.tags.map((tag) => tag.name.toLowerCase()),
    ].filter((value): value is string => Boolean(value)),
  );
}

function hasAny(signals: Set<string>, expected: string[]): boolean {
  return expected.some((value) => signals.has(value));
}

function scoreCourse(course: CoursePublic, answers: OnboardingAnswers) {
  let score = 0;
  const reasons: string[] = [];
  const signals = normalizedSignals(course);

  if (course.level === answers.level) {
    score += 4;
    reasons.push(`Phù hợp trình độ ${answers.level}`);
  }

  let interestMatches = 0;
  for (const interest of answers.interests) {
    if (hasAny(signals, interestTags[interest])) {
      interestMatches += 1;
    }
  }
  if (interestMatches > 0) {
    score += interestMatches * 3;
    reasons.push(`Khớp ${interestMatches} mối quan tâm của bạn`);
  }

  const categories = purposeCategories[answers.purpose] ?? [];
  if (categories.length > 0 && hasAny(signals, categories)) {
    score += 3;
    reasons.push('Phù hợp mục tiêu học tập');
  }

  const profiles = profileSignals[answers.profile] ?? [];
  if (profiles.length > 0 && hasAny(signals, profiles)) {
    score += 2;
    reasons.push('Phù hợp hồ sơ người học');
  }

  if (hasAny(signals, motivationSignals[answers.motivation])) {
    score += 1;
    reasons.push('Hỗ trợ động lực học tập đã chọn');
  }

  return { course, score, reasons };
}

async function recommend(answers: OnboardingAnswers, userId?: number) {
  const result = await CourseService.listPublic({
    status: 'published',
    deleted: 'without',
    skip: 0,
    take: 100,
    mode: 'offset',
  });

  const ranked = result.data
    .map((course) => scoreCourse(course, answers))
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(b.course.publishedAt ?? b.course.createdAt) -
          Number(a.course.publishedAt ?? a.course.createdAt),
    );

  const positive = ranked.filter((item) => item.score > 0);
  const recommendations = (positive.length > 0 ? positive : ranked)
    .slice(0, 3)
    .map((item, index) => ({
      ...item,
      matchPercent: Math.max(70, Math.min(98, 94 - index * 4 + item.score)),
    }));

  if (userId !== undefined) {
    await UserRepo.saveOnboarding(userId, answers);
  }

  void RecommendationAnalyticsService.trackImpressions(
    userId,
    recommendations.map((item) => item.course.id),
  ).catch(() => undefined);

  return { recommendations };
}

export default { recommend };
