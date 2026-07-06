import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/section_card.dart';
import 'package:gats_academy/core/widgets/ted/ted.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';
import 'package:gats_academy/features/home/presentation/my_courses_screen.dart';
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

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TedSectionHeader(
          title: AppStrings.homeYourCourses,
          actionLabel: courses.isNotEmpty ? AppStrings.seeAll : null,
          onAction: courses.isNotEmpty
              ? () => Navigator.of(context).push(
                    MaterialPageRoute<void>(builder: (_) => const MyCoursesScreen()),
                  )
              : null,
        ),
        const SizedBox(height: AppSpacing.md),
        if (courses.isEmpty)
          SectionCard(
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
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute<void>(
                      builder: (_) => const CourseStoreScreen(),
                    ),
                  ),
                  child: Text(AppStrings.homeYourCoursesBrowse),
                ),
              ],
            ),
          )
        else
          SizedBox(
            height: 92,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: courses.length.clamp(0, 8),
              separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.md),
              itemBuilder: (context, index) {
                final course = courses[index];
                return SizedBox(
                  width: 300,
                  child: TedCourseCard(
                    course: course,
                    compact: true,
                    bookmarked: true,
                    showProgress: true,
                    onTap: () => onCourseTap(course),
                  ),
                );
              },
            ),
          ),
      ],
    );
  }
}
