import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/data/api/auth_api_service.dart';
import 'package:gats_academy/features/auth/models/auth_exception.dart';
import 'package:gats_academy/features/auth/services/mock_auth_provider.dart';
import 'package:gats_academy/features/auth/services/social_auth_service.dart';

/// Facade auth — API email/password + OAuth + mock MoMo (tạm).
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
    return AuthApiService.loginWithSocial(credential);
  }

  static Future<AuthSession> signInWithApple() async {
    final credential = await SocialAuthService.signInWithApple();
    return AuthApiService.loginWithSocial(credential);
  }

  /// MoMo mock — bỏ qua API, vào app ngay (dev / demo).
  static Future<AuthSession> signInWithMomo() async {
    await Future<void>.delayed(const Duration(milliseconds: 350));
    return MockAuthProvider.momoSession();
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

    final cachedUser = await AuthPrefs.currentUser();
    final mockSession = cachedUser != null
        ? MockAuthProvider.restoreFromPrefs(cachedUser, token)
        : null;
    if (mockSession != null) return mockSession;

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
