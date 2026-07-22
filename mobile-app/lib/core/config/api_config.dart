import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Cấu hình API — đọc từ `.env`, override bằng `--dart-define=API_BASE_URL=...`.
///
/// Prod mặc định: `https://api.gats.vn`. Local: sửa `.env` hoặc
/// `flutter run --dart-define=API_BASE_URL=http://192.168.x.x:3000`.
abstract final class ApiConfig {
  static const _dartDefineBaseUrl = String.fromEnvironment('API_BASE_URL');
  static const _defaultBaseUrl = 'https://api.gats.vn';

  static String get baseUrl {
    if (_dartDefineBaseUrl.isNotEmpty) return _dartDefineBaseUrl;
    try {
      final fromEnv = dotenv.maybeGet('API_BASE_URL')?.trim();
      if (fromEnv != null && fromEnv.isNotEmpty) return fromEnv;
    } catch (_) {
      // dotenv not loaded (unit tests / early boot)
    }
    return _defaultBaseUrl;
  }

  static Duration get timeout => const Duration(seconds: 20);

  static void debugLogBaseUrl() {
    if (kDebugMode) {
      debugPrint('ApiConfig.baseUrl = $baseUrl');
    }
  }
}
