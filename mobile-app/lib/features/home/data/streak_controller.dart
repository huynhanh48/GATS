import 'package:flutter/foundation.dart';
import 'package:gats_academy/features/home/data/daily_check_in_store.dart';

/// Streak điểm danh dùng chung toàn app — Home / Daily / Report cùng một nguồn.
class StreakController extends ChangeNotifier {
  StreakController._();
  static final StreakController instance = StreakController._();

  int _streakDays = 0;
  bool _claimedToday = false;
  List<DailyCheckInDay> _week = const [];
  bool _loaded = false;

  int get streakDays => _streakDays;
  bool get claimedToday => _claimedToday;
  List<DailyCheckInDay> get week => _week;
  bool get isLoaded => _loaded;

  Future<void> ensureLoaded() async {
    if (_loaded) return;
    await refresh();
  }

  Future<void> refresh() async {
    final week = await DailyCheckInStore.loadCurrentWeek();
    final streak = await DailyCheckInStore.currentStreak();
    final claimedToday = await DailyCheckInStore.hasClaimedToday();
    _week = week;
    _streakDays = streak;
    _claimedToday = claimedToday;
    _loaded = true;
    notifyListeners();
  }

  Future<void> applyServerStreak(int streak, {bool? checkedInToday}) async {
    _streakDays = streak;
    if (checkedInToday != null) _claimedToday = checkedInToday;
    _loaded = true;
    notifyListeners();
  }

  Future<void> syncFromApi() async {
    await DailyCheckInStore.syncFromApi();
    await refresh();
  }
}
