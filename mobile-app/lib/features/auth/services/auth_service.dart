import 'package:flutter/foundation.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/data/api/auth_api_service.dart';
import 'package:gats_academy/features/auth/models/auth_exception.dart';
import 'package:gats_academy/features/auth/services/mock_auth_provider.dart';
import 'package:gats_academy/features/auth/services/social_auth_service.dart';

/// Facade auth — API email/password + Google (Apple/MoMo gated).
abstract final class AuthService {
  static Future<AuthSession> registerWithEmail({
    required String email,
    required String password,
    required String displayName,
  }) {
    return AuthApiService.register(
      userName: displayName,
      email: email,
      password: password,
    );
  }

  static Future<AuthSession> signInWithEmail({
    required String email,
    required String password,
    String defaultDisplayName = 'GATS Learner',
  }) {
    return AuthApiService.login(email: email, password: password);
  }

  static Future<AuthSession> signInWithGoogle() async {
    final credential = await SocialAuthService.signInWithGoogle();
    return AuthApiService.loginWithGoogle(credential);
  }

  static Future<AuthSession> signInWithApple() async {
    if (!kDebugMode) {
      throw const AuthException(
        AuthErrorCode.socialFailed,
        serverMessage: 'Đăng nhập Apple sắp ra mắt.',
      );
    }
    final credential = await SocialAuthService.signInWithApple();
    return AuthApiService.loginWithApple(credential);
  }

  /// MoMo mock — chỉ debug.
  static Future<AuthSession> signInWithMomo() async {
    if (!kDebugMode) {
      throw const AuthException(
        AuthErrorCode.socialFailed,
        serverMessage: 'Đăng nhập MoMo sắp ra mắt.',
      );
    }
    await Future<void>.delayed(const Duration(milliseconds: 350));
    return MockAuthProvider.momoSession();
  }

  static Future<AuthSession> verifyEmail({required String token}) {
    return AuthApiService.verifyEmail(token: token);
  }

  static Future<void> persistSession(AuthSession session) {
    return AuthPrefs.saveSession(session.user, token: session.token);
  }

  static Future<void> signOut() async {
    final token = await AuthPrefs.accessToken();
    if (token != null && token.isNotEmpty) {
      await AuthApiService.logout(token: token);
    }
    await AuthPrefs.signOut();
  }

  static Future<AuthSession?> restoreSession() async {
    final token = await AuthPrefs.accessToken();
    if (token == null || token.isEmpty) return null;

    if (MockAuthProvider.isMockToken(token)) {
      await AuthPrefs.signOut();
      return null;
    }

    try {
      return AuthApiService.getMe(token: token);
    } on AuthException catch (e) {
      if (e.code == AuthErrorCode.unauthorized) {
        await AuthPrefs.signOut();
      }
      rethrow;
    }
  }
}
