import 'package:gats_academy/features/auth/models/user_role.dart';

class MockAccount {
  const MockAccount({
    required this.id,
    required this.email,
    required this.password,
    required this.displayName,
    required this.role,
  });

  final String id;
  final String email;
  final String password;
  final String displayName;
  final UserRole role;
}

abstract final class MockAccounts {
  static const demoPassword = 'demo';

  static const user = MockAccount(
    id: 'mock_user',
    email: 'user@gats.demo',
    password: demoPassword,
    displayName: 'Học viên Demo',
    role: UserRole.user,
  );

  static const mentor = MockAccount(
    id: 'mock_mentor',
    email: 'mentor@gats.demo',
    password: demoPassword,
    displayName: 'Mentor Demo',
    role: UserRole.mentor,
  );

  static const admin = MockAccount(
    id: 'mock_admin',
    email: 'admin@gats.demo',
    password: demoPassword,
    displayName: 'Admin Demo',
    role: UserRole.admin,
  );

  static const all = [user, mentor, admin];

  static MockAccount? byEmail(String email) {
    final normalized = email.trim().toLowerCase();
    for (final account in all) {
      if (account.email.toLowerCase() == normalized) return account;
    }
    return null;
  }
}
