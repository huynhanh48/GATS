import 'package:gats_academy/data/api/auth_api_service.dart';
import 'package:gats_academy/features/auth/models/auth_user.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';

/// Auth giả tạm thời — không gọi API (MoMo, v.v.).
abstract final class MockAuthProvider {
  static const tokenPrefix = 'mock_session:';

  static bool isMockToken(String? token) =>
      token != null && token.startsWith(tokenPrefix);

  static AuthSession momoSession() {
    return AuthSession(
      user: const AuthUser(
        id: 'mock_user',
        displayName: 'Học viên MoMo',
        email: 'momo@gats.demo',
        method: AuthMethod.momo,
        role: UserRole.user,
      ),
      token: '${tokenPrefix}momo',
    );
  }

  static AuthSession? restoreFromPrefs(AuthUser user, String token) {
    if (!isMockToken(token)) return null;
    return AuthSession(user: user, token: token);
  }
}
