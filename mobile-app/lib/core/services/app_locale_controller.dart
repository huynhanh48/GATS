import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AppLocaleController extends ChangeNotifier {
  AppLocaleController._();

  static final instance = AppLocaleController._();

  static const _localeKey = 'app_locale';
  static const fallbackLocale = Locale('en');

  SharedPreferences? _prefs;
  bool _memoryFallback = false;
  bool _hasChosenLocale = false;
  Locale _locale = fallbackLocale;

  Locale get locale => _locale;
  bool get hasChosenLocale => _hasChosenLocale;

  Future<void> init() async {
    try {
      _prefs = await SharedPreferences.getInstance();
      _hasChosenLocale = _prefs?.containsKey(_localeKey) ?? false;
      final languageCode = _prefs?.getString(_localeKey);
      _locale = _hasChosenLocale ? _localeFromCode(languageCode) : fallbackLocale;
    } on PlatformException catch (e) {
      _useMemoryFallback(e);
    } catch (e) {
      _useMemoryFallback(e);
    }
  }

  Future<void> setLocale(Locale locale) async {
    final next = _localeFromCode(locale.languageCode);
    final changed = _locale != next || !_hasChosenLocale;
    _locale = next;
    _hasChosenLocale = true;
    if (changed) notifyListeners();

    if (_memoryFallback) return;
    try {
      _prefs ??= await SharedPreferences.getInstance();
      await _prefs?.setString(_localeKey, next.languageCode);
    } on PlatformException catch (e) {
      _useMemoryFallback(e);
    } catch (e) {
      _useMemoryFallback(e);
    }
  }

  Future<void> resetChoice() async {
    _hasChosenLocale = false;
    _locale = fallbackLocale;
    notifyListeners();

    if (_memoryFallback) return;
    try {
      _prefs ??= await SharedPreferences.getInstance();
      await _prefs?.remove(_localeKey);
    } on PlatformException catch (e) {
      _useMemoryFallback(e);
    } catch (e) {
      _useMemoryFallback(e);
    }
  }

  Locale _localeFromCode(String? code) {
    return switch (code) {
      'en' => const Locale('en'),
      'vi' => const Locale('vi'),
      _ => fallbackLocale,
    };
  }

  void _useMemoryFallback(Object error) {
    if (!_memoryFallback) {
      debugPrint('AppLocaleController: using in-memory locale fallback ($error)');
    }
    _memoryFallback = true;
    _prefs = null;
  }
}
