/// Paths khớp BE `src/common/paths/auth.ts`.
abstract final class AuthApiPaths {
  static const register = '/api/user/register';
  static const verifyEmail = '/api/user/verify-email';
  static const login = '/api/user/login';
  static const logout = '/api/user/logout';
  static const me = '/api/user/me';
  static const changePassword = '/api/user/change-password';
  static const forgotPassword = '/api/user/forgot-password';
  static const resetPassword = '/api/user/reset-password';

  /// Google OAuth — BE yêu cầu body `{ idToken }`.
  static const loginGoogle = '/api/user/auth/google';

  /// Apple — BE chưa có; giữ path để không hard-code sai khi sẵn sàng.
  static const loginApple = '/api/user/auth/apple';
  static const refresh = '/api/user/refresh';
  static const sessions = '/api/user/sessions';
  static const devices = '/api/user/devices';
}
