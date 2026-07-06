import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/ui_components.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';

/// Header gọn khi đang học — không hiển thị cover/giới thiệu.
class CourseLearningHeader extends StatelessWidget {
  const CourseLearningHeader({
    super.key,
    required this.course,
    required this.progress,
    this.onBack,
  });

  final AppCourse course;
  final double progress;
  final VoidCallback? onBack;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final progressValue = progress.clamp(0.0, 1.0);

    return Material(
      color: gats.surface,
      child: SafeArea(
        bottom: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(4, 4, 12, 8),
              child: Row(
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
                        Text(
                          course.tag,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: gats.lavenderAccent,
                          ),
                        ),
                        Text(
                          course.title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: gats.textPrimary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  ProgressRing(
                    progress: progressValue,
                    size: 44,
                    strokeWidth: 4,
                    color: gats.lavenderAccent,
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: progressValue,
                  minHeight: 4,
                  backgroundColor: gats.divider,
                  color: gats.lavenderAccent,
                ),
              ),
            ),
            Divider(height: 1, color: gats.divider.withValues(alpha: 0.5)),
          ],
        ),
      ),
    );
  }
}
