/// Endpoints từ `docs/API_export_json/GATS.postman_collection.json`.
abstract final class AuthApiPaths {
  static const register = '/api/user/register';
  static const verifyEmail = '/api/user/verify-email';

  /// Postman ghi nhầm URL cho login/me — dùng path chuẩn cho email/password.
  static const login = '/api/user/login';
  static const me = '/api/user/me';
}
