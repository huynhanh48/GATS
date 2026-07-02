import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/l10n/l10n.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/section_card.dart';
import 'package:gats_academy/core/widgets/ui_components.dart';
import 'package:gats_academy/data/mock/mock_course_l10n.dart';
import 'package:gats_academy/data/mock/mock_data.dart';
import 'package:gats_academy/core/widgets/illustrations/flat_vector/flat_vector.dart';
import 'package:gats_academy/features/onboarding/presentation/onboarding_course_landing_screen.dart';
import 'package:gats_academy/features/onboarding/presentation/widgets/onboarding_shell.dart';
import 'package:gats_academy/features/store/presentation/course_store_screen.dart';

class OnboardingResultsScreen extends StatefulWidget {
  const OnboardingResultsScreen({
    super.key,
    required this.courses,
    required this.onContinue,
    required this.onBack,
  });

  final List<CourseItem> courses;
  final VoidCallback onContinue;
  final VoidCallback onBack;

  @override
  State<OnboardingResultsScreen> createState() => _OnboardingResultsScreenState();
}

class _OnboardingResultsScreenState extends State<OnboardingResultsScreen> {
  int _visibleCount = 0;

  @override
  void initState() {
    super.initState();
    _revealCards();
  }

  Future<void> _revealCards() async {
    for (var i = 0; i < widget.courses.length; i++) {
      await Future<void>.delayed(const Duration(milliseconds: 300));
      if (!mounted) return;
      setState(() => _visibleCount = i + 1);
    }
  }

  int _matchScore(int index) => 92 - (index * 4);

  void _openCourseLanding(CourseItem course, int index) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => OnboardingCourseLandingScreen(
          course: course,
          matchPercent: _matchScore(index),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return OnboardingShell(
      showProgress: false,
      onBack: widget.onBack,
      bottom: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextButton(
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute<void>(builder: (_) => const CourseStoreScreen()),
              );
            },
            child: Text(AppStrings.onboardingBrowseMoreCourses),
          ),
          const SizedBox(height: AppSpacing.sm),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: widget.onContinue,
              child: Text(l10n.onboardingNext),
            ),
          ),
        ],
      ),
      child: ListView(
        padding: const EdgeInsets.only(bottom: AppSpacing.lg),
        children: [
          const SizedBox(height: AppSpacing.md),
          SectionCard(
            child: Column(
              children: [
                const FlatCelebrationIllustration(size: 88),
                const SizedBox(height: AppSpacing.md),
                Text(
                  l10n.onboardingResultsCongratsTitle,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  l10n.onboardingCoachResult,
                  style: Theme.of(context).textTheme.bodySmall,
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            child: Text(
              l10n.onboardingResultHeadline(widget.courses.length),
              style: Theme.of(context).textTheme.headlineSmall,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            child: Text(l10n.onboardingResultSubtitle, style: Theme.of(context).textTheme.bodySmall),
          ),
          const SizedBox(height: AppSpacing.lg),
          ...List.generate(widget.courses.length, (index) {
            final course = widget.courses[index];
            final visible = index < _visibleCount;
            final matchScore = _matchScore(index);

            return AnimatedOpacity(
              opacity: visible ? 1 : 0,
              duration: const Duration(milliseconds: 300),
              child: AnimatedSlide(
                offset: visible ? Offset.zero : const Offset(0, 0.1),
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeOutCubic,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(AppSpacing.lg, 0, AppSpacing.lg, AppSpacing.md),
                  child: SectionCard(
                    padding: EdgeInsets.zero,
                    child: Material(
                      color: Colors.transparent,
                      child: InkWell(
                        borderRadius: BorderRadius.circular(AppRadius.md),
                        onTap: () => _openCourseLanding(course, index),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            CourseCover(
                              title: MockCourseL10n.title(course, l10n),
                              seed: course.id.hashCode,
                              subtitle: MockCourseL10n.tag(course, l10n),
                              matchBadge: l10n.onboardingMatchBadge(matchScore),
                            ),
                            Padding(
                              padding: const EdgeInsets.all(AppSpacing.lg),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Expanded(
                                    child: Text(
                                      MockCourseL10n.description(course, l10n),
                                      style: Theme.of(context).textTheme.bodySmall?.copyWith(height: 1.45),
                                    ),
                                  ),
                                  const SizedBox(width: AppSpacing.sm),
                                  const Icon(Icons.chevron_right, color: AppColors.textSecondary),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}
