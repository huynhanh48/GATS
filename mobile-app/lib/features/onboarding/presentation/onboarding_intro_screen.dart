import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_assets.dart';
import 'package:gats_academy/core/l10n/l10n.dart';
import 'package:gats_academy/core/theme/app_theme.dart';

/// Intro onboarding kiểu Brilliant screen 2 — coach + bubble trước quiz.
class OnboardingIntroScreen extends StatelessWidget {
  const OnboardingIntroScreen({
    super.key,
    required this.onContinue,
    required this.onBack,
  });

  final VoidCallback onContinue;
  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final gats = context.gatsColors;

    return Scaffold(
      backgroundColor: gats.background,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(AppSpacing.sm, AppSpacing.sm, AppSpacing.lg, 0),
              child: Row(
                children: [
                  IconButton(
                    onPressed: onBack,
                    icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
                    color: AppColors.textPrimary,
                  ),
                  const Expanded(
                    child: Padding(
                      padding: EdgeInsets.only(right: AppSpacing.xxl),
                      child: LinearProgressIndicator(
                        value: 0.08,
                        minHeight: 4,
                        borderRadius: BorderRadius.all(Radius.circular(4)),
                        backgroundColor: AppColors.divider,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const Spacer(),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
              child: Container(
                padding: const EdgeInsets.all(AppSpacing.lg),
                decoration: BoxDecoration(
                  color: AppColors.accent.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  border: Border.all(color: AppColors.accent.withValues(alpha: 0.35)),
                ),
                child: Text(
                  l10n.onboardingIntroCoach,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w800,
                        height: 1.35,
                      ),
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
            Expanded(
              flex: 3,
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final coachWidth = constraints.maxWidth * 0.76;
                  return Align(
                    alignment: Alignment.bottomRight,
                    child: Padding(
                      padding: const EdgeInsets.only(right: AppSpacing.sm, bottom: AppSpacing.sm),
                      child: SizedBox(
                        width: coachWidth,
                        child: Image.asset(
                          AppAssets.coach,
                          fit: BoxFit.contain,
                          alignment: Alignment.bottomRight,
                          filterQuality: FilterQuality.high,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.xl),
              child: SizedBox(
                height: 54,
                child: FilledButton(
                  onPressed: onContinue,
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.darkCanvas,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
                    textStyle: AppTypography.style(fontWeight: FontWeight.w700, fontSize: 16),
                  ),
                  child: Text(l10n.entryContinue),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
