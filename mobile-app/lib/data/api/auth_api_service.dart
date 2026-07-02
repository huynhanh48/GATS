import 'package:gats_academy/core/network/api_client.dart';
import 'package:gats_academy/core/network/api_exception.dart';
import 'package:gats_academy/data/api/auth_api_paths.dart';
import 'package:gats_academy/features/auth/models/auth_exception.dart';
import 'package:gats_academy/features/auth/models/auth_user.dart';
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
      method: AuthMethod.email,
      role: _mapRole(json['type'] as String?),
    );
  }

  static UserRole _mapRole(String? type) {
    return switch (type?.toLowerCase()) {
      'mentor' => UserRole.mentor,
      'admin' => UserRole.admin,
      _ => UserRole.user,
    };
  }

  static AuthException _mapApiException(ApiException error) {
    final message = error.message;
    if (error.statusCode == 401 || error.statusCode == 403) {
      return AuthException(AuthErrorCode.unauthorized, serverMessage: message);
    }
    return AuthException(AuthErrorCode.serverError, serverMessage: message);
  }
}
