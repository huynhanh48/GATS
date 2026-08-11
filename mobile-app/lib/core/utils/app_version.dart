import 'package:package_info_plus/package_info_plus.dart';

/// App version helpers for device register + force-update gates.
abstract final class AppVersion {
  static PackageInfo? _cached;

  static Future<PackageInfo> info() async {
    return _cached ??= await PackageInfo.fromPlatform();
  }

  static Future<String> versionName() async {
    final i = await info();
    return i.version;
  }

  /// Returns negative if [current] < [minimum], 0 if equal, positive if greater.
  static int compareSemver(String current, String minimum) {
    List<int> parts(String v) {
      final cleaned = v.split('+').first.split('-').first.trim();
      return cleaned
          .split('.')
          .map((p) => int.tryParse(p.replaceAll(RegExp(r'[^0-9]'), '')) ?? 0)
          .toList();
    }

    final a = parts(current);
    final b = parts(minimum);
    final len = a.length > b.length ? a.length : b.length;
    for (var i = 0; i < len; i++) {
      final av = i < a.length ? a[i] : 0;
      final bv = i < b.length ? b[i] : 0;
      if (av != bv) return av.compareTo(bv);
    }
    return 0;
  }
}
