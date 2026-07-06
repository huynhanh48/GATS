import 'package:flutter/material.dart';
import 'package:gats_academy/core/l10n/l10n.dart';
import 'package:gats_academy/core/services/daily_reminder_prefs.dart';
import 'package:gats_academy/core/services/gats_notification_service.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/ios_wheel_time_picker.dart';
import 'package:gats_academy/features/onboarding/models/onboarding_answers.dart';

class OnboardingReminderStep extends StatefulWidget {
  const OnboardingReminderStep({
    super.key,
    required this.answers,
    required this.onAnswersChanged,
  });

  final OnboardingAnswers answers;
  final ValueChanged<OnboardingAnswers> onAnswersChanged;

  @override
  State<OnboardingReminderStep> createState() => OnboardingReminderStepState();
}

class OnboardingReminderStepState extends State<OnboardingReminderStep> {
  final GlobalKey<IosWheelTimePickerState> _pickerKey = GlobalKey();

  OnboardingAnswers get committedAnswers {
    final picked = _pickerKey.currentState?.time;
    if (picked == null) return widget.answers;
    return widget.answers.copyWith(
      reminderHour: picked.hour,
      reminderMinute: picked.minute,
    );
  }

  void _setEnabled(bool enabled) {
    widget.onAnswersChanged(widget.answers.copyWith(dailyReminderEnabled: enabled));
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final enabled = widget.answers.dailyReminderEnabled;
    final time = TimeOfDay(
      hour: widget.answers.reminderHour,
      minute: widget.answers.reminderMinute,
    );

    return SingleChildScrollView(
      physics: const ClampingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.08),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.notifications_active_outlined, size: 40, color: AppColors.primary),
          ),
          const SizedBox(height: AppSpacing.lg),
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: Text(
              l10n.onboardingReminderEnable,
              style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
            ),
            value: enabled,
            activeThumbColor: AppColors.primary,
            onChanged: _setEnabled,
          ),
          const SizedBox(height: AppSpacing.md),
          AnimatedCrossFade(
            duration: const Duration(milliseconds: 200),
            crossFadeState: enabled ? CrossFadeState.showFirst : CrossFadeState.showSecond,
            firstChild: IosWheelTimePicker(
              key: _pickerKey,
              time: time,
            ),
            secondChild: const SizedBox.shrink(),
          ),
          const SizedBox(height: AppSpacing.lg),
        ],
      ),
    );
  }
}

/// Nút dưới màn nhắc nhở — No thanks / Continue.
class OnboardingReminderBottomBar extends StatelessWidget {
  const OnboardingReminderBottomBar({
    super.key,
    required this.onNoThanks,
    required this.onContinue,
    this.isLoading = false,
  });

  final VoidCallback? onNoThanks;
  final VoidCallback? onContinue;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextButton(
          onPressed: isLoading ? null : onNoThanks,
          child: Text(l10n.onboardingReminderNoThanks),
        ),
        const SizedBox(height: AppSpacing.sm),
        FilledButton(
          onPressed: isLoading ? null : onContinue,
          child: isLoading
              ? const SizedBox(
                  width: 22,
                  height: 22,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                )
              : Text(l10n.onboardingReminderContinue),
        ),
      ],
    );
  }
}

/// Lưu prefs + xin quyền + lên lịch — gọi khi user ấn Continue.
Future<void> applyOnboardingReminderSettings(OnboardingAnswers answers) async {
  await DailyReminderPrefs.save(
    enabled: answers.dailyReminderEnabled,
    hour: answers.reminderHour,
    minute: answers.reminderMinute,
  );

  if (!answers.dailyReminderEnabled) {
    await GatsNotificationService.cancelDailyReminder();
    return;
  }

  final granted = await GatsNotificationService.requestSystemPermission();
  if (!granted) return;

  await GatsNotificationService.scheduleDailyReminder(
    hour: answers.reminderHour,
    minute: answers.reminderMinute,
  );
}
