import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:gats_academy/features/auth/models/auth_user.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Session prefs — JWT trong Keychain/Keystore; profile fields trong SharedPreferences.
abstract final class AuthPrefs {
  static const _signedInKey = 'auth_signed_in';
  static const _userIdKey = 'auth_user_id';
  static const _displayNameKey = 'auth_display_name';
  static const _emailKey = 'auth_email';
  static const _methodKey = 'auth_method';
  static const _roleKey = 'auth_role';

  /// Legacy plain-text key — migrate 1 lần rồi xóa.
  static const _legacyTokenKey = 'auth_access_token';
  static const _secureTokenKey = 'auth_access_token';
  static const _secureRefreshKey = 'auth_refresh_token';

  static SharedPreferences? _prefs;
  static bool _memoryFallback = false;
  static AuthUser? _memoryUser;
  static String? _memoryToken;
  static bool _tokenMigrated = false;

  static const FlutterSecureStorage _secure = FlutterSecureStorage();

  static Future<void> init() async {
    _prefs = null;
    _tokenMigrated = false;
    await _loadPrefs();
    await _migrateTokenIfNeeded();
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

  /// Chuyển JWT từ SharedPreferences → secure storage (một lần).
  static Future<void> _migrateTokenIfNeeded() async {
    if (_tokenMigrated || _memoryFallback) return;
    _tokenMigrated = true;
    try {
      final prefs = await _loadPrefs();
      final legacy = prefs?.getString(_legacyTokenKey);
      if (legacy == null || legacy.isEmpty) return;

      final existing = await _secure.read(key: _secureTokenKey);
      if (existing == null || existing.isEmpty) {
        await _secure.write(key: _secureTokenKey, value: legacy);
      }
      await prefs?.remove(_legacyTokenKey);
      debugPrint('AuthPrefs: migrated access token to secure storage');
    } catch (e) {
      debugPrint('AuthPrefs: token migrate skipped — $e');
    }
  }

  static Future<bool> isSignedIn() async {
    final token = await accessToken();
    if (token == null || token.isEmpty) return false;
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
      await _migrateTokenIfNeeded();
      final secure = await _secure.read(key: _secureTokenKey);
      if (secure != null && secure.isNotEmpty) {
        _memoryToken = secure;
        return secure;
      }
      // Fallback legacy nếu migrate chưa chạy / secure fail.
      final prefs = await _loadPrefs();
      final legacy = prefs?.getString(_legacyTokenKey);
      if (legacy != null && legacy.isNotEmpty) {
        _memoryToken = legacy;
        return legacy;
      }
      return _memoryToken;
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
      final token = await accessToken();
      if (token == null || token.isEmpty) return null;
      final methodName = prefs.getString(_methodKey);
      final roleName = prefs.getString(_roleKey);
      final userId = prefs.getString(_userIdKey);
      if (userId == null || userId.isEmpty) return null;
      return AuthUser(
        id: userId,
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

  static Future<String?> refreshToken() async {
    if (_memoryFallback) return null;
    try {
      return await _secure.read(key: _secureRefreshKey);
    } catch (_) {
      return null;
    }
  }

  /// Update access/refresh tokens after silent refresh (profile unchanged).
  static Future<void> updateTokens({
    required String accessToken,
    String? refreshToken,
  }) async {
    _memoryToken = accessToken;
    if (_memoryFallback) return;
    try {
      await _secure.write(key: _secureTokenKey, value: accessToken);
      if (refreshToken != null && refreshToken.isNotEmpty) {
        await _secure.write(key: _secureRefreshKey, value: refreshToken);
      }
    } catch (_) {
      // ignore — next request may 401 again
    }
  }

  static Future<void> saveSession(
    AuthUser user, {
    required String token,
    String? refreshToken,
  }) async {
    _memoryUser = user;
    _memoryToken = token;
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
      await prefs.remove(_legacyTokenKey);
      await _secure.write(key: _secureTokenKey, value: token);
      if (refreshToken != null && refreshToken.isNotEmpty) {
        await _secure.write(key: _secureRefreshKey, value: refreshToken);
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
      if (prefs != null) {
        await prefs.remove(_signedInKey);
        await prefs.remove(_userIdKey);
        await prefs.remove(_displayNameKey);
        await prefs.remove(_emailKey);
        await prefs.remove(_methodKey);
        await prefs.remove(_roleKey);
        await prefs.remove(_legacyTokenKey);
      }
      await _secure.delete(key: _secureTokenKey);
      await _secure.delete(key: _secureRefreshKey);
    } on PlatformException catch (e) {
      _useMemoryFallback(e);
    } catch (e) {
      _useMemoryFallback(e);
    }
  }
}
