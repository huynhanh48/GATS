import 'package:flutter/foundation.dart';
import 'package:gats_academy/core/network/api_client.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/services/onboarding_prefs.dart';
import 'package:gats_academy/data/api/course_api_paths.dart';
import 'package:gats_academy/features/onboarding/models/onboarding_answers.dart';

/// Đồng bộ câu trả lời onboarding sau khi user đăng nhập.
abstract final class OnboardingSyncService {
  static Future<void> syncAfterAuth({
    required String userId,
    required List<String> recommendedCourseIds,
    OnboardingAnswers? answers,
  }) async {
    final pending = answers ?? await OnboardingPrefs.loadPendingAnswers();
    if (pending == null) return;
    try {
      final token = await AuthPrefs.accessToken();
      if (token == null || token.isEmpty) return;
      await ApiClient.post(
        CourseApiPaths.recommendations,
        body: pending.toJson(),
        token: token,
      );
      await OnboardingPrefs.clearPendingAnswers();
    } catch (error) {
      debugPrint('OnboardingSync: sync failed for user=$userId — $error');
      // Giữ pending answers để retry ở lần đăng nhập sau.
    }
  }
}
