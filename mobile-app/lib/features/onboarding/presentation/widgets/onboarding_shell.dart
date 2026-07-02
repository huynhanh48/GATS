import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/app_theme.dart';

class OnboardingShell extends StatelessWidget {
  const OnboardingShell({
    super.key,
    required this.child,
    this.currentStep,
    this.totalSteps,
    this.onBack,
    this.bottom,
    this.showProgress = true,
  });

  final Widget child;
  final int? currentStep;
  final int? totalSteps;
  final VoidCallback? onBack;
  final Widget? bottom;
  final bool showProgress;

  @override
  Widget build(BuildContext context) {
    final progress = (currentStep != null && totalSteps != null && totalSteps! > 0)
        ? (currentStep! + 1) / totalSteps!
        : null;

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: Column(
          children: [
            if ((showProgress && progress != null) || onBack != null)
              Padding(
                padding: const EdgeInsets.fromLTRB(AppSpacing.sm, AppSpacing.sm, AppSpacing.lg, AppSpacing.md),
                child: Row(
                  children: [
                    if (onBack != null)
                      IconButton(
                        onPressed: onBack,
                        icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
                        color: AppColors.textPrimary,
                      )
                    else
                      const SizedBox(width: 48),
                    if (showProgress && progress != null)
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.only(right: AppSpacing.xxl),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(4),
                            child: LinearProgressIndicator(
                              value: progress.clamp(0.08, 1.0),
                              minHeight: 4,
                              backgroundColor: AppColors.divider,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                      )
                    else
                      const Spacer(),
                  ],
                ),
              ),
            Expanded(child: child),
            if (bottom != null)
              Padding(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: bottom!,
              ),
          ],
        ),
      ),
    );
  }
}
