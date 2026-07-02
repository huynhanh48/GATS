import 'package:gats_academy/data/mock/mock_accounts.dart';
import 'package:gats_academy/features/auth/models/auth_user.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';

enum AuthErrorCode {
  wrongDemoPassword,
  invalidEmail,
  passwordTooShortLogin,
  passwordTooShortSignup,
}

/// Auth giả — 3 tài khoản demo theo role + email tùy ý (mặc định học viên).
abstract final class MockAuthService {
  static Future<void> _delay() => Future<void>.delayed(const Duration(milliseconds: 700));

  static Future<AuthUser> signInWithDemoAccount(MockAccount account) async {
    await _delay();
    return AuthUser(
      id: account.id,
      displayName: account.displayName,
      email: account.email,
      method: AuthMethod.demo,
      role: account.role,
    );
  }

  static Future<AuthUser> signInWithEmail({
    required String email,
    required String password,
    String defaultDisplayName = 'GATS Learner',
  }) async {
    await _delay();
    final demo = MockAccounts.byEmail(email);
    if (demo != null) {
      if (password != demo.password) {
        throw AuthException(
          AuthErrorCode.wrongDemoPassword,
          arg: MockAccounts.demoPassword,
        );
      }
      return signInWithDemoAccount(demo);
    }
    if (email.trim().isEmpty || !email.contains('@')) {
      throw const AuthException(AuthErrorCode.invalidEmail);
    }
    if (password.length < 4) {
      throw const AuthException(AuthErrorCode.passwordTooShortLogin);
    }
    final name = email.split('@').first;
    return AuthUser(
      id: 'email_${email.hashCode}',
      displayName: name.isEmpty ? defaultDisplayName : name,
      email: email.trim(),
      method: AuthMethod.email,
      role: UserRole.user,
    );
  }

  static Future<AuthUser> signUpWithEmail({
    required String email,
    required String password,
    required String displayName,
  }) async {
    await _delay();
    if (password.length < 6) {
      throw const AuthException(AuthErrorCode.passwordTooShortSignup);
    }
    return signInWithEmail(
      email: email,
      password: password,
      defaultDisplayName: displayName.trim().isEmpty ? 'GATS Learner' : displayName.trim(),
    );
  }

  static Future<AuthUser> signInWithGoogle() async {
    await _delay();
    return signInWithDemoAccount(MockAccounts.user);
  }

  static Future<AuthUser> signInWithApple() async {
    await _delay();
    return signInWithDemoAccount(MockAccounts.user);
  }

  static Future<AuthUser> signInWithMomo() async {
    await _delay();
    final user = await signInWithDemoAccount(MockAccounts.user);
    return AuthUser(
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      method: AuthMethod.momo,
      role: user.role,
    );
  }
}

class AuthException implements Exception {
  const AuthException(this.code, {this.arg});

  final AuthErrorCode code;
  final String? arg;

  @override
  String toString() => code.name;
}
