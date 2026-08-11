import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:gats_academy/features/ai_coach/models/ai_coach_session.dart';
import 'package:shared_preferences/shared_preferences.dart';

abstract final class AiCoachStore {
  static const _sessionsKeyPrefix = 'ai_coach_sessions_';
  static const _activeSessionKeyPrefix = 'ai_coach_active_session_';

  static SharedPreferences? _prefs;
  static bool _memoryFallback = false;
  static final Map<String, List<AiCoachSession>> _memorySessions = {};
  static final Map<String, String?> _memoryActiveSessionId = {};

  static Future<SharedPreferences?> _getPrefs() async {
    if (_memoryFallback) return null;
    if (_prefs != null) return _prefs;
    try {
      _prefs = await SharedPreferences.getInstance();
      return _prefs;
    } on PlatformException {
      _memoryFallback = true;
      return null;
    } catch (_) {
      _memoryFallback = true;
      return null;
    }
  }

  static String _sessionsKey(String userId) => '$_sessionsKeyPrefix$userId';
  static String _activeKey(String userId) => '$_activeSessionKeyPrefix$userId';

  static Future<List<AiCoachSession>> loadSessions(String userId) async {
    final effectiveUserId = userId.isEmpty ? 'guest' : userId;
    if (_memoryFallback) {
      return _memorySessions[effectiveUserId] ?? [];
    }
    try {
      final prefs = await _getPrefs();
      if (prefs == null) return _memorySessions[effectiveUserId] ?? [];
      final raw = prefs.getString(_sessionsKey(effectiveUserId));
      if (raw == null || raw.isEmpty) return [];

      final List<dynamic> listJson = jsonDecode(raw) as List<dynamic>;
      final sessions = listJson
          .map((item) => AiCoachSession.fromJson(item as Map<String, dynamic>))
          .toList();

      // Sort by updatedAt descending (newest session first)
      sessions.sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
      _memorySessions[effectiveUserId] = sessions;
      return sessions;
    } catch (e) {
      debugPrint('AiCoachStore.loadSessions error: $e');
      return _memorySessions[effectiveUserId] ?? [];
    }
  }

  static Future<void> saveSessions(
      String userId, List<AiCoachSession> sessions) async {
    final effectiveUserId = userId.isEmpty ? 'guest' : userId;
    _memorySessions[effectiveUserId] = List.from(sessions);
    if (_memoryFallback) return;

    try {
      final prefs = await _getPrefs();
      if (prefs == null) return;
      final raw = jsonEncode(sessions.map((s) => s.toJson()).toList());
      await prefs.setString(_sessionsKey(effectiveUserId), raw);
    } catch (e) {
      debugPrint('AiCoachStore.saveSessions error: $e');
      _memoryFallback = true;
    }
  }

  static Future<String?> loadActiveSessionId(String userId) async {
    final effectiveUserId = userId.isEmpty ? 'guest' : userId;
    if (_memoryFallback) return _memoryActiveSessionId[effectiveUserId];

    try {
      final prefs = await _getPrefs();
      if (prefs == null) return _memoryActiveSessionId[effectiveUserId];
      return prefs.getString(_activeKey(effectiveUserId));
    } catch (e) {
      debugPrint('AiCoachStore.loadActiveSessionId error: $e');
      return _memoryActiveSessionId[effectiveUserId];
    }
  }

  static Future<void> saveActiveSessionId(
      String userId, String? sessionId) async {
    final effectiveUserId = userId.isEmpty ? 'guest' : userId;
    _memoryActiveSessionId[effectiveUserId] = sessionId;
    if (_memoryFallback) return;

    try {
      final prefs = await _getPrefs();
      if (prefs == null) return;
      if (sessionId == null) {
        await prefs.remove(_activeKey(effectiveUserId));
      } else {
        await prefs.setString(_activeKey(effectiveUserId), sessionId);
      }
    } catch (e) {
      debugPrint('AiCoachStore.saveActiveSessionId error: $e');
      _memoryFallback = true;
    }
  }

  static Future<void> saveSession(
      String userId, AiCoachSession session) async {
    final effectiveUserId = userId.isEmpty ? 'guest' : userId;
    final currentSessions = await loadSessions(effectiveUserId);
    final index = currentSessions.indexWhere((s) => s.id == session.id);

    if (index >= 0) {
      currentSessions[index] = session;
    } else {
      currentSessions.insert(0, session);
    }

    await saveSessions(effectiveUserId, currentSessions);
  }

  static Future<AiCoachSession> createNewSession(
    String userId, {
    String? title,
    List<AiChatMessage>? initialMessages,
  }) async {
    final effectiveUserId = userId.isEmpty ? 'guest' : userId;
    final newSession = AiCoachSession.create(
      userId: effectiveUserId,
      title: title,
      initialMessages: initialMessages,
    );

    await saveSession(effectiveUserId, newSession);
    await saveActiveSessionId(effectiveUserId, newSession.id);
    return newSession;
  }

  static Future<void> deleteSession(String userId, String sessionId) async {
    final effectiveUserId = userId.isEmpty ? 'guest' : userId;
    final currentSessions = await loadSessions(effectiveUserId);
    currentSessions.removeWhere((s) => s.id == sessionId);
    await saveSessions(effectiveUserId, currentSessions);

    final activeId = await loadActiveSessionId(effectiveUserId);
    if (activeId == sessionId) {
      final nextActive = currentSessions.isNotEmpty ? currentSessions.first.id : null;
      await saveActiveSessionId(effectiveUserId, nextActive);
    }
  }

  static Future<void> clearAllSessions(String userId) async {
    final effectiveUserId = userId.isEmpty ? 'guest' : userId;
    await saveSessions(effectiveUserId, []);
    await saveActiveSessionId(effectiveUserId, null);
  }
}
