import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/ui_components.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';

/// Header học khóa — ring % + caption bài đang học, không lặp linear bar.
class CourseLearningHeader extends StatelessWidget {
  const CourseLearningHeader({
    super.key,
    required this.course,
    required this.progress,
    this.caption,
    this.metaLine,
    this.onBack,
  });

  final AppCourse course;
  final double progress;
  final String? caption;
  final String? metaLine;
  final VoidCallback? onBack;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final progressValue = progress.clamp(0.0, 1.0);
    final published = course.lectures.where((l) => l.isPublished).toList();
    final meta = metaLine ??
        AppStrings.lectureMeta(
          published.isEmpty ? course.lessonCount : published.length,
          published.isEmpty
              ? course.durationMinutes
              : published.fold<int>(0, (sum, l) => sum + l.durationMinutes),
        );

    return Material(
      color: gats.surface,
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(4, 4, 16, 12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (onBack != null)
                IconButton(
                  icon: Icon(Icons.arrow_back, color: gats.textPrimary),
                  onPressed: onBack,
                )
              else
                const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 8),
                    Text(
                      course.tag,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: gats.lavenderAccent,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      course.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                        color: gats.textPrimary,
                        height: 1.25,
                      ),
                    ),
                    if (caption != null && caption!.isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Text(
                        caption!,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: gats.textSecondary,
                        ),
                      ),
                    ],
                    const SizedBox(height: 4),
                    Text(
                      meta,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: gats.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Padding(
                padding: const EdgeInsets.only(top: 6),
                child: ProgressRing(
                  progress: progressValue,
                  size: 56,
                  strokeWidth: 5,
                  color: gats.lavenderAccent,
                  child: Text(
                    '${(progressValue * 100).round()}%',
                    style: TextStyle(
                      fontWeight: FontWeight.w800,
                      fontSize: 12,
                      color: gats.textPrimary,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
