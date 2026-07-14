import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';
import 'package:gats_academy/features/course/data/lecture_progress_store.dart';

class LecturePreviewSheet extends StatelessWidget {
  const LecturePreviewSheet({
    super.key,
    required this.lecture,
    required this.index,
    required this.total,
    required this.state,
    required this.onMarkComplete,
  });

  final CourseLecture lecture;
  final int index;
  final int total;
  final LectureLearnState state;
  final Future<void> Function() onMarkComplete;

  static Future<void> show(
    BuildContext context, {
    required CourseLecture lecture,
    required int index,
    required int total,
    required LectureLearnState state,
    required Future<void> Function() onMarkComplete,
  }) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => LecturePreviewSheet(
        lecture: lecture,
        index: index,
        total: total,
        state: state,
        onMarkComplete: onMarkComplete,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final bottom = MediaQuery.paddingOf(context).bottom;
    final isCompleted = state == LectureLearnState.completed;

    return Container(
      decoration: BoxDecoration(
        color: gats.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
      padding: EdgeInsets.fromLTRB(AppSpacing.xl, AppSpacing.lg, AppSpacing.xl, bottom + AppSpacing.lg),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: gats.divider,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(
            AppStrings.lectureLessonOf(index + 1, total),
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: gats.lavenderAccent,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            lecture.title,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: gats.textPrimary,
              height: 1.25,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            '${lecture.durationMinutes} phút',
            style: TextStyle(
              fontSize: 14,
              color: gats.textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: gats.background,
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border.all(color: gats.divider.withValues(alpha: 0.7)),
            ),
            child: Row(
              children: [
                Icon(Icons.info_outline_rounded, color: gats.lavenderAccent, size: 20),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(
                    AppStrings.lecturePlayerSoon,
                    style: TextStyle(
                      fontSize: 13,
                      color: gats.textSecondary,
                      height: 1.35,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          SizedBox(
            height: 52,
            child: FilledButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(AppStrings.comingSoon)),
                );
              },
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppRadius.pill),
                ),
              ),
              child: Text(AppStrings.lectureStartLearning),
            ),
          ),
          if (!isCompleted) ...[
            const SizedBox(height: AppSpacing.md),
            SizedBox(
              height: 52,
              child: OutlinedButton(
                onPressed: () async {
                  await onMarkComplete();
                  if (!context.mounted) return;
                  Navigator.of(context).pop();
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(AppStrings.lectureMarkedDone)),
                  );
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: gats.lavenderAccent,
                  side: BorderSide(color: gats.lavenderAccent),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppRadius.pill),
                  ),
                ),
                child: Text(AppStrings.lectureMarkComplete),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
