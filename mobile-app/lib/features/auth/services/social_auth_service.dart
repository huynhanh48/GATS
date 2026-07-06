import 'dart:convert';
import 'dart:math';

import 'package:crypto/crypto.dart';
import 'package:flutter/foundation.dart';
import 'package:gats_academy/core/config/social_auth_config.dart';
import 'package:gats_academy/features/auth/models/auth_exception.dart';
import 'package:gats_academy/features/auth/models/auth_user.dart';
import 'package:gats_academy/features/auth/models/social_auth_credential.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';

/// Lấy id token từ Google / Apple SDK (gửi lên backend để verify).
abstract final class SocialAuthService {
  static bool _googleInitialized = false;

  static Future<void> _ensureGoogleInitialized() async {
    if (_googleInitialized) return;
    await SocialAuthConfig.ensureLoaded();
    final serverClientId = SocialAuthConfig.googleServerClientId;
    if (serverClientId == null || serverClientId.isEmpty) {
      throw const AuthException(AuthErrorCode.socialFailed);
    }
    await GoogleSignIn.instance.initialize(
      clientId: SocialAuthConfig.googleIosClientId,
      serverClientId: serverClientId,
    );
    _googleInitialized = true;
    if (kDebugMode) {
      debugPrint('SocialAuth: GoogleSignIn initialized');
      debugPrint('SocialAuth: serverClientId=${serverClientId.substring(0, 12)}...');
    }
  }

  static Future<SocialAuthCredential> signInWithGoogle() async {
    try {
      await _ensureGoogleInitialized();
      final account = await GoogleSignIn.instance.authenticate(
        scopeHint: const ['email', 'profile', 'openid'],
      );
      final idToken = account.authentication.idToken;
      if (idToken == null || idToken.isEmpty) {
        throw const AuthException(AuthErrorCode.socialTokenMissing);
      }

      if (kDebugMode) {
        debugPrint(
          'SocialAuth[google]: idToken length=${idToken.length}, email=${account.email}',
        );
      }

      return SocialAuthCredential(
        provider: AuthMethod.google,
        idToken: idToken,
        email: account.email,
        displayName: account.displayName,
      );
    } on GoogleSignInException catch (e) {
      if (kDebugMode) {
        debugPrint('SocialAuth[google] GoogleSignInException: ${e.code.name} — ${e.description}');
      }
      if (e.code == GoogleSignInExceptionCode.canceled) {
        throw const AuthException(AuthErrorCode.socialCancelled);
      }
      if (e.code == GoogleSignInExceptionCode.clientConfigurationError ||
          e.code == GoogleSignInExceptionCode.providerConfigurationError) {
        throw AuthException(
          AuthErrorCode.socialGoogleMisconfigured,
          serverMessage: e.description,
        );
      }
      throw AuthException(
        AuthErrorCode.socialFailed,
        serverMessage: e.description ?? e.code.name,
      );
    } on AuthException {
      rethrow;
    } catch (e) {
      throw AuthException(AuthErrorCode.socialFailed, serverMessage: e.toString());
    }
  }

  static Future<SocialAuthCredential> signInWithApple() async {
    try {
      final rawNonce = _generateNonce();
      final nonce = _sha256ofString(rawNonce);

      final credential = await SignInWithApple.getAppleIDCredential(
        scopes: const [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
        nonce: nonce,
      );

      final idToken = credential.identityToken;
      if (idToken == null || idToken.isEmpty) {
        throw const AuthException(AuthErrorCode.socialTokenMissing);
      }

      final given = credential.givenName?.trim() ?? '';
      final family = credential.familyName?.trim() ?? '';
      final displayName = [given, family].where((s) => s.isNotEmpty).join(' ');

      if (kDebugMode) {
        debugPrint(
          'SocialAuth[apple]: idToken length=${idToken.length}, email=${credential.email}',
        );
      }

      return SocialAuthCredential(
        provider: AuthMethod.apple,
        idToken: idToken,
        email: credential.email,
        displayName: displayName.isEmpty ? null : displayName,
        authorizationCode: credential.authorizationCode,
      );
    } on SignInWithAppleAuthorizationException catch (e) {
      if (e.code == AuthorizationErrorCode.canceled) {
        throw const AuthException(AuthErrorCode.socialCancelled);
      }
      throw AuthException(AuthErrorCode.socialFailed, serverMessage: e.message);
    } on AuthException {
      rethrow;
    } catch (e) {
      throw AuthException(AuthErrorCode.socialFailed, serverMessage: e.toString());
    }
  }

  static String _generateNonce([int length = 32]) {
    const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._';
    final random = Random.secure();
    return List.generate(length, (_) => charset[random.nextInt(charset.length)]).join();
  }

  static String _sha256ofString(String input) {
    final bytes = utf8.encode(input);
    final digest = sha256.convert(bytes);
    return digest.toString();
  }
}
