import 'package:flutter/material.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/utils/vn_weekday.dart';
import 'package:gats_academy/data/api/daily_checkin_api_service.dart';
import 'package:gats_academy/data/api/learning_charts_api_service.dart';
import 'package:gats_academy/features/ai_coach/data/ai_coach_store.dart';
import 'package:gats_academy/features/home/data/daily_check_in_store.dart';
import 'package:gats_academy/features/hub/data/learning_charts_models.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Loads Hub charts from BE; falls back to local prefs when offline.
class LearningChartsController extends ChangeNotifier {
  LearningChartsController._();
  static final LearningChartsController instance = LearningChartsController._();

  LearningChartsData _data = LearningChartsData.empty;
  bool _loading = false;
  bool _loaded = false;
  String? _error;

  LearningChartsData get data => _data;
  bool get isLoading => _loading;
  bool get isLoaded => _loaded;
  String? get error => _error;

  HubProgress get hubProgress => _data.toHubProgress();

  Future<void> ensureLoaded({
    required String lessonsLabel,
    required String flashcardsLabel,
    required String quizLabel,
    required String coachLabel,
  }) async {
    if (_loaded || _loading) return;
    await refresh(
      lessonsLabel: lessonsLabel,
      flashcardsLabel: flashcardsLabel,
      quizLabel: quizLabel,
      coachLabel: coachLabel,
    );
  }

  Future<void> refresh({
    required String lessonsLabel,
    required String flashcardsLabel,
    required String quizLabel,
    required String coachLabel,
  }) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final coachLocal = await _countCoachMessagesLastDays(7);
      final remote = await LearningChartsApiService.fetchOrNull(days: 7);
      if (remote != null) {
        _data = remote.toChartsData(
          coachLocal: coachLocal,
          lessonsLabel: lessonsLabel,
          flashcardsLabel: flashcardsLabel,
          quizLabel: quizLabel,
          coachLabel: coachLabel,
        );
      } else {
        _data = await _buildLocalFallback(
          coachLocal: coachLocal,
          lessonsLabel: lessonsLabel,
          flashcardsLabel: flashcardsLabel,
          quizLabel: quizLabel,
          coachLabel: coachLabel,
        );
      }
      _loaded = true;
    } catch (e) {
      debugPrint('LearningChartsController: $e');
      _error = e.toString();
      try {
        final coachLocal = await _countCoachMessagesLastDays(7);
        _data = await _buildLocalFallback(
          coachLocal: coachLocal,
          lessonsLabel: lessonsLabel,
          flashcardsLabel: flashcardsLabel,
          quizLabel: quizLabel,
          coachLabel: coachLabel,
        );
        _loaded = true;
      } catch (_) {
        _data = LearningChartsData.empty;
      }
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<int> _countCoachMessagesLastDays(int days) async {
    final user = await AuthPrefs.currentUser();
    if (user == null) return 0;
    final sessions = await AiCoachStore.loadSessions(user.id);
    final cutoff = DateTime.now().subtract(Duration(days: days));
    var count = 0;
    for (final session in sessions) {
      for (final msg in session.messages) {
        if (msg.isUser && msg.timestamp.isAfter(cutoff)) count++;
      }
    }
    return count;
  }

  Future<LearningChartsData> _buildLocalFallback({
    required int coachLocal,
    required String lessonsLabel,
    required String flashcardsLabel,
    required String quizLabel,
    required String coachLabel,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final now = DateTime.now();
    final dayKeys = List.generate(7, (i) {
      return DateTime(now.year, now.month, now.day)
          .subtract(Duration(days: 6 - i));
    });

    final claimed = <String>{
      ...?prefs.getStringList('daily_check_in_claimed_dates'),
      if ((prefs.getString('daily_reward_last_claimed') ?? '').isNotEmpty)
        prefs.getString('daily_reward_last_claimed')!,
    };

    final weeklyMinutes = <StudyDayStat>[];
    final weeklyXp = <XpTrendPoint>[];
    var lessons = 0;
    var flashcards = 0;
    var localXpSum = 0;

    for (final date in dayKeys) {
      final key = VnWeekday.dateKey(date);
      final label = VnWeekday.label(date.weekday);
      final reviews = prefs.getInt('daily_fc_reviews_$key') ?? 0;
      final done =
          prefs.getStringList('daily_tasks_done_$key')?.toSet() ?? {};
      final coachDone = prefs.getBool('daily_coach_done_$key') == true;
      final minutes = (reviews / 3).ceil() +
          (done.contains('read') ? 10 : 0) +
          (coachDone ? 3 : 0);
      final xp = claimed.contains(key) ? 10 : 0;
      localXpSum += xp;
      if (done.contains('read')) lessons++;
      flashcards += reviews;
      weeklyMinutes.add(StudyDayStat(label: label, minutes: minutes));
      weeklyXp.add(XpTrendPoint(label: label, xp: xp));
    }

    var totalXp = localXpSum;
    var streakDays = await DailyCheckInStore.currentStreak();
    var dailyGoal = 10;
    final status = await DailyCheckInApi.fetchOrNull();
    if (status != null) {
      totalXp = status.totalXp;
      streakDays = status.streakDays;
      dailyGoal = status.dailyGoalMinutes;
    }

    return LearningChartsData(
      totalXp: totalXp,
      streakDays: streakDays,
      dailyGoalMinutes: dailyGoal,
      weeklyMinutes: weeklyMinutes,
      weeklyXp: weeklyXp,
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
          value: 0,
          color: const Color(0xFF10B981),
        ),
        StudyActivitySlice(
          label: coachLabel,
          value: coachLocal,
          color: const Color(0xFF8E97FD),
        ),
      ],
    );
  }
}
