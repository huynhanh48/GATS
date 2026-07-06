import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

/// OAuth client IDs — `.env` / `--dart-define` → fallback `assets/config/google_oauth.json`.
abstract final class SocialAuthConfig {
  static const _assetPath = 'assets/config/google_oauth.json';
  static const _googleServerClientIdDefine = String.fromEnvironment('GOOGLE_SERVER_CLIENT_ID');
  static const _googleIosClientIdDefine = String.fromEnvironment('GOOGLE_IOS_CLIENT_ID');

  static String? _assetClientId;
  static String? _assetProjectId;
  static bool _initialized = false;

  static Future<void> init() async {
    if (_initialized) return;
    try {
      final raw = await rootBundle.loadString(_assetPath);
      final json = jsonDecode(raw) as Map<String, dynamic>;
      _assetClientId = (json['client_id'] as String?)?.trim();
      _assetProjectId = (json['project_id'] as String?)?.trim();
      if (kDebugMode && _assetClientId != null) {
        debugPrint('SocialAuthConfig: loaded client_id from $_assetPath');
      }
    } catch (e, st) {
      debugPrint('SocialAuthConfig: asset load failed — $e\n$st');
    }
    _initialized = true;
  }

  /// Client ID gửi lên Google Sign-In (`serverClientId` trên Android).
  static String? get googleServerClientId {
    if (_googleServerClientIdDefine.isNotEmpty) return _googleServerClientIdDefine;
    final fromEnv = dotenv.maybeGet('GOOGLE_SERVER_CLIENT_ID')?.trim();
    if (fromEnv != null && fromEnv.isNotEmpty) return fromEnv;
    return _assetClientId;
  }

  static String? get googleIosClientId {
    if (_googleIosClientIdDefine.isNotEmpty) return _googleIosClientIdDefine;
    final fromEnv = dotenv.maybeGet('GOOGLE_IOS_CLIENT_ID')?.trim();
    return fromEnv != null && fromEnv.isNotEmpty ? fromEnv : null;
  }

  static String? get googleProjectId => _assetProjectId;

  static Future<void> ensureLoaded() async {
    if (!_initialized) await init();
  }
}
