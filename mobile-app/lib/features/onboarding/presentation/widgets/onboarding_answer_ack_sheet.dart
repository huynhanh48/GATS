import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gats_academy/core/l10n/l10n.dart';
import 'package:gats_academy/l10n/app_localizations.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/features/onboarding/models/onboarding_answers.dart';
import 'package:gats_academy/features/onboarding/presentation/widgets/coach_notetaking_illustration.dart';

enum OnboardingAckScene { recording, analyzing, encouraging, milestone }

class OnboardingAckConfig {
  const OnboardingAckConfig({
    required this.headline,
    required this.echoLine,
    required this.scene,
    this.socialProof,
  });

  final String headline;
  final String echoLine;
  final OnboardingAckScene scene;
  final String? socialProof;

  static OnboardingAckConfig forStep(QuizStepId step, OnboardingAnswers answers, AppLocalizations l10n) {
    return switch (step) {
      QuizStepId.language => OnboardingAckConfig(
          headline: l10n.ackHeadlineNoted,
          echoLine: l10n.languageEcho(answers.language),
          scene: OnboardingAckScene.recording,
        ),
      QuizStepId.referral => OnboardingAckConfig(
          headline: l10n.ackHeadlineNoted,
          echoLine: l10n.ackReferralEcho(
            answers.referral == null ? '' : l10n.referralLabel(answers.referral!),
          ),
          scene: OnboardingAckScene.recording,
          socialProof: l10n.ackSocialReferral,
        ),
      QuizStepId.level => OnboardingAckConfig(
          headline: l10n.ackHeadline,
          echoLine: l10n.ackLevelEcho(
            answers.level == null ? '' : l10n.skillLevelLabel(answers.level!),
          ),
          scene: OnboardingAckScene.recording,
        ),
      QuizStepId.profile => OnboardingAckConfig(
          headline: l10n.ackHeadline,
          echoLine: l10n.ackProfileEcho(
            answers.profile == null ? '' : l10n.userProfileLabel(answers.profile!),
          ),
          scene: OnboardingAckScene.recording,
        ),
      QuizStepId.motivation => OnboardingAckConfig(
          headline: l10n.ackHeadlineMilestone,
          echoLine: l10n.ackMotivationEcho(
            answers.motivation == null ? '' : l10n.motivationLabel(answers.motivation!),
          ),
          scene: OnboardingAckScene.milestone,
          socialProof: l10n.ackSocialMilestone,
        ),
      QuizStepId.interests => OnboardingAckConfig(
          headline: l10n.ackHeadlineGreat,
          echoLine: l10n.ackInterestsEcho(answers.interests.length),
          scene: OnboardingAckScene.encouraging,
        ),
      QuizStepId.age => OnboardingAckConfig(
          headline: l10n.ackHeadline,
          echoLine: l10n.ackAgeEcho(
            answers.ageRange == null ? '' : l10n.ageRangeLabel(answers.ageRange!),
          ),
          scene: OnboardingAckScene.recording,
        ),
      QuizStepId.dailyGoal => OnboardingAckConfig(
          headline: l10n.ackHeadlineCommitment,
          echoLine: l10n.ackDailyGoalEcho(
            answers.dailyGoal == null ? '' : l10n.dailyGoalLabel(answers.dailyGoal!),
          ),
          scene: OnboardingAckScene.encouraging,
          socialProof: l10n.ackSocialDailyGoal,
        ),
      QuizStepId.purpose => OnboardingAckConfig(
          headline: l10n.ackAnalyzingHeadline,
          echoLine: l10n.ackPurposeEcho(
            answers.purpose == null ? '' : l10n.purposeLabel(answers.purpose!),
          ),
          scene: OnboardingAckScene.analyzing,
        ),
      QuizStepId.reminder => OnboardingAckConfig(
          headline: l10n.ackHeadlineNoted,
          echoLine: answers.dailyReminderEnabled
              ? l10n.ackReminderEcho(_formatReminderTime(answers))
              : l10n.ackReminderSkippedEcho,
          scene: OnboardingAckScene.encouraging,
        ),
    };
  }

  static String _formatReminderTime(OnboardingAnswers answers) {
    final h = answers.reminderHour.toString().padLeft(2, '0');
    final m = answers.reminderMinute.toString().padLeft(2, '0');
    return '$h:$m';
  }
}

abstract final class OnboardingAnswerAckSheet {
  static const _duration = Duration(milliseconds: 1800);

  static Future<void> show(BuildContext context, OnboardingAckConfig config) {
    HapticFeedback.mediumImpact();
    return showGeneralDialog<void>(
      context: context,
      barrierDismissible: false,
      barrierColor: AppColors.textPrimary.withValues(alpha: 0.45),
      transitionDuration: const Duration(milliseconds: 280),
      pageBuilder: (dialogContext, animation, secondaryAnimation) {
        return _OnboardingAnswerAckSheet(config: config);
      },
      transitionBuilder: (context, animation, secondaryAnimation, child) {
        final curved = CurvedAnimation(parent: animation, curve: Curves.easeOutCubic);
        return FadeTransition(
          opacity: curved,
          child: ScaleTransition(
            scale: Tween<double>(begin: 0.92, end: 1).animate(curved),
            child: child,
          ),
        );
      },
    );
  }
}

class _OnboardingAnswerAckSheet extends StatefulWidget {
  const _OnboardingAnswerAckSheet({required this.config});

  final OnboardingAckConfig config;

  @override
  State<_OnboardingAnswerAckSheet> createState() => _OnboardingAnswerAckSheetState();
}

class _OnboardingAnswerAckSheetState extends State<_OnboardingAnswerAckSheet>
    with SingleTickerProviderStateMixin {
  late AnimationController _progressController;
  Timer? _autoCloseTimer;
  bool _closed = false;

  @override
  void initState() {
    super.initState();
    _progressController = AnimationController(vsync: this, duration: OnboardingAnswerAckSheet._duration)
      ..forward();
    _autoCloseTimer = Timer(OnboardingAnswerAckSheet._duration, _dismiss);
  }

  void _dismiss() {
    if (_closed || !mounted) return;
    _closed = true;
    Navigator.of(context).pop();
  }

  @override
  void dispose() {
    _autoCloseTimer?.cancel();
    _progressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: GestureDetector(
        onTap: _dismiss,
        behavior: HitTestBehavior.opaque,
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
            child: Material(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(AppRadius.lg),
              elevation: 8,
              shadowColor: AppColors.primary.withValues(alpha: 0.15),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(AppSpacing.xl, AppSpacing.xl, AppSpacing.xl, AppSpacing.lg),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CoachNotetakingIllustration(
                      height: 200,
                      bobAmplitude: switch (widget.config.scene) {
                        OnboardingAckScene.analyzing => 2.5,
                        OnboardingAckScene.milestone => 4,
                        OnboardingAckScene.encouraging => 3.5,
                        OnboardingAckScene.recording => 3,
                      },
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    Text(
                      widget.config.headline,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      widget.config.echoLine,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppColors.textSecondary,
                            height: 1.45,
                          ),
                      textAlign: TextAlign.center,
                    ),
                    if (widget.config.socialProof != null) ...[
                      const SizedBox(height: AppSpacing.md),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.md,
                          vertical: AppSpacing.sm,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(AppRadius.md),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.groups_rounded, size: 16, color: AppColors.primary),
                            const SizedBox(width: AppSpacing.sm),
                            Flexible(
                              child: Text(
                                widget.config.socialProof!,
                                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                      color: AppColors.primary,
                                      fontWeight: FontWeight.w600,
                                    ),
                                textAlign: TextAlign.center,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: AppSpacing.lg),
                    AnimatedBuilder(
                      animation: _progressController,
                      builder: (context, child) {
                        return ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: _progressController.value,
                            minHeight: 4,
                            backgroundColor: AppColors.divider,
                            color: AppColors.primary,
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
