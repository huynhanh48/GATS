import 'package:flutter/foundation.dart';
import 'package:gats_academy/core/config/api_config.dart';
import 'package:gats_academy/core/network/api_client.dart';
import 'package:gats_academy/core/network/api_exception.dart';
import 'package:gats_academy/data/api/auth_api_paths.dart';
import 'package:gats_academy/features/auth/models/auth_exception.dart';
import 'package:gats_academy/features/auth/models/auth_user.dart';
import 'package:gats_academy/features/auth/models/social_auth_credential.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:http/http.dart' as http;

class AuthSession {
  const AuthSession({required this.user, required this.token});

  final AuthUser user;
  final String token;
}

/// Auth REST — mirror Web: token rồi hydrate user qua `/me`.
abstract final class AuthApiService {
  static Future<AuthSession> register({
    required String userName,
    required String email,
    required String password,
    String type = 'default',
  }) async {
    try {
      final json = await ApiClient.post(
        AuthApiPaths.register,
        body: {
          'user_name': userName,
          'email': email.trim(),
          'password': password,
          'type': type,
        },
      );
      return _hydrateAfterAuth(
        json,
        fallbackEmail: email,
        fallbackName: userName,
        fallbackMethod: AuthMethod.email,
      );
    } on ApiException catch (e) {
      throw _mapApiException(e);
    } on http.ClientException {
      throw const AuthException(AuthErrorCode.networkError);
    } catch (_) {
      throw const AuthException(AuthErrorCode.networkError);
    }
  }

  static Future<AuthSession> login({
    required String email,
    required String password,
  }) async {
    try {
      final json = await ApiClient.post(
        AuthApiPaths.login,
        body: {
          'email': email.trim(),
          'password': password,
        },
      );
      return _hydrateAfterAuth(
        json,
        fallbackEmail: email,
        fallbackMethod: AuthMethod.email,
      );
    } on ApiException catch (e) {
      throw _mapApiException(e);
    } catch (_) {
      throw const AuthException(AuthErrorCode.networkError);
    }
  }

  static Future<AuthSession> verifyEmail({required String token}) async {
    try {
      final json = await ApiClient.post(
        AuthApiPaths.verifyEmail,
        body: {'token': token.trim()},
      );
      return _hydrateAfterAuth(json);
    } on ApiException catch (e) {
      throw _mapApiException(e);
    } catch (_) {
      throw const AuthException(AuthErrorCode.networkError);
    }
  }

  /// Google: chỉ `POST /api/user/auth/google` + `{ idToken }`, rồi `/me`.
  static Future<AuthSession> loginWithGoogle(SocialAuthCredential credential) async {
    if (credential.provider != AuthMethod.google) {
      throw const AuthException(
        AuthErrorCode.socialFailed,
        serverMessage: 'Provider không phải Google.',
      );
    }
    try {
      if (kDebugMode) {
        debugPrint('AuthApiService: Google → ${AuthApiPaths.loginGoogle}');
      }
      final json = await ApiClient.post(
        AuthApiPaths.loginGoogle,
        body: {'idToken': credential.idToken},
      );
      return _hydrateAfterAuth(
        json,
        fallbackEmail: credential.email,
        fallbackName: credential.displayName,
        fallbackMethod: AuthMethod.google,
      );
    } on ApiException catch (e) {
      throw _mapApiException(e);
    } on http.ClientException {
      throw AuthException(
        AuthErrorCode.networkError,
        serverMessage: _networkHint(),
      );
    } catch (_) {
      throw AuthException(
        AuthErrorCode.networkError,
        serverMessage: _networkHint(),
      );
    }
  }

  /// Apple: BE chưa có — luôn fail rõ ràng.
  static Future<AuthSession> loginWithApple(SocialAuthCredential credential) async {
    throw const AuthException(
      AuthErrorCode.socialFailed,
      serverMessage: 'Đăng nhập Apple sắp ra mắt.',
    );
  }

  @Deprecated('Use loginWithGoogle / loginWithApple')
  static Future<AuthSession> loginWithSocial(SocialAuthCredential credential) {
    return switch (credential.provider) {
      AuthMethod.google => loginWithGoogle(credential),
      AuthMethod.apple => loginWithApple(credential),
      _ => throw const AuthException(AuthErrorCode.socialFailed),
    };
  }

  static Future<AuthSession> getMe({required String token}) async {
    try {
      final json = await ApiClient.get(AuthApiPaths.me, token: token);
      return _sessionFromMe(json, token: token);
    } on ApiException catch (e) {
      throw _mapApiException(e);
    } catch (_) {
      throw const AuthException(AuthErrorCode.networkError);
    }
  }

  static Future<AuthUser> updateMe({
    required String token,
    required String userName,
  }) async {
    try {
      final json = await ApiClient.put(
        AuthApiPaths.me,
        token: token,
        body: {'userName': userName.trim()},
      );
      return _sessionFromMe(json, token: token).user;
    } on ApiException catch (e) {
      throw _mapApiException(e);
    } catch (_) {
      throw const AuthException(AuthErrorCode.networkError);
    }
  }

  static Future<void> changePassword({
    required String token,
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      await ApiClient.post(
        AuthApiPaths.changePassword,
        token: token,
        body: {
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
      );
    } on ApiException catch (e) {
      throw _mapApiException(e);
    } catch (_) {
      throw const AuthException(AuthErrorCode.networkError);
    }
  }

  static Future<void> forgotPassword({required String email}) async {
    try {
      await ApiClient.post(
        AuthApiPaths.forgotPassword,
        body: {'email': email.trim()},
      );
    } on ApiException catch (e) {
      throw _mapApiException(e);
    } catch (_) {
      throw const AuthException(AuthErrorCode.networkError);
    }
  }

  static Future<void> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    try {
      await ApiClient.post(
        AuthApiPaths.resetPassword,
        body: {
          'token': token.trim(),
          'newPassword': newPassword,
        },
      );
    } on ApiException catch (e) {
      throw _mapApiException(e);
    } catch (_) {
      throw const AuthException(AuthErrorCode.networkError);
    }
  }

  static Future<void> logout({required String token}) async {
    try {
      await ApiClient.post(AuthApiPaths.logout, token: token);
    } catch (_) {
      // Local sign-out vẫn chạy dù BE logout fail.
    }
  }

  /// Token từ login/google → hydrate user thật từ `/me`.
  static Future<AuthSession> _hydrateAfterAuth(
    Map<String, dynamic> json, {
    String? fallbackEmail,
    String? fallbackName,
    AuthMethod? fallbackMethod,
  }) async {
    final payload = _unwrap(json);
    final token = _readToken(payload);
    if (token == null || token.isEmpty) {
      throw const AuthException(AuthErrorCode.emailVerificationRequired);
    }
    try {
      return await getMe(token: token);
    } on AuthException {
      // Fallback tạm nếu /me lỗi — vẫn giữ token để retry sau.
      return AuthSession(
        user: _userFromJson(
          _readUserMap(payload),
          fallbackEmail: fallbackEmail,
          fallbackName: fallbackName,
          fallbackMethod: fallbackMethod,
        ),
        token: token,
      );
    }
  }

  static AuthSession _sessionFromMe(
    Map<String, dynamic> json, {
    required String token,
    AuthMethod? fallbackMethod,
  }) {
    final payload = _unwrap(json);
    final userJson = _readUserMap(payload);
    return AuthSession(
      user: _userFromJson(userJson, fallbackMethod: fallbackMethod),
      token: token,
    );
  }

  static Map<String, dynamic> _unwrap(Map<String, dynamic> json) {
    final data = json['data'];
    if (data is Map<String, dynamic>) return data;
    if (data is Map) return Map<String, dynamic>.from(data);
    return json;
  }

  static String? _readToken(Map<String, dynamic> json) {
    for (final key in ['token', 'access_token', 'accessToken', 'jwt']) {
      final value = json[key];
      if (value is String && value.isNotEmpty) return value;
    }
    return null;
  }

  static Map<String, dynamic> _readUserMap(Map<String, dynamic> json) {
    final user = json['user'];
    if (user is Map<String, dynamic>) return user;
    if (user is Map) return Map<String, dynamic>.from(user);
    return json;
  }

  static AuthUser _userFromJson(
    Map<String, dynamic> json, {
    String? fallbackEmail,
    String? fallbackName,
    AuthMethod? fallbackMethod,
  }) {
    final id = json['id'] ?? json['_id'] ?? json['user_id'];
    final email = (json['email'] as String?)?.trim() ?? fallbackEmail ?? '';
    final rawName = (json['userName'] as String?) ??
        (json['user_name'] as String?) ??
        (json['name'] as String?) ??
        fallbackName;
    final displayName = (rawName ?? email.split('@').first).trim();

    final roles = json['roles'];
    final roleFromRoles = roles is List
        ? roles.map((e) => e.toString().toLowerCase()).toList()
        : const <String>[];

    return AuthUser(
      id: id?.toString() ?? email,
      displayName: displayName.isEmpty ? 'GATS Learner' : displayName,
      email: email,
      method: _mapMethod(json['type'] as String?) ??
          fallbackMethod ??
          AuthMethod.email,
      role: _mapRole(json['type'] as String?, roleFromRoles),
    );
  }

  static AuthMethod? _mapMethod(String? type) {
    return switch (type?.toLowerCase()) {
      'google' => AuthMethod.google,
      'apple' => AuthMethod.apple,
      'default' || 'email' => AuthMethod.email,
      'mentor' || 'admin' => null,
      _ => null,
    };
  }

  static UserRole _mapRole(String? type, List<String> roles) {
    if (roles.contains('admin')) return UserRole.admin;
    if (roles.contains('mentor')) return UserRole.mentor;
    return switch (type?.toLowerCase()) {
      'mentor' => UserRole.mentor,
      'admin' => UserRole.admin,
      _ => UserRole.user,
    };
  }

  static String _networkHint() =>
      'Không kết nối được API tại ${ApiConfig.baseUrl}. '
      'Kiểm tra mạng / api.gats.vn, hoặc sửa API_BASE_URL trong .env '
      '(IP máy tính hiện tại, ví dụ http://192.168.1.45:3000).';

  static AuthException _mapApiException(ApiException error) {
    final message = error.message;
    if (error.statusCode == 401 || error.statusCode == 403) {
      return AuthException(AuthErrorCode.unauthorized, serverMessage: message);
    }
    return AuthException(AuthErrorCode.serverError, serverMessage: message);
  }
}
