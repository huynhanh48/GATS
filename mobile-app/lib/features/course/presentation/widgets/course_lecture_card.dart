import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';
import 'package:gats_academy/features/course/data/lecture_progress_store.dart';

class CourseLectureCard extends StatelessWidget {
  const CourseLectureCard({
    super.key,
    required this.lecture,
    required this.index,
    required this.state,
    required this.onTap,
  });

  final CourseLecture lecture;
  final int index;
  final LectureLearnState state;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final isCompleted = state == LectureLearnState.completed;
    final isCurrent = state == LectureLearnState.current;

    final statusLabel = switch (state) {
      LectureLearnState.completed => AppStrings.lectureStatusCompleted,
      LectureLearnState.current => AppStrings.lectureStatusCurrent,
      LectureLearnState.upcoming => AppStrings.lectureStatusUpcoming,
    };

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: isCurrent
                ? gats.lavenderAccent.withValues(alpha: 0.08)
                : gats.surface.withValues(alpha: gats.isStarry ? 0.9 : 1),
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(
              color: isCurrent
                  ? gats.lavenderAccent
                  : gats.divider.withValues(alpha: gats.isStarry ? 0.5 : 0.8),
              width: isCurrent ? 1.5 : 1,
            ),
            boxShadow: gats.isStarry || isCurrent ? null : AppShadows.card,
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: isCompleted
                      ? AppColors.success.withValues(alpha: 0.15)
                      : gats.lavenderAccent.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: isCompleted
                      ? const Icon(Icons.check_rounded, color: AppColors.success, size: 22)
                      : Text(
                          '${index + 1}',
                          style: TextStyle(
                            fontWeight: FontWeight.w800,
                            color: gats.lavenderAccent,
                          ),
                        ),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      lecture.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                        color: isCompleted ? gats.textSecondary : gats.textPrimary,
                        decoration: isCompleted ? TextDecoration.lineThrough : null,
                        decorationColor: gats.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Text(
                          '${lecture.durationMinutes} phút',
                          style: TextStyle(
                            fontSize: 12,
                            color: gats.textSecondary,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 6),
                          child: Text('·', style: TextStyle(color: gats.textSecondary)),
                        ),
                        if (isCurrent)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: gats.lavenderAccent.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(AppRadius.pill),
                            ),
                            child: Text(
                              statusLabel,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: gats.lavenderAccent,
                              ),
                            ),
                          )
                        else
                          Text(
                            statusLabel,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: gats.textSecondary,
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Icon(
                isCompleted
                    ? Icons.replay_circle_filled_outlined
                    : isCurrent
                        ? Icons.play_circle_filled_rounded
                        : Icons.play_circle_outline_rounded,
                color: isCompleted ? gats.textSecondary : gats.lavenderAccent,
                size: 32,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
