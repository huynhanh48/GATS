import 'dart:convert';

import 'package:gats_academy/core/config/api_config.dart';
import 'package:gats_academy/core/network/api_exception.dart';
import 'package:http/http.dart' as http;

abstract final class ApiClient {
  static Uri _uri(String path, [Map<String, String>? query]) {
    final base = Uri.parse('${ApiConfig.baseUrl}$path');
    if (query == null || query.isEmpty) return base;
    return base.replace(queryParameters: {
      ...base.queryParameters,
      ...query,
    });
  }

  static Map<String, String> _headers({String? token, Map<String, String>? extra}) {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
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
  }) async {
    final response = await http
        .get(_uri(path, query), headers: _headers(token: token, extra: headers))
        .timeout(ApiConfig.timeout);
    return _decodeObject(response);
  }

  static Future<Map<String, dynamic>> post(
    String path, {
    Map<String, dynamic>? body,
    String? token,
    Map<String, String>? headers,
  }) async {
    final response = await http
        .post(
          _uri(path),
          headers: _headers(token: token, extra: headers),
          body: body == null ? null : jsonEncode(body),
        )
        .timeout(ApiConfig.timeout);
    return _decodeObject(response);
  }

  static Future<Map<String, dynamic>> put(
    String path, {
    Map<String, dynamic>? body,
    String? token,
    Map<String, String>? headers,
  }) async {
    final response = await http
        .put(
          _uri(path),
          headers: _headers(token: token, extra: headers),
          body: body == null ? null : jsonEncode(body),
        )
        .timeout(ApiConfig.timeout);
    return _decodeObject(response);
  }

  static Future<Map<String, dynamic>> delete(
    String path, {
    String? token,
    Map<String, String>? headers,
  }) async {
    final response = await http
        .delete(_uri(path), headers: _headers(token: token, extra: headers))
        .timeout(ApiConfig.timeout);
    return _decodeObject(response);
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
    for (final key in ['message', 'error', 'detail']) {
      final value = json[key];
      if (value is String && value.isNotEmpty) return value;
    }
    return null;
  }
}
