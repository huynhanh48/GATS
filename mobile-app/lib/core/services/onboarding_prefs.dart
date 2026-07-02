import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:gats_academy/features/onboarding/models/onboarding_answers.dart';
import 'package:shared_preferences/shared_preferences.dart';

abstract final class OnboardingPrefs {
  static const _completeKey = 'onboarding_complete';
  static const _recommendedIdsKey = 'recommended_course_ids';
  static const _pendingAnswersKey = 'pending_onboarding_answers';

  static SharedPreferences? _prefs;
  static bool _memoryFallback = false;
  static bool _memoryComplete = false;
  static List<String> _memoryRecommendedIds = [];
  static String? _memoryPendingAnswers;
  /// Gọi từ main() trước runApp. Sau hot restart channel có thể lỗi — dùng bộ nhớ tạm.
  static Future<void> init() async {
    _prefs = null;
    await _loadPrefs();
  }

  static void _useMemoryFallback(Object error) {
    if (!_memoryFallback) {
      debugPrint('OnboardingPrefs: dùng bộ nhớ tạm ($error)');
    }
    _memoryFallback = true;
    _prefs = null;
  }

  static Future<SharedPreferences?> _loadPrefs() async {
    if (_memoryFallback) return null;
    if (_prefs != null) return _prefs;
    try {
      _prefs = await SharedPreferences.getInstance();
      return _prefs;
    } on PlatformException catch (e) {
      _useMemoryFallback(e);
      return null;
    } catch (e) {
      _useMemoryFallback(e);
      return null;
    }
  }

  static Future<bool> isComplete() async {
    if (_memoryFallback) return _memoryComplete;
    try {
      final prefs = await _loadPrefs();
      if (prefs == null) return _memoryComplete;
      return prefs.getBool(_completeKey) ?? false;
    } on PlatformException catch (e) {
      _useMemoryFallback(e);
      return _memoryComplete;
    } catch (e) {
      _useMemoryFallback(e);
      return _memoryComplete;
    }
  }

  static Future<void> markComplete({List<String>? recommendedCourseIds}) async {
    if (_memoryFallback) {
      _memoryComplete = true;
      if (recommendedCourseIds != null) {
        _memoryRecommendedIds = List.of(recommendedCourseIds);
      }
      return;
    }
    try {
      final prefs = await _loadPrefs();
      if (prefs == null) {
        _memoryComplete = true;
        if (recommendedCourseIds != null) {
          _memoryRecommendedIds = List.of(recommendedCourseIds);
        }
        return;
      }
      await prefs.setBool(_completeKey, true);
      if (recommendedCourseIds != null) {
        await prefs.setStringList(_recommendedIdsKey, recommendedCourseIds);
      }
    } on PlatformException catch (e) {
      _useMemoryFallback(e);
      _memoryComplete = true;
      if (recommendedCourseIds != null) {
        _memoryRecommendedIds = List.of(recommendedCourseIds);
      }
    } catch (e) {
      _useMemoryFallback(e);
      _memoryComplete = true;
      if (recommendedCourseIds != null) {
        _memoryRecommendedIds = List.of(recommendedCourseIds);
      }
    }
  }

  static Future<List<String>> recommendedCourseIds() async {
    if (_memoryFallback) return List.of(_memoryRecommendedIds);
    try {
      final prefs = await _loadPrefs();
      if (prefs == null) return List.of(_memoryRecommendedIds);
      return prefs.getStringList(_recommendedIdsKey) ?? [];
    } on PlatformException catch (e) {
      _useMemoryFallback(e);
      return List.of(_memoryRecommendedIds);
    } catch (e) {
      _useMemoryFallback(e);
      return List.of(_memoryRecommendedIds);
    }
  }

  static Future<void> savePendingAnswers(OnboardingAnswers answers) async {
    final encoded = jsonEncode(answers.toJson());
    if (_memoryFallback) {
      _memoryPendingAnswers = encoded;
      return;
    }
    try {
      final prefs = await _loadPrefs();
      if (prefs == null) {
        _memoryPendingAnswers = encoded;
        return;
      }
      await prefs.setString(_pendingAnswersKey, encoded);
    } on PlatformException catch (e) {
      _useMemoryFallback(e);
      _memoryPendingAnswers = encoded;
    } catch (e) {
      _useMemoryFallback(e);
      _memoryPendingAnswers = encoded;
    }
  }

  static Future<OnboardingAnswers?> loadPendingAnswers() async {
    String? raw;
    if (_memoryFallback) {
      raw = _memoryPendingAnswers;
    } else {
      try {
        final prefs = await _loadPrefs();
        raw = prefs?.getString(_pendingAnswersKey);
      } on PlatformException catch (e) {
        _useMemoryFallback(e);
        raw = _memoryPendingAnswers;
      } catch (e) {
        _useMemoryFallback(e);
        raw = _memoryPendingAnswers;
      }
    }
    if (raw == null || raw.isEmpty) return null;
    try {
      final decoded = jsonDecode(raw);
      if (decoded is! Map<String, dynamic>) return null;
      return OnboardingAnswers.fromJson(decoded);
    } catch (e) {
      debugPrint('OnboardingPrefs.loadPendingAnswers: $e');
      return null;
    }
  }

  static Future<void> clearPendingAnswers() async {
    _memoryPendingAnswers = null;
    if (_memoryFallback) return;
    try {
      final prefs = await _loadPrefs();
      if (prefs == null) return;
      await prefs.remove(_pendingAnswersKey);
    } on PlatformException catch (e) {
      _useMemoryFallback(e);
    } catch (e) {
      _useMemoryFallback(e);
    }
  }

  static Future<void> reset() async {
    _memoryComplete = false;
    _memoryRecommendedIds = [];
    _memoryPendingAnswers = null;
    if (_memoryFallback) return;
    try {
      final prefs = await _loadPrefs();
      if (prefs == null) return;
      await prefs.remove(_completeKey);
      await prefs.remove(_recommendedIdsKey);
      await prefs.remove(_pendingAnswersKey);
    } on PlatformException catch (e) {
      _useMemoryFallback(e);
    } catch (e) {
      _useMemoryFallback(e);
    }
  }
}
