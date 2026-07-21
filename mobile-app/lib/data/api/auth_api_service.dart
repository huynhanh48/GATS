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

/// Gọi API auth theo Postman collection GATS.
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
      return _sessionFromResponse(json, fallbackEmail: email, fallbackName: userName);
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
      return _sessionFromResponse(json, fallbackEmail: email);
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
      return _sessionFromResponse(json);
    } on ApiException catch (e) {
      throw _mapApiException(e);
    } catch (_) {
      throw const AuthException(AuthErrorCode.networkError);
    }
  }

  static Future<AuthSession> loginWithSocial(SocialAuthCredential credential) async {
    final attempts = <_SocialLoginAttempt>[
      _SocialLoginAttempt(
        label: 'login+type+token',
        path: AuthApiPaths.login,
        body: {
          'type': credential.providerType,
          'token': credential.idToken,
          if (credential.email != null && credential.email!.isNotEmpty)
            'email': credential.email,
          if (credential.displayName != null && credential.displayName!.isNotEmpty)
            'user_name': credential.displayName,
        },
      ),
      _SocialLoginAttempt(
        label: 'login+type+id_token',
        path: AuthApiPaths.login,
        body: {
          'type': credential.providerType,
          'id_token': credential.idToken,
          if (credential.email != null && credential.email!.isNotEmpty)
            'email': credential.email,
        },
      ),
      _SocialLoginAttempt(
        label: 'provider path + token',
        path: credential.provider == AuthMethod.google
            ? AuthApiPaths.loginGoogle
            : AuthApiPaths.loginApple,
        body: {
          'token': credential.idToken,
          'id_token': credential.idToken,
          if (credential.authorizationCode != null)
            'authorization_code': credential.authorizationCode,
        },
      ),
    ];

    ApiException? lastError;
    for (final attempt in attempts) {
      try {
        if (kDebugMode) {
          debugPrint(
            'AuthApiService.social: try ${attempt.label} → ${attempt.path}',
          );
        }
        final json = await ApiClient.post(attempt.path, body: attempt.body);
        return _sessionFromResponse(
          json,
          fallbackEmail: credential.email,
          fallbackName: credential.displayName,
          fallbackMethod: credential.provider,
        );
      } on ApiException catch (e) {
        lastError = e;
        if (kDebugMode) {
          debugPrint(
            'AuthApiService.social: ${attempt.label} failed '
            '(${e.statusCode}) ${e.message}',
          );
        }
        if (e.statusCode == 404) continue;
        throw _mapApiException(e);
      } on http.ClientException catch (e) {
        if (kDebugMode) {
          debugPrint('AuthApiService.social: network — ${ApiConfig.baseUrl}${attempt.path} — $e');
        }
        throw AuthException(AuthErrorCode.networkError, serverMessage: _networkHint());
      } on Exception catch (e) {
        if (kDebugMode) {
          debugPrint('AuthApiService.social: error — ${ApiConfig.baseUrl}${attempt.path} — $e');
        }
        throw AuthException(AuthErrorCode.networkError, serverMessage: _networkHint());
      }
    }

    if (lastError != null) {
      throw _mapApiException(lastError);
    }
    throw const AuthException(AuthErrorCode.serverError);
  }

  static Future<AuthSession> getMe({required String token}) async {
    try {
      final json = await ApiClient.get(AuthApiPaths.me, token: token);
      return _sessionFromResponse(json, token: token);
    } on ApiException catch (e) {
      throw _mapApiException(e);
    } catch (_) {
      throw const AuthException(AuthErrorCode.networkError);
    }
  }

  static AuthSession _sessionFromResponse(
    Map<String, dynamic> json, {
    String? token,
    String? fallbackEmail,
    String? fallbackName,
    AuthMethod? fallbackMethod,
  }) {
    final payload = _unwrap(json);
    final resolvedToken = _readToken(payload) ?? token;
    if (resolvedToken == null || resolvedToken.isEmpty) {
      throw const AuthException(AuthErrorCode.emailVerificationRequired);
    }

    final userJson = _readUserMap(payload);
    final user = _userFromJson(
      userJson,
      fallbackEmail: fallbackEmail,
      fallbackName: fallbackName,
      fallbackMethod: fallbackMethod,
    );

    return AuthSession(user: user, token: resolvedToken);
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
    final displayName = (json['user_name'] as String?)?.trim().isNotEmpty == true
        ? (json['user_name'] as String).trim()
        : (json['name'] as String?)?.trim().isNotEmpty == true
            ? (json['name'] as String).trim()
            : (fallbackName ?? email.split('@').first);

    return AuthUser(
      id: id?.toString() ?? email,
      displayName: displayName.isEmpty ? 'GATS Learner' : displayName,
      email: email,
      method: _mapMethod(json['type'] as String?) ?? fallbackMethod ?? AuthMethod.email,
      role: _mapRole(json['type'] as String?),
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

  static UserRole _mapRole(String? type) {
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

class _SocialLoginAttempt {
  const _SocialLoginAttempt({
    required this.label,
    required this.path,
    required this.body,
  });

  final String label;
  final String path;
  final Map<String, dynamic> body;
}
