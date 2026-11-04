import { describe, expect, it } from 'vitest';

import { selectCourseReviewMilestones } from '@src/common/utils/course-review-milestones';

describe('course review milestones', () => {
  it('selects crossed thresholds for an odd lesson count', () => {
    expect(selectCourseReviewMilestones({
      progressPercent: 29,
      totalLessons: 7,
      recordedMilestones: [],
      hasReview: false,
    })).toEqual({ selected: 25, skipped: [] });
  });

  it('asks only at completion for courses shorter than four lessons', () => {
    expect(selectCourseReviewMilestones({
      progressPercent: 67,
      totalLessons: 3,
      recordedMilestones: [],
      hasReview: false,
    }).selected).toBeNull();
    expect(selectCourseReviewMilestones({
      progressPercent: 100,
      totalLessons: 3,
      recordedMilestones: [],
      hasReview: false,
    }).selected).toBe(100);
  });

  it('does not repeat a milestone across devices', () => {
    expect(selectCourseReviewMilestones({
      progressPercent: 58,
      totalLessons: 7,
      recordedMilestones: [25, 50],
      hasReview: false,
    }).selected).toBeNull();
  });

  it('suppresses intermediate prompts after a review but allows 100 update', () => {
    expect(selectCourseReviewMilestones({
      progressPercent: 75,
      totalLessons: 8,
      recordedMilestones: [25],
      hasReview: true,
    }).selected).toBeNull();
    expect(selectCourseReviewMilestones({
      progressPercent: 100,
      totalLessons: 8,
      recordedMilestones: [25],
      hasReview: true,
    }).selected).toBe(100);
  });

  it('keeps only the highest prompt when progress jumps multiple thresholds', () => {
    expect(selectCourseReviewMilestones({
      progressPercent: 80,
      totalLessons: 10,
      recordedMilestones: [],
      hasReview: false,
    })).toEqual({ selected: 75, skipped: [25, 50] });
  });
});
