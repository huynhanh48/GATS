import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:gats_academy/core/l10n/l10n.dart';
import 'package:gats_academy/core/services/onboarding_prefs.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/illustrations/flat_vector/flat_vector.dart';

class OnboardingLoadingScreen extends StatefulWidget {
  const OnboardingLoadingScreen({
    super.key,
    required this.recommendedCourseIds,
    required this.onComplete,
  });

  final List<String> recommendedCourseIds;
  final VoidCallback onComplete;

  @override
  State<OnboardingLoadingScreen> createState() => _OnboardingLoadingScreenState();
}

class _OnboardingLoadingScreenState extends State<OnboardingLoadingScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _progressController;

  int _completedItems = 0;

  @override
  void initState() {
    super.initState();
    _progressController = AnimationController(vsync: this, duration: const Duration(seconds: 5))
      ..forward();

    _progressController.addListener(_onProgress);
    _progressController.addStatusListener(_onProgressComplete);
  }

  void _onProgress() {
    final progress = _progressController.value;
    final checklistLength = 4;
    final items = math.min(
      (progress * checklistLength).ceil(),
      checklistLength,
    );
    if (items != _completedItems && mounted) {
      setState(() => _completedItems = items);
    }
  }

  Future<void> _onProgressComplete(AnimationStatus status) async {
    if (status != AnimationStatus.completed) return;
    await OnboardingPrefs.markComplete(recommendedCourseIds: widget.recommendedCourseIds);
    if (!mounted) return;
    widget.onComplete();
  }

  @override
  void dispose() {
    _progressController.removeListener(_onProgress);
    _progressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final checklistItems = [
      l10n.loadingPersonalizing,
      l10n.loadingCourses,
      l10n.loadingFlashcards,
      l10n.loadingReady,
    ];

    return AnimatedBuilder(
      animation: _progressController,
      builder: (context, child) {
        final progress = _progressController.value;
        return Scaffold(
          backgroundColor: AppColors.primary.withValues(alpha: 0.92),
          body: SafeArea(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.xl),
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(AppSpacing.xl),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                    boxShadow: AppShadows.elevated,
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const FlatCelebrationIllustration(size: 100),
                      const SizedBox(height: AppSpacing.lg),
                      Text(
                        l10n.onboardingResultsCongratsTitle,
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      Text(
                        l10n.loadingCongratsBody,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: AppSpacing.xl),
                      ...List.generate(checklistItems.length, (index) {
                        final done = index < _completedItems;
                        return Padding(
                          padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                          child: Row(
                            children: [
                              Icon(
                                done ? Icons.check_circle_rounded : Icons.radio_button_unchecked,
                                color: done ? AppColors.primary : AppColors.divider,
                                size: 20,
                              ),
                              const SizedBox(width: AppSpacing.sm),
                              Expanded(
                                child: Text(
                                  checklistItems[index],
                                  style: TextStyle(
                                    color: done ? AppColors.textPrimary : AppColors.textSecondary,
                                    fontWeight: done ? FontWeight.w600 : FontWeight.w400,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      }),
                      const SizedBox(height: AppSpacing.lg),
                      SizedBox(
                        width: 48,
                        height: 48,
                        child: CircularProgressIndicator(
                          value: progress,
                          strokeWidth: 4,
                          color: AppColors.primary,
                          backgroundColor: AppColors.chipInactive,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
