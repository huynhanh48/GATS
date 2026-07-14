import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/navigation/gats_main_navigator.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/section_card.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';
import 'package:gats_academy/features/home/presentation/my_courses_screen.dart';
import 'package:gats_academy/features/home/presentation/widgets/home_course_carousel_section.dart';
import 'package:gats_academy/features/store/presentation/course_store_screen.dart';

class YourCoursesSection extends StatelessWidget {
  const YourCoursesSection({
    super.key,
    required this.courses,
    required this.onCourseTap,
  });

  final List<CourseItem> courses;
  final ValueChanged<CourseItem> onCourseTap;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;

    return HomeCourseCarouselSection(
      title: AppStrings.homeYourCourses,
      courses: courses.take(8).toList(),
      purchased: true,
      actionLabel: courses.isNotEmpty ? AppStrings.seeAll : null,
      onAction: courses.isNotEmpty
          ? () => GatsMainNavigator.push(context, const MyCoursesScreen())
          : null,
      onCourseTap: onCourseTap,
      empty: SectionCard(
        child: Column(
          children: [
            Icon(Icons.school_outlined, size: 40, color: gats.textSecondary),
            const SizedBox(height: AppSpacing.sm),
            Text(
              AppStrings.homeYourCoursesEmpty,
              textAlign: TextAlign.center,
              style: TextStyle(color: gats.textSecondary),
            ),
            const SizedBox(height: AppSpacing.md),
            OutlinedButton(
              onPressed: () => GatsMainNavigator.push(context, const CourseStoreScreen()),
              child: Text(AppStrings.homeYourCoursesBrowse),
            ),
          ],
        ),
      ),
    );
  }
}
