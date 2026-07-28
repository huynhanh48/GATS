import 'dart:convert';
import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:gats_academy/core/network/api_client.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/data/api/progress_api_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Local outbox for offline progress events → `POST /api/progress/sync`.
abstract final class ProgressOutbox {
  static const _prefsKey = 'progress_outbox_v1';
  static bool _flushing = false;

  static Future<void> enqueueCompleted({
    required String courseId,
    required String lessonId,
    required int positionSeconds,
  }) async {
    final event = {
      'eventId': _uuidV4(),
      'lessonId': lessonId,
      'courseId': courseId,
      'type': 'completed',
      'positionSeconds': positionSeconds,
      'occurredAt': DateTime.now().toUtc().toIso8601String(),
      'clientSequence': DateTime.now().millisecondsSinceEpoch,
    };
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList(_prefsKey) ?? <String>[];
    list.add(jsonEncode(event));
    await prefs.setStringList(_prefsKey, list);
    await flush();
  }

  static Future<void> flush() async {
    if (_flushing) return;
    _flushing = true;
    try {
      final token = await AuthPrefs.accessToken();
      if (token == null || token.isEmpty) return;

      final prefs = await SharedPreferences.getInstance();
      final list = prefs.getStringList(_prefsKey) ?? <String>[];
      if (list.isEmpty) return;

      final events = <Map<String, dynamic>>[];
      for (final raw in list) {
        try {
          final decoded = jsonDecode(raw);
          if (decoded is Map) {
            events.add(Map<String, dynamic>.from(decoded));
          }
        } catch (_) {
          // skip corrupt
        }
      }
      if (events.isEmpty) {
        await prefs.remove(_prefsKey);
        return;
      }

      final deviceId = await ApiClient.deviceId();
      final result = await ProgressApiService.syncEvents(
        token: token,
        deviceId: deviceId,
        events: events,
      );

      final applied = <String>{};
      for (final item in result.results) {
        if (item.status == 'applied' || item.status == 'duplicate') {
          applied.add(item.eventId);
        }
      }

      final remaining = list.where((raw) {
        try {
          final decoded = jsonDecode(raw);
          if (decoded is Map && decoded['eventId'] != null) {
            return !applied.contains(decoded['eventId'].toString());
          }
        } catch (_) {}
        return false;
      }).toList();

      if (remaining.isEmpty) {
        await prefs.remove(_prefsKey);
      } else {
        await prefs.setStringList(_prefsKey, remaining);
      }
    } catch (e) {
      debugPrint('ProgressOutbox: flush failed — $e');
    } finally {
      _flushing = false;
    }
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
