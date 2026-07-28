import 'package:flutter/foundation.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/services/device_registration_service.dart';
import 'package:gats_academy/data/api/auth_api_service.dart';
import 'package:gats_academy/features/auth/models/auth_exception.dart';
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

  static Future<AuthSession> signInWithMomo() async {
    throw const AuthException(
      AuthErrorCode.socialFailed,
      serverMessage: 'Đăng nhập MoMo chưa được hỗ trợ.',
    );
  }

  static Future<AuthSession> verifyEmail({required String token}) {
    return AuthApiService.verifyEmail(token: token);
  }

  static Future<void> persistSession(AuthSession session) async {
    await AuthPrefs.saveSession(
      session.user,
      token: session.token,
      refreshToken: session.refreshToken,
    );
    await DeviceRegistrationService.register();
  }

  static Future<void> signOut() async {
    await DeviceRegistrationService.unregister();
    final token = await AuthPrefs.accessToken();
    if (token != null && token.isNotEmpty) {
      await AuthApiService.logout(token: token);
    }
    await AuthPrefs.signOut();
  }

  static Future<AuthSession?> restoreSession() async {
    final token = await AuthPrefs.accessToken();
    if (token == null || token.isEmpty) return null;

    try {
      return await AuthApiService.getMe(token: token);
    } on AuthException catch (e) {
      if (e.code == AuthErrorCode.unauthorized) {
        final refresh = await AuthPrefs.refreshToken();
        if (refresh != null && refresh.isNotEmpty) {
          try {
            final renewed = await AuthApiService.refresh(refreshToken: refresh);
            await persistSession(renewed);
            return renewed;
          } catch (_) {
            await AuthPrefs.signOut();
            return null;
          }
        } else {
          await AuthPrefs.signOut();
          return null;
        }
      }
      rethrow;
    }
  }
}
