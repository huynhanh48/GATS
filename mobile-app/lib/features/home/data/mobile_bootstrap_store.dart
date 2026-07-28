import 'package:flutter/foundation.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/utils/app_version.dart';
import 'package:gats_academy/data/api/mobile_api_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Cached bootstrap for Home — one shot fan-out from BE.
class MobileBootstrapStore extends ChangeNotifier {
  MobileBootstrapStore._();
  static final MobileBootstrapStore instance = MobileBootstrapStore._();

  static const _cacheKey = 'mobile_bootstrap_cache_v1';

  MobileBootstrapDto? _data;
  String? _error;
  bool _loading = false;
  bool _forceUpdateRequired = false;

  MobileBootstrapDto? get data => _data;
  String? get error => _error;
  bool get isLoading => _loading;
  bool get forceUpdateRequired => _forceUpdateRequired;

  /// Feature flags from bootstrap. Missing key defaults to [defaultEnabled].
  bool isFeatureEnabled(String key, {bool defaultEnabled = true}) {
    final flags = _data?.featureFlags;
    if (flags == null || flags.isEmpty) return defaultEnabled;
    if (!flags.containsKey(key)) return defaultEnabled;
    return flags[key] == true;
  }

  Future<void> ensureLoaded() async {
    if (_data != null || _loading) return;
    await refresh();
  }

  Future<void> refresh() async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      final token = await AuthPrefs.accessToken();
      if (token == null || token.isEmpty) {
        await _hydrateCache();
        return;
      }
      final dto = await MobileApiService.bootstrap(token: token);
      _data = dto;
      await _evaluateForceUpdate(dto);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(
        _cacheKey,
        '${dto.daily?.streak ?? 0}|${dto.unreadCount}|${dto.cartItemCount}|${dto.cartTotal}|${dto.daily?.completedMinutes ?? 0}|${dto.daily?.goalMinutes ?? 10}',
      );
    } catch (e) {
      debugPrint('MobileBootstrapStore: $e');
      _error = e.toString();
      await _hydrateCache();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> _evaluateForceUpdate(MobileBootstrapDto dto) async {
    try {
      final current = await AppVersion.versionName();
      final min = defaultTargetPlatform == TargetPlatform.iOS
          ? dto.minIos
          : dto.minAndroid;
      _forceUpdateRequired = AppVersion.compareSemver(current, min) < 0;
    } catch (e) {
      debugPrint('MobileBootstrapStore: version check failed — $e');
      _forceUpdateRequired = false;
    }
  }

  Future<void> _hydrateCache() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_cacheKey);
    if (raw == null) return;
    final parts = raw.split('|');
    if (parts.length < 6) return;
    _data = MobileBootstrapDto(
      serverTime: DateTime.now().toUtc().toIso8601String(),
      daily: DailyBootstrapDto(
        goalMinutes: int.tryParse(parts[5]) ?? 10,
        completedMinutes: int.tryParse(parts[4]) ?? 0,
        streak: int.tryParse(parts[0]) ?? 0,
      ),
      unreadCount: int.tryParse(parts[1]) ?? 0,
      cartItemCount: int.tryParse(parts[2]) ?? 0,
      cartTotal: int.tryParse(parts[3]) ?? 0,
    );
  }
}
