import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:gats_academy/features/auth/models/auth_user.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:shared_preferences/shared_preferences.dart';

abstract final class AuthPrefs {
  static const _signedInKey = 'auth_signed_in';
  static const _userIdKey = 'auth_user_id';
  static const _displayNameKey = 'auth_display_name';
  static const _emailKey = 'auth_email';
  static const _methodKey = 'auth_method';
  static const _roleKey = 'auth_role';
  static const _tokenKey = 'auth_access_token';

  static SharedPreferences? _prefs;
  static bool _memoryFallback = false;
  static AuthUser? _memoryUser;
  static String? _memoryToken;

  static Future<void> init() async {
    _prefs = null;
    await _loadPrefs();
  }

  static void _useMemoryFallback(Object error) {
    if (!_memoryFallback) {
      debugPrint('AuthPrefs: dùng bộ nhớ tạm ($error)');
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

  static Future<bool> isSignedIn() async {
    if (_memoryFallback) return _memoryUser != null;
    try {
      final prefs = await _loadPrefs();
      if (prefs == null) return _memoryUser != null;
      return prefs.getBool(_signedInKey) ?? false;
    } on PlatformException catch (e) {
      _useMemoryFallback(e);
      return _memoryUser != null;
    } catch (e) {
      _useMemoryFallback(e);
      return _memoryUser != null;
    }
  }

  static Future<String?> accessToken() async {
    if (_memoryFallback) return _memoryToken;
    try {
      final prefs = await _loadPrefs();
      return prefs?.getString(_tokenKey) ?? _memoryToken;
    } on PlatformException catch (e) {
      _useMemoryFallback(e);
      return _memoryToken;
    } catch (e) {
      _useMemoryFallback(e);
      return _memoryToken;
    }
  }

  static Future<AuthUser?> currentUser() async {
    if (_memoryFallback) return _memoryUser;
    try {
      final prefs = await _loadPrefs();
      if (prefs == null) return _memoryUser;
      if (!(prefs.getBool(_signedInKey) ?? false)) return null;
      final methodName = prefs.getString(_methodKey);
      final roleName = prefs.getString(_roleKey);
      return AuthUser(
        id: prefs.getString(_userIdKey) ?? 'guest',
        displayName: prefs.getString(_displayNameKey) ?? 'Học viên GATS',
        email: prefs.getString(_emailKey) ?? '',
        method: AuthMethod.values.firstWhere(
          (m) => m.name == methodName,
          orElse: () => AuthMethod.email,
        ),
        role: UserRole.values.firstWhere(
          (r) => r.name == roleName,
          orElse: () => UserRole.user,
        ),
      );
    } on PlatformException catch (e) {
      _useMemoryFallback(e);
      return _memoryUser;
    } catch (e) {
      _useMemoryFallback(e);
      return _memoryUser;
    }
  }

  static Future<void> saveSession(AuthUser user, {String? token}) async {
    _memoryUser = user;
    if (token != null) _memoryToken = token;
    if (_memoryFallback) return;
    try {
      final prefs = await _loadPrefs();
      if (prefs == null) return;
      await prefs.setBool(_signedInKey, true);
      await prefs.setString(_userIdKey, user.id);
      await prefs.setString(_displayNameKey, user.displayName);
      await prefs.setString(_emailKey, user.email);
      await prefs.setString(_methodKey, user.method.name);
      await prefs.setString(_roleKey, user.role.name);
      if (token != null) {
        await prefs.setString(_tokenKey, token);
      }
    } on PlatformException catch (e) {
      _useMemoryFallback(e);
    } catch (e) {
      _useMemoryFallback(e);
    }
  }

  static Future<void> signOut() async {
    _memoryUser = null;
    _memoryToken = null;
    if (_memoryFallback) return;
    try {
      final prefs = await _loadPrefs();
      if (prefs == null) return;
      await prefs.remove(_signedInKey);
      await prefs.remove(_userIdKey);
      await prefs.remove(_displayNameKey);
      await prefs.remove(_emailKey);
      await prefs.remove(_methodKey);
      await prefs.remove(_roleKey);
      await prefs.remove(_tokenKey);
    } on PlatformException catch (e) {
      _useMemoryFallback(e);
    } catch (e) {
      _useMemoryFallback(e);
    }
  }
}
