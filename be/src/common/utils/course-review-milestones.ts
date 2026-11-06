export const COURSE_REVIEW_MILESTONES = [25, 50, 75, 100] as const;

export function selectCourseReviewMilestones(input: {
  progressPercent: number;
  totalLessons: number;
  recordedMilestones: Iterable<number>;
  hasReview: boolean;
}): { selected: number | null; skipped: number[] } {
  if (input.totalLessons <= 0) return { selected: null, skipped: [] };
  const allowed =
    input.totalLessons < 4 ? [100] : [...COURSE_REVIEW_MILESTONES];
  const recorded = new Set(input.recordedMilestones);
  const eligible = allowed.filter(
    (milestone) =>
      milestone <= input.progressPercent &&
      !recorded.has(milestone) &&
      (!input.hasReview || milestone === 100),
  );
  if (eligible.length === 0) return { selected: null, skipped: [] };
  return {
    selected: eligible[eligible.length - 1] ?? null,
    skipped: eligible.slice(0, -1),
  };
}
