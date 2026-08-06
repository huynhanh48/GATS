import 'package:flutter/material.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/services/onboarding_prefs.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/features/onboarding/data/onboarding_sync_service.dart';
import 'package:gats_academy/features/onboarding/presentation/onboarding_screen.dart';

/// Chạy lại onboarding khi user đã vào app (từ Cài đặt) — không cần restart.
class OnboardingReplayScreen extends StatelessWidget {
  const OnboardingReplayScreen({super.key});

  static Future<void> open(BuildContext context) async {
    await OnboardingPrefs.reset();
    if (!context.mounted) return;
    await Navigator.of(context, rootNavigator: true).push<void>(
      MaterialPageRoute<void>(
        fullscreenDialog: true,
        builder: (_) => const OnboardingReplayScreen(),
      ),
    );
  }

  Future<void> _finish(BuildContext context, List<String> courseIds) async {
    await OnboardingPrefs.markComplete(recommendedCourseIds: courseIds);
    final user = await AuthPrefs.currentUser();
    if (user != null) {
      await OnboardingSyncService.syncAfterAuth(
        userId: user.id,
        recommendedCourseIds: courseIds,
      );
    }
    if (!context.mounted) return;
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Theme(
      data: AppTheme.light,
      child: OnboardingScreen(
        onBackToEntry: () => Navigator.of(context).pop(),
        onReadyForRateUs: (ids) => _finish(context, ids),
      ),
    );
  }
}
