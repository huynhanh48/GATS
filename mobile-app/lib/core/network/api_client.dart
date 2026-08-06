import 'dart:convert';
import 'dart:io';
import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:gats_academy/core/config/api_config.dart';
import 'package:gats_academy/core/network/api_exception.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/data/api/auth_api_paths.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

/// HTTP client with silent 401→refresh and mobile app metadata headers.
abstract final class ApiClient {
  static Future<String>? _refreshInFlight;
  static const _deviceIdKey = 'mobile_device_id';

  static Uri _uri(String path, [Map<String, String>? query]) {
    final base = Uri.parse('${ApiConfig.baseUrl}$path');
    if (query == null || query.isEmpty) return base;
    return base.replace(queryParameters: {
      ...base.queryParameters,
      ...query,
    });
  }

  static Future<String> deviceId() async {
    final prefs = await SharedPreferences.getInstance();
    final existing = prefs.getString(_deviceIdKey);
    if (existing != null && existing.isNotEmpty) return existing;
    final id = _uuidV4();
    await prefs.setString(_deviceIdKey, id);
    return id;
  }

  static Future<Map<String, String>> _headers({
    String? token,
    Map<String, String>? extra,
  }) async {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-App-Platform': Platform.isIOS
          ? 'ios'
          : Platform.isAndroid
              ? 'android'
              : 'unknown',
      'X-App-Version': '1.0.0',
      'X-Device-Id': await deviceId(),
      'X-Locale': Platform.localeName,
      'X-Timezone': _ianaTimezone(),
    };
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    if (extra != null) headers.addAll(extra);
    return headers;
  }

  static Future<Map<String, dynamic>> get(
    String path, {
    String? token,
    Map<String, String>? query,
    Map<String, String>? headers,
  }) {
    return _send(
      method: 'GET',
      path: path,
      token: token,
      query: query,
      headers: headers,
    );
  }

  static Future<Map<String, dynamic>> post(
    String path, {
    Map<String, dynamic>? body,
    String? token,
    Map<String, String>? headers,
    Duration? timeout,
  }) {
    return _send(
      method: 'POST',
      path: path,
      token: token,
      body: body,
      headers: headers,
      timeout: timeout,
    );
  }

  static Future<Map<String, dynamic>> put(
    String path, {
    Map<String, dynamic>? body,
    String? token,
    Map<String, String>? headers,
  }) {
    return _send(
      method: 'PUT',
      path: path,
      token: token,
      body: body,
      headers: headers,
    );
  }

  static Future<Map<String, dynamic>> patch(
    String path, {
    Map<String, dynamic>? body,
    String? token,
    Map<String, String>? headers,
  }) {
    return _send(
      method: 'PATCH',
      path: path,
      token: token,
      body: body,
      headers: headers,
    );
  }

  static Future<Map<String, dynamic>> delete(
    String path, {
    String? token,
    Map<String, String>? headers,
  }) {
    return _send(
      method: 'DELETE',
      path: path,
      token: token,
      headers: headers,
    );
  }

  static Future<Map<String, dynamic>> _send({
    required String method,
    required String path,
    String? token,
    Map<String, dynamic>? body,
    Map<String, String>? query,
    Map<String, String>? headers,
    Duration? timeout,
  }) async {
    final requestTimeout = timeout ?? ApiConfig.timeout;
    Future<http.Response> doRequest(String? authToken) async {
      final h = await _headers(token: authToken, extra: headers);
      final uri = _uri(path, query);
      final encoded = body == null ? null : jsonEncode(body);
      switch (method) {
        case 'GET':
          return http.get(uri, headers: h);
        case 'POST':
          return http.post(uri, headers: h, body: encoded);
        case 'PUT':
          return http.put(uri, headers: h, body: encoded);
        case 'PATCH':
          return http.patch(uri, headers: h, body: encoded);
        case 'DELETE':
          return http.delete(uri, headers: h);
        default:
          throw StateError('Unsupported method $method');
      }
    }

    var response = await doRequest(token).timeout(requestTimeout);
    if (response.statusCode == 401 &&
        token != null &&
        token.isNotEmpty &&
        path != AuthApiPaths.refresh) {
      final renewed = await _tryRefresh();
      if (renewed != null) {
        response = await doRequest(renewed).timeout(requestTimeout);
      }
    }
    return _decodeObject(response);
  }

  /// Refresh once; concurrent 401s share the same in-flight call.
  static Future<String?> _tryRefresh() async {
    if (_refreshInFlight != null) {
      try {
        return await _refreshInFlight;
      } catch (_) {
        return null;
      }
    }
    final refresh = await AuthPrefs.refreshToken();
    if (refresh == null || refresh.isEmpty) return null;

    _refreshInFlight = () async {
      final response = await http
          .post(
            _uri(AuthApiPaths.refresh),
            headers: await _headers(),
            body: jsonEncode({'refreshToken': refresh}),
          )
          .timeout(ApiConfig.timeout);
      final json = _decodeObject(response);
      final data = json['data'] is Map
          ? Map<String, dynamic>.from(json['data'] as Map)
          : json;
      final access =
          (data['accessToken'] ?? data['token'] ?? json['accessToken'])
              ?.toString();
      final nextRefresh = data['refreshToken']?.toString();
      if (access == null || access.isEmpty) {
        throw const ApiException('Refresh failed', statusCode: 401);
      }
      await AuthPrefs.updateTokens(
        accessToken: access,
        refreshToken: nextRefresh,
      );
      return access;
    }();

    try {
      return await _refreshInFlight;
    } catch (e) {
      debugPrint('ApiClient: silent refresh failed — $e');
      await AuthPrefs.signOut();
      return null;
    } finally {
      _refreshInFlight = null;
    }
  }

  static Map<String, dynamic> _decodeObject(http.Response response) {
    Map<String, dynamic>? json;
    if (response.body.isNotEmpty) {
      final decoded = jsonDecode(response.body);
      if (decoded is Map<String, dynamic>) {
        json = decoded;
      } else if (decoded is Map) {
        json = Map<String, dynamic>.from(decoded);
      }
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return json ?? <String, dynamic>{};
    }

    final message = _readMessage(json) ?? 'HTTP ${response.statusCode}';
    throw ApiException(message, statusCode: response.statusCode, body: json);
  }

  static String? _readMessage(Map<String, dynamic>? json) {
    if (json == null) return null;
    final err = json['error'];
    if (err is Map && err['message'] is String) {
      return err['message'] as String;
    }
    for (final key in ['message', 'error', 'detail']) {
      final value = json[key];
      if (value is String && value.isNotEmpty) return value;
    }
    return null;
  }

  /// Prefer IANA zone for BE date bucketing; fall back for VN devices.
  static String _ianaTimezone() {
    final name = DateTime.now().timeZoneName;
    if (name.contains('/')) return name;
    // Android often returns "ICT" / "SE Asia Standard Time"
    if (name == 'ICT' ||
        name.toLowerCase().contains('indochina') ||
        name.toLowerCase().contains('se asia')) {
      return 'Asia/Ho_Chi_Minh';
    }
    return 'Asia/Ho_Chi_Minh';
  }

  static String _uuidV4() {
    final r = Random.secure();
    final bytes = List<int>.generate(16, (_) => r.nextInt(256));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    final h = bytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join();
    return '${h.substring(0, 8)}-${h.substring(8, 12)}-${h.substring(12, 16)}-'
        '${h.substring(16, 20)}-${h.substring(20)}';
  }
}
