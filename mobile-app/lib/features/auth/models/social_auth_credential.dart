import 'package:gats_academy/features/auth/models/auth_user.dart';

/// Token + metadata từ Google / Apple SDK, gửi lên backend để verify.
class SocialAuthCredential {
  const SocialAuthCredential({
    required this.provider,
    required this.idToken,
    this.accessToken,
    this.email,
    this.displayName,
    this.authorizationCode,
  });

  final AuthMethod provider;
  final String idToken;
  final String? accessToken;
  final String? email;
  final String? displayName;
  final String? authorizationCode;

  String get providerType => switch (provider) {
        AuthMethod.google => 'google',
        AuthMethod.apple => 'apple',
        _ => 'default',
      };
}
