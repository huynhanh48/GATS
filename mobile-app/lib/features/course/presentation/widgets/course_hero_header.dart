import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/ui_components.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';

class CourseHeroHeader extends StatelessWidget {
  const CourseHeroHeader({
    super.key,
    required this.course,
    this.progress = 0,
    this.showProgress = false,
    this.onBack,
    this.trailing,
  });

  final AppCourse course;
  final double progress;
  final bool showProgress;
  final VoidCallback? onBack;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;

    return Stack(
      children: [
        CourseCover(
          title: course.title,
          seed: course.title.hashCode,
          height: 160,
          subtitle: course.tag,
        ),
        if (onBack != null)
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: IconButton(
                icon: Icon(Icons.arrow_back, color: gats.isStarry ? Colors.white : Colors.black87),
                onPressed: onBack,
              ),
            ),
          ),
        if (trailing != null)
          SafeArea(
            child: Align(
              alignment: Alignment.topRight,
              child: Padding(
                padding: const EdgeInsets.only(right: 4),
                child: trailing,
              ),
            ),
          ),
      ],
    );
  }
}
