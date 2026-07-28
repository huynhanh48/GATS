import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';
import 'package:flutter_timezone/flutter_timezone.dart';
import 'package:gats_academy/core/network/api_client.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/services/push_token_service.dart';
import 'package:gats_academy/core/utils/app_version.dart';
import 'package:gats_academy/data/api/mobile_api_paths.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Registers this install with BE for push / session device tracking.
abstract final class DeviceRegistrationService {
  static const _serverDeviceIdKey = 'server_device_row_id';

  static Future<void> register({String? pushToken}) async {
    final token = await AuthPrefs.accessToken();
    if (token == null || token.isEmpty) return;
    try {
      final deviceUuid = await ApiClient.deviceId();
      final resolvedPush = pushToken ?? await PushTokenService.getToken();
      final appVersion = await AppVersion.versionName();
      final timezone = await _ianaTimezone();
      final json = await ApiClient.post(
        DeviceApiPaths.devices,
        token: token,
        body: {
          'deviceUuid': deviceUuid,
          'platform': _platform(),
          'pushToken': resolvedPush,
          'appVersion': appVersion,
          'timezone': timezone,
          'pushPermission': resolvedPush != null ? 'granted' : 'unknown',
        },
      );
      final data = json['data'];
      final id = data is Map ? data['id']?.toString() : null;
      if (id != null && id.isNotEmpty) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(_serverDeviceIdKey, id);
      }
    } catch (e) {
      debugPrint('DeviceRegistrationService: register failed — $e');
    }
  }

  static Future<void> unregister() async {
    final token = await AuthPrefs.accessToken();
    final prefs = await SharedPreferences.getInstance();
    final id = prefs.getString(_serverDeviceIdKey);
    if (token == null || token.isEmpty || id == null || id.isEmpty) return;
    try {
      await ApiClient.delete(DeviceApiPaths.device(id), token: token);
      await prefs.remove(_serverDeviceIdKey);
    } catch (e) {
      debugPrint('DeviceRegistrationService: unregister failed — $e');
    }
  }

  static String _platform() {
    if (kIsWeb) return 'web';
    try {
      if (Platform.isIOS) return 'ios';
      if (Platform.isAndroid) return 'android';
    } catch (_) {
      /* Platform unavailable */
    }
    return 'unknown';
  }

  static Future<String> _ianaTimezone() async {
    try {
      final name = await FlutterTimezone.getLocalTimezone();
      if (name.isNotEmpty) return name;
    } catch (_) {
      /* fall through */
    }
    return 'UTC';
  }
}
