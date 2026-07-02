import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/data/api/auth_api_service.dart';
import 'package:gats_academy/data/mock/mock_accounts.dart';
import 'package:gats_academy/data/mock/mock_auth_service.dart';
import 'package:gats_academy/features/auth/models/auth_exception.dart';
import 'package:gats_academy/features/auth/models/auth_user.dart';

/// Facade auth: API thật cho email, mock cho demo/social (chưa có endpoint).
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
  }) async {
    return AuthApiService.login(email: email, password: password);
  }

  static Future<AuthSession> verifyEmail({required String token}) {
    return AuthApiService.verifyEmail(token: token);
  }

  static Future<void> persistSession(AuthSession session) {
    return AuthPrefs.saveSession(session.user, token: session.token);
  }

  static Future<AuthSession?> restoreSession() async {
    final token = await AuthPrefs.accessToken();
    if (token == null || token.isEmpty) return null;
    try {
      return AuthApiService.getMe(token: token);
    } on AuthException catch (e) {
      if (e.code == AuthErrorCode.unauthorized) {
        await AuthPrefs.signOut();
      }
      rethrow;
    }
  }

  static Future<AuthUser> signInWithDemoAccount(MockAccount account) {
    return MockAuthService.signInWithDemoAccount(account);
  }

  static Future<AuthUser> signInWithGoogle() => MockAuthService.signInWithGoogle();

  static Future<AuthUser> signInWithApple() => MockAuthService.signInWithApple();

  static Future<AuthUser> signInWithMomo() => MockAuthService.signInWithMomo();
}
