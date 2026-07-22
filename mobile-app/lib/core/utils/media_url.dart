import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:gats_academy/core/config/api_config.dart';

/// Normalize media URLs from BE (MinIO/S3, relative paths, internal hosts)
/// so [Image.network] can load them on device — mirrors web `resolveMediaUrl`.
abstract final class MediaUrl {
  static const _dartDefineMediaBase =
      String.fromEnvironment('MEDIA_BASE_URL');

  static final _internalHostRe = RegExp(
    r'^(localhost|127\.0\.0\.1|minio|host\.docker\.internal)(:\d+)?$',
    caseSensitive: false,
  );

  static String? resolve(String? url) {
    if (url == null) return null;
    final raw = url.trim();
    if (raw.isEmpty) return null;

    if (raw.startsWith('data:') || raw.startsWith('blob:')) return raw;

    if (raw.startsWith('//')) return 'https:$raw';

    if (raw.startsWith('/')) {
      if (_isApiRelativePath(raw)) {
        return _joinOrigin(_mediaOrigin(), raw);
      }
      // Site-relative static path — prefix API origin so device can fetch it.
      return _joinOrigin(_mediaOrigin(), raw);
    }

    if (!_hasUrlScheme(raw)) {
      return _joinOrigin(_mediaOrigin(), '/${raw.replaceFirst(RegExp(r'^/+'), '')}');
    }

    try {
      final parsed = Uri.parse(raw);
      final host = parsed.host;
      if (host.isNotEmpty && _internalHostRe.hasMatch(host)) {
        return _joinOrigin(
          _mediaOrigin(),
          '${parsed.path}${parsed.hasQuery ? '?${parsed.query}' : ''}',
        );
      }
      return raw;
    } catch (_) {
      return null;
    }
  }

  static bool _isApiRelativePath(String path) {
    return path.startsWith('/api/') ||
        path.startsWith('/media/') ||
        path.startsWith('/files/') ||
        path.startsWith('/thumbnails/') ||
        path.startsWith('/uploads/');
  }

  static bool _hasUrlScheme(String value) =>
      RegExp(r'^[a-zA-Z][a-zA-Z\d+\-.]*:').hasMatch(value);

  static String _joinOrigin(String origin, String path) {
    if (origin.isEmpty) return path;
    final base = origin.replaceAll(RegExp(r'/$'), '');
    final p = path.startsWith('/') ? path : '/$path';
    return '$base$p';
  }

  static String _mediaOrigin() {
    String? candidate;
    if (_dartDefineMediaBase.isNotEmpty) {
      candidate = _dartDefineMediaBase;
    } else {
      try {
        final fromEnv = dotenv.maybeGet('MEDIA_BASE_URL')?.trim();
        if (fromEnv != null && fromEnv.isNotEmpty) {
          candidate = fromEnv;
        }
      } catch (_) {
        // dotenv not loaded (tests / early boot)
      }
      candidate ??= ApiConfig.baseUrl;
    }
    try {
      final uri = Uri.parse(candidate);
      if (!uri.hasScheme || uri.host.isEmpty) return '';
      return uri.origin;
    } catch (_) {
      return '';
    }
  }
}
