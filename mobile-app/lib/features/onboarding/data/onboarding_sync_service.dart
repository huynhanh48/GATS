import 'package:flutter/foundation.dart';
import 'package:gats_academy/features/onboarding/models/onboarding_answers.dart';

/// Mock — sau này thay bằng POST /users/me/onboarding
abstract final class OnboardingSyncService {
  static Future<void> syncAfterAuth({
    required String userId,
    required List<String> recommendedCourseIds,
    OnboardingAnswers? answers,
  }) async {
    await Future<void>.delayed(const Duration(milliseconds: 400));
    debugPrint(
      'OnboardingSync: user=$userId courses=$recommendedCourseIds answers=${answers?.toJson()}',
    );
  }
}
