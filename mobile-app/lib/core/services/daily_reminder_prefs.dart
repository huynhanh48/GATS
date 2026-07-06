import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';

abstract final class DailyReminderPrefs {
  static const _enabledKey = 'daily_reminder_enabled';
  static const _hourKey = 'daily_reminder_hour';
  static const _minuteKey = 'daily_reminder_minute';

  static const defaultHour = 20;
  static const defaultMinute = 0;

  static SharedPreferences? _prefs;
  static bool _memoryFallback = false;
  static bool _memoryEnabled = true;
  static int _memoryHour = defaultHour;
  static int _memoryMinute = defaultMinute;

  static Future<void> init() async {
    await _loadPrefs();
  }

  static void _useMemoryFallback(Object error) {
    if (!_memoryFallback) {
      debugPrint('DailyReminderPrefs: dùng bộ nhớ tạm ($error)');
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

  static Future<({bool enabled, int hour, int minute})> load() async {
    if (_memoryFallback) {
      return (enabled: _memoryEnabled, hour: _memoryHour, minute: _memoryMinute);
    }
    try {
      final prefs = await _loadPrefs();
      if (prefs == null) {
        return (enabled: _memoryEnabled, hour: _memoryHour, minute: _memoryMinute);
      }
      return (
        enabled: prefs.getBool(_enabledKey) ?? true,
        hour: prefs.getInt(_hourKey) ?? defaultHour,
        minute: prefs.getInt(_minuteKey) ?? defaultMinute,
      );
    } catch (e) {
      _useMemoryFallback(e);
      return (enabled: _memoryEnabled, hour: _memoryHour, minute: _memoryMinute);
    }
  }

  static Future<void> save({
    required bool enabled,
    required int hour,
    required int minute,
  }) async {
    _memoryEnabled = enabled;
    _memoryHour = hour;
    _memoryMinute = minute;

    if (_memoryFallback) return;
    try {
      final prefs = await _loadPrefs();
      if (prefs == null) return;
      await prefs.setBool(_enabledKey, enabled);
      await prefs.setInt(_hourKey, hour);
      await prefs.setInt(_minuteKey, minute);
    } catch (e) {
      _useMemoryFallback(e);
    }
  }
}
