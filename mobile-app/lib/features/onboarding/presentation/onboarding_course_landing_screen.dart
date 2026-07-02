import 'package:flutter/material.dart';
import 'package:gats_academy/core/l10n/l10n.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/ui_components.dart';
import 'package:gats_academy/data/mock/mock_course_l10n.dart';
import 'package:gats_academy/data/mock/mock_course_landing.dart';
import 'package:gats_academy/data/mock/mock_data.dart';
import 'package:gats_academy/features/onboarding/presentation/widgets/course_landing_preview.dart';

/// Màn giới thiệu khóa học kiểu landing page — mở từ kết quả onboarding.
class OnboardingCourseLandingScreen extends StatelessWidget {
  const OnboardingCourseLandingScreen({
    super.key,
    required this.course,
    this.matchPercent,
  });

  final CourseItem course;
  final int? matchPercent;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final languageCode = Localizations.localeOf(context).languageCode;
    final landing = MockCourseLanding.forCourse(course.id, languageCode: languageCode);
    final title = MockCourseL10n.title(course, l10n);

    return Scaffold(
      appBar: AppBar(
        title: Text(title, maxLines: 1, overflow: TextOverflow.ellipsis),
      ),
      body: ListView(
        padding: const EdgeInsets.only(bottom: AppSpacing.xxl),
        children: [
          CourseCover(
            title: title,
            seed: course.id.hashCode,
            subtitle: MockCourseL10n.tag(course, l10n),
            matchBadge: matchPercent != null ? l10n.onboardingMatchBadge(matchPercent!) : null,
            height: 112,
          ),
          Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (landing != null) ...[
                  Text(
                    landing.subtitle,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                          height: 1.35,
                        ),
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  CourseLandingPreview(landing: landing),
                ] else ...[
                  Text(
                    MockCourseL10n.description(course, l10n),
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
