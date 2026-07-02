import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AppThemeController extends ChangeNotifier {
  AppThemeController._();

  static final instance = AppThemeController._();

  static const _themeModeKey = 'app_theme_mode';

  SharedPreferences? _prefs;
  bool _memoryFallback = false;
  ThemeMode _themeMode = ThemeMode.system;

  ThemeMode get themeMode => _themeMode;
  bool get isDarkMode => _themeMode == ThemeMode.dark;

  Future<void> init() async {
    try {
      _prefs = await SharedPreferences.getInstance();
      final stored = _prefs?.getString(_themeModeKey);
      _themeMode = _themeModeFromName(stored);
    } on PlatformException catch (e) {
      _useMemoryFallback(e);
    } catch (e) {
      _useMemoryFallback(e);
    }
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    if (_themeMode == mode) return;
    _themeMode = mode;
    notifyListeners();

    if (_memoryFallback) return;
    try {
      _prefs ??= await SharedPreferences.getInstance();
      await _prefs?.setString(_themeModeKey, mode.name);
    } on PlatformException catch (e) {
      _useMemoryFallback(e);
    } catch (e) {
      _useMemoryFallback(e);
    }
  }

  Future<void> toggleDarkMode() {
    return setThemeMode(isDarkMode ? ThemeMode.light : ThemeMode.dark);
  }

  ThemeMode _themeModeFromName(String? name) {
    return switch (name) {
      'light' => ThemeMode.light,
      'dark' => ThemeMode.dark,
      'system' => ThemeMode.system,
      _ => ThemeMode.system,
    };
  }

  void _useMemoryFallback(Object error) {
    if (!_memoryFallback) {
      debugPrint('AppThemeController: using in-memory theme fallback ($error)');
    }
    _memoryFallback = true;
    _prefs = null;
  }
}
