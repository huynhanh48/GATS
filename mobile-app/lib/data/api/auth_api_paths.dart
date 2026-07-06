/// Endpoints từ `docs/API_export_json/GATS.postman_collection.json`.
abstract final class AuthApiPaths {
  static const register = '/api/user/register';
  static const verifyEmail = '/api/user/verify-email';

  /// Postman ghi nhầm URL cho login/me — dùng path chuẩn cho email/password.
  static const login = '/api/user/login';
  static const me = '/api/user/me';

  /// OAuth — backend verify `id_token` / `token` từ Google / Apple.
  static const loginGoogle = '/api/user/login/google';
  static const loginApple = '/api/user/login/apple';
}
