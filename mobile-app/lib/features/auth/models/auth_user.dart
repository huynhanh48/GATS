import 'package:gats_academy/features/auth/models/user_role.dart';

enum AuthMethod { email, google, apple, momo, demo }

class AuthUser {
  const AuthUser({
    required this.id,
    required this.displayName,
    required this.email,
    required this.method,
    required this.role,
  });

  final String id;
  final String displayName;
  final String email;
  final AuthMethod method;
  final UserRole role;

  String get methodLabel => switch (method) {
        AuthMethod.email => 'Email',
        AuthMethod.google => 'Google',
        AuthMethod.apple => 'Apple',
        AuthMethod.momo => 'MoMo',
        AuthMethod.demo => 'Demo',
      };

  String get roleLabel => role.label;
}
