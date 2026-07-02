import 'package:flutter_test/flutter_test.dart';
import 'package:gats_academy/core/services/review_prompt_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
    ReviewPromptService.resetSessionFlags();
  });

  test('shouldShowPostTaskPrompt returns false when session skipped onboarding rate', () async {
    await ReviewPromptService.init();
    await ReviewPromptService.recordOnboardingRateSkipped();
    await ReviewPromptService.incrementCoreTaskCompletion();

    expect(await ReviewPromptService.shouldShowPostTaskPrompt(), isFalse);
  });

  test('shouldShowPostTaskPrompt returns false when onboarding rate completed this session', () async {
    await ReviewPromptService.init();
    ReviewPromptService.markOnboardingRateCompletedThisSession();
    await ReviewPromptService.incrementCoreTaskCompletion();

    expect(await ReviewPromptService.shouldShowPostTaskPrompt(), isFalse);
  });
}
