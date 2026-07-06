enum AuthErrorCode {
  wrongDemoPassword,
  invalidEmail,
  passwordTooShortLogin,
  passwordTooShortSignup,
  networkError,
  unauthorized,
  serverError,
  emailVerificationRequired,
  socialCancelled,
  socialTokenMissing,
  socialFailed,
  socialGoogleMisconfigured,
}

class AuthException implements Exception {
  const AuthException(this.code, {this.arg, this.serverMessage});

  final AuthErrorCode code;
  final String? arg;
  final String? serverMessage;

  @override
  String toString() => serverMessage ?? code.name;
}
