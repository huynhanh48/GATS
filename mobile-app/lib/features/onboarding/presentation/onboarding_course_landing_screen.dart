import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/ui_components.dart';
import 'package:gats_academy/data/mock/mock_course_l10n.dart';
import 'package:gats_academy/data/mock/mock_course_landing.dart';
import 'package:gats_academy/core/l10n/l10n.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';
import 'package:gats_academy/features/course/course_module.dart';
import 'package:gats_academy/features/course/navigation/course_navigator.dart';
import 'package:gats_academy/features/course/presentation/widgets/course_action_bar.dart';
import 'package:gats_academy/features/onboarding/presentation/widgets/course_landing_preview.dart';
import 'package:gats_academy/features/store/presentation/cart_screen.dart';

/// Màn giới thiệu khóa học kiểu landing page — mở từ kết quả onboarding.
class OnboardingCourseLandingScreen extends StatefulWidget {
  const OnboardingCourseLandingScreen({
    super.key,
    required this.course,
    this.matchPercent,
  });

  final CourseItem course;
  final int? matchPercent;

  @override
  State<OnboardingCourseLandingScreen> createState() => _OnboardingCourseLandingScreenState();
}

class _OnboardingCourseLandingScreenState extends State<OnboardingCourseLandingScreen> {
  String? _userId;
  bool _enrolled = false;

  @override
  void initState() {
    super.initState();
    _loadUser();
    CourseModule.repository.addListener(_onChanged);
  }

  Future<void> _loadUser() async {
    final user = await AuthPrefs.currentUser();
    if (!mounted) return;
    setState(() {
      _userId = user?.id;
      _enrolled = CourseModule.repository.isEnrolled(widget.course.id, _userId);
    });
  }

  void _onChanged() {
    if (!mounted) return;
    setState(() => _enrolled = CourseModule.repository.isEnrolled(widget.course.id, _userId));
  }

  @override
  void dispose() {
    CourseModule.repository.removeListener(_onChanged);
    super.dispose();
  }

  Future<void> _enrollAndOpen() async {
    final userId = _userId;
    if (userId == null) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(AppStrings.courseLoginToEnroll)),
      );
      return;
    }
    final ok =
        await CourseModule.repository.enrollFree(widget.course.id, userId);
    if (!mounted) return;
    if (!ok) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đăng ký thất bại. Vui lòng thử lại.')),
      );
      return;
    }
    await CourseNavigator.open(
      context,
      courseId: widget.course.id,
      mode: CourseOpenMode.learn,
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final languageCode = Localizations.localeOf(context).languageCode;
    final landing = MockCourseLanding.forCourse(widget.course.id, languageCode: languageCode);
    final title = MockCourseL10n.title(widget.course, l10n);
    final appCourse = CourseModule.repository.getCourse(widget.course.id);

    return Scaffold(
      appBar: AppBar(
        title: Text(title, maxLines: 1, overflow: TextOverflow.ellipsis),
      ),
      body: Stack(
        children: [
          ListView(
            padding: const EdgeInsets.only(bottom: 100),
            children: [
              CourseCover(
                title: title,
                seed: widget.course.id.hashCode,
                subtitle: MockCourseL10n.tag(widget.course, l10n),
                matchBadge: widget.matchPercent != null ? l10n.onboardingMatchBadge(widget.matchPercent!) : null,
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
                        MockCourseL10n.description(widget.course, l10n),
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
          if (appCourse != null)
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: CourseActionBar(
                course: appCourse,
                isEnrolled: _enrolled,
                onContinue: () => CourseNavigator.open(
                  context,
                  courseId: widget.course.id,
                  mode: CourseOpenMode.learn,
                ),
                onEnrollFree: _enrollAndOpen,
                onViewCart: () => openCart(context),
              ),
            ),
        ],
      ),
    );
  }
}
