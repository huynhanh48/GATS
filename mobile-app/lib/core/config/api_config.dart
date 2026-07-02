import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Cấu hình API — đọc từ `.env`, override bằng `--dart-define=API_BASE_URL=...`.
abstract final class ApiConfig {
  static const _dartDefineBaseUrl = String.fromEnvironment('API_BASE_URL');
  static const _defaultBaseUrl = 'http://192.168.1.5:3000';

  static String get baseUrl {
    if (_dartDefineBaseUrl.isNotEmpty) return _dartDefineBaseUrl;
    final fromEnv = dotenv.maybeGet('API_BASE_URL')?.trim();
    if (fromEnv != null && fromEnv.isNotEmpty) return fromEnv;
    return _defaultBaseUrl;
  }

  static Duration get timeout => const Duration(seconds: 20);

  static void debugLogBaseUrl() {
    if (kDebugMode) {
      debugPrint('ApiConfig.baseUrl = $baseUrl');
    }
  }
}
