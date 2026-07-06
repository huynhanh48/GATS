import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';

class CourseMetaRow extends StatelessWidget {
  const CourseMetaRow({
    super.key,
    required this.course,
    this.rating = 4.8,
    this.reviewCount,
  });

  final AppCourse course;
  final double rating;
  final int? reviewCount;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final lectureCount = course.lectures.where((l) => l.isPublished).length;
    final hours = (course.durationMinutes / 60).toStringAsFixed(1);
    final durationLabel = AppStrings.storeHoursOfLearning.replaceFirst('%d', hours);

    return Wrap(
      spacing: 16,
      runSpacing: 8,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        _MetaChip(
          icon: Icons.star_rounded,
          iconColor: gats.lavenderAccent,
          label: rating.toStringAsFixed(1),
          suffix: reviewCount != null ? ' ($reviewCount)' : null,
          textColor: gats.textPrimary,
        ),
        _MetaChip(
          icon: Icons.schedule_outlined,
          iconColor: gats.textSecondary,
          label: durationLabel,
          textColor: gats.textSecondary,
        ),
        _MetaChip(
          icon: Icons.play_circle_outline,
          iconColor: gats.textSecondary,
          label: AppStrings.courseLessonsCount.replaceFirst('%d', '$lectureCount'),
          textColor: gats.textSecondary,
        ),
      ],
    );
  }
}

class _MetaChip extends StatelessWidget {
  const _MetaChip({
    required this.icon,
    required this.iconColor,
    required this.label,
    this.suffix,
    required this.textColor,
  });

  final IconData icon;
  final Color iconColor;
  final String label;
  final String? suffix;
  final Color textColor;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: iconColor),
        const SizedBox(width: 4),
        Text(
          '$label${suffix ?? ''}',
          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: textColor),
        ),
      ],
    );
  }
}
