import 'package:flutter/material.dart';
import 'package:gats_academy/core/network/api_client.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/data/api/learning_charts_api_paths.dart';
import 'package:gats_academy/features/hub/data/learning_charts_models.dart';

class LearningChartsApiPayload {
  const LearningChartsApiPayload({
    required this.totalXp,
    required this.streakDays,
    required this.dailyGoalMinutes,
    required this.days,
    required this.lessons,
    required this.flashcards,
    required this.quiz,
    required this.coach,
  });

  final int totalXp;
  final int streakDays;
  final int dailyGoalMinutes;
  final List<LearningChartsDayRow> days;
  final int lessons;
  final int flashcards;
  final int quiz;
  final int coach;

  factory LearningChartsApiPayload.fromJson(Map<String, dynamic> json) {
    final data = json['data'] is Map
        ? Map<String, dynamic>.from(json['data'] as Map)
        : json;
    final mix = data['activityMix'] is Map
        ? Map<String, dynamic>.from(data['activityMix'] as Map)
        : const <String, dynamic>{};
    final rawDays = data['days'] is List ? data['days'] as List : const [];
    return LearningChartsApiPayload(
      totalXp: (data['totalXp'] as num?)?.toInt() ?? 0,
      streakDays: (data['streakDays'] as num?)?.toInt() ?? 0,
      dailyGoalMinutes: (data['dailyGoalMinutes'] as num?)?.toInt() ?? 10,
      days: [
        for (final row in rawDays)
          if (row is Map)
            LearningChartsDayRow(
              date: row['date']?.toString() ?? '',
              label: row['label']?.toString() ?? '',
              minutes: (row['minutes'] as num?)?.toInt() ?? 0,
              xp: (row['xp'] as num?)?.toInt() ?? 0,
            ),
      ],
      lessons: (mix['lessons'] as num?)?.toInt() ?? 0,
      flashcards: (mix['flashcards'] as num?)?.toInt() ?? 0,
      quiz: (mix['quiz'] as num?)?.toInt() ?? 0,
      coach: (mix['coach'] as num?)?.toInt() ?? 0,
    );
  }

  LearningChartsData toChartsData({
    required int coachLocal,
    required String lessonsLabel,
    required String flashcardsLabel,
    required String quizLabel,
    required String coachLabel,
  }) {
    final coachCount = coach > 0 ? coach : coachLocal;
    return LearningChartsData(
      totalXp: totalXp,
      streakDays: streakDays,
      dailyGoalMinutes: dailyGoalMinutes,
      weeklyMinutes: [
        for (final d in days) StudyDayStat(label: d.label, minutes: d.minutes),
      ],
      weeklyXp: [
        for (final d in days) XpTrendPoint(label: d.label, xp: d.xp),
      ],
      activityMix: [
        StudyActivitySlice(
          label: lessonsLabel,
          value: lessons,
          color: const Color(0xFF0070EB),
        ),
        StudyActivitySlice(
          label: flashcardsLabel,
          value: flashcards,
          color: const Color(0xFFFF7622),
        ),
        StudyActivitySlice(
          label: quizLabel,
          value: quiz,
          color: const Color(0xFF10B981),
        ),
        StudyActivitySlice(
          label: coachLabel,
          value: coachCount,
          color: const Color(0xFF8E97FD),
        ),
      ],
    );
  }
}

class LearningChartsDayRow {
  const LearningChartsDayRow({
    required this.date,
    required this.label,
    required this.minutes,
    required this.xp,
  });

  final String date;
  final String label;
  final int minutes;
  final int xp;
}

abstract final class LearningChartsApiService {
  static Future<LearningChartsApiPayload> fetch({
    required String token,
    int days = 7,
  }) async {
    final json = await ApiClient.get(
      LearningChartsApiPaths.charts,
      token: token,
      query: {'days': '$days'},
    );
    return LearningChartsApiPayload.fromJson(json);
  }

  static Future<LearningChartsApiPayload?> fetchOrNull({int days = 7}) async {
    final token = await AuthPrefs.accessToken();
    if (token == null || token.isEmpty) return null;
    try {
      return await fetch(token: token, days: days);
    } catch (_) {
      return null;
    }
  }
}
