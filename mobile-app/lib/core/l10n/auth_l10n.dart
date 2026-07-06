import 'package:gats_academy/features/auth/models/auth_exception.dart';
import 'package:gats_academy/features/auth/models/auth_user.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/l10n/app_localizations.dart';

abstract final class AuthL10n {
  static String errorMessage(AppLocalizations l10n, AuthException error) => switch (error.code) {
        AuthErrorCode.wrongDemoPassword => l10n.authErrorWrongDemoPassword(error.arg ?? ''),
        AuthErrorCode.invalidEmail => l10n.authErrorInvalidEmail,
        AuthErrorCode.passwordTooShortLogin => l10n.authErrorPasswordTooShortLogin,
        AuthErrorCode.passwordTooShortSignup => l10n.authErrorPasswordTooShortSignup,
        AuthErrorCode.networkError => error.serverMessage ?? l10n.authErrorNetwork,
        AuthErrorCode.unauthorized => error.serverMessage ?? l10n.authErrorUnauthorized,
        AuthErrorCode.serverError => error.serverMessage ?? l10n.authErrorServer,
        AuthErrorCode.emailVerificationRequired => l10n.authRegisterSuccessVerify,
        AuthErrorCode.socialCancelled => l10n.authSocialCancelled,
        AuthErrorCode.socialTokenMissing => l10n.authSocialTokenMissing,
        AuthErrorCode.socialFailed => error.serverMessage ?? l10n.authSocialFailed,
        AuthErrorCode.socialGoogleMisconfigured => l10n.authSocialGoogleConfigHint,
      };

  static String roleLabel(AppLocalizations l10n, UserRole role) => switch (role) {
        UserRole.user => l10n.roleUser,
        UserRole.mentor => l10n.roleMentor,
        UserRole.admin => l10n.roleAdmin,
      };

  static String methodLabel(AppLocalizations l10n, AuthMethod method) => switch (method) {
        AuthMethod.email => l10n.authMethodEmail,
        AuthMethod.google => l10n.authGoogle,
        AuthMethod.apple => l10n.authApple,
        AuthMethod.momo => l10n.authMomo,
        AuthMethod.demo => l10n.authMethodDemo,
      };

  static String userIdentity(AppLocalizations l10n, AuthUser user) =>
      '${user.displayName} (${methodLabel(l10n, user.method)})';
}
