import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';

abstract final class ReviewPromptService {
  static const _lastPromptAtKey = 'last_review_prompt_at';
  static const _promptCountYearKey = 'review_prompt_count_year';
  static const _promptYearKey = 'review_prompt_year';
  static const _completedCoreTasksKey = 'completed_core_tasks';

  static SharedPreferences? _prefs;
  static bool _memoryFallback = false;
  static bool _sessionSkippedOnboardingRate = false;
  static bool _sessionCompletedOnboardingRate = false;

  static Future<void> init() async {
    try {
      _prefs = await SharedPreferences.getInstance();
    } on PlatformException {
      _memoryFallback = true;
    } catch (_) {
      _memoryFallback = true;
    }
  }

  static Future<SharedPreferences?> _getPrefs() async {
    if (_memoryFallback) return null;
    _prefs ??= await SharedPreferences.getInstance();
    return _prefs;
  }

  static void markOnboardingRateCompletedThisSession() {
    _sessionCompletedOnboardingRate = true;
  }

  static Future<void> recordOnboardingRateSkipped() async {
    _sessionSkippedOnboardingRate = true;
  }

  static Future<void> incrementCoreTaskCompletion() async {
    final prefs = await _getPrefs();
    if (prefs == null) return;
    final count = prefs.getInt(_completedCoreTasksKey) ?? 0;
    await prefs.setInt(_completedCoreTasksKey, count + 1);
  }

  static Future<bool> shouldShowPostTaskPrompt() async {
    if (_sessionSkippedOnboardingRate || _sessionCompletedOnboardingRate) return false;

    final prefs = await _getPrefs();
    if (prefs == null) return false;

    final coreTasks = prefs.getInt(_completedCoreTasksKey) ?? 0;
    if (coreTasks < 1) return false;

    if (!_isCooldownPassed(prefs)) return false;
    if (!_isUnderYearlyLimit(prefs)) return false;

    return true;
  }

  static Future<void> recordPromptShown() async {
    await _recordPrompt();
  }

  static Future<void> _recordPrompt() async {
    final prefs = await _getPrefs();
    if (prefs == null) return;
    final now = DateTime.now();
    final year = now.year;
    final storedYear = prefs.getInt(_promptYearKey) ?? year;
    var count = prefs.getInt(_promptCountYearKey) ?? 0;
    if (storedYear != year) {
      count = 0;
      await prefs.setInt(_promptYearKey, year);
    }
    await prefs.setInt(_promptCountYearKey, count + 1);
    await prefs.setInt(_lastPromptAtKey, now.millisecondsSinceEpoch);
  }

  static bool _isCooldownPassed(SharedPreferences prefs) {
    final lastMs = prefs.getInt(_lastPromptAtKey);
    if (lastMs == null) return true;
    final last = DateTime.fromMillisecondsSinceEpoch(lastMs);
    return DateTime.now().difference(last).inDays >= 90;
  }

  static bool _isUnderYearlyLimit(SharedPreferences prefs) {
    final year = DateTime.now().year;
    final storedYear = prefs.getInt(_promptYearKey) ?? year;
    if (storedYear != year) return true;
    final count = prefs.getInt(_promptCountYearKey) ?? 0;
    return count < 3;
  }

  @visibleForTesting
  static void resetSessionFlags() {
    _sessionSkippedOnboardingRate = false;
    _sessionCompletedOnboardingRate = false;
  }
}
