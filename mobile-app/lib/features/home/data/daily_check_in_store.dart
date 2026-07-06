import 'package:gats_academy/core/utils/vn_weekday.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Một ô trong lịch điểm danh tuần — gắn với ngày thật.
class DailyCheckInDay {
  const DailyCheckInDay({
    required this.date,
    required this.weekdayLabel,
    required this.xp,
    required this.isToday,
    required this.isPast,
    required this.isFuture,
    required this.claimed,
  });

  final DateTime date;
  final String weekdayLabel;
  final int xp;
  final bool isToday;
  final bool isPast;
  final bool isFuture;
  final bool claimed;
}

/// XP theo vị trí trong tuần (T2 → CN).
const _weeklyXp = [5, 5, 10, 5, 15, 5, 25];

abstract final class DailyCheckInStore {
  static const _claimedDatesKey = 'daily_check_in_claimed_dates';
  static const _legacyLastClaimedKey = 'daily_reward_last_claimed';

  static Future<Set<String>> _claimedDateKeys() async {
    final prefs = await SharedPreferences.getInstance();
    final keys = <String>{};

    final legacy = prefs.getString(_legacyLastClaimedKey);
    if (legacy != null && legacy.isNotEmpty) {
      keys.add(legacy);
    }

    for (final raw in prefs.getStringList(_claimedDatesKey) ?? const []) {
      if (raw.isNotEmpty) keys.add(raw);
    }
    return keys;
  }

  static Future<bool> hasClaimedToday() async {
    final keys = await _claimedDateKeys();
    return keys.contains(VnWeekday.dateKey(DateTime.now()));
  }

  /// Lịch tuần hiện tại theo giờ máy.
  static Future<List<DailyCheckInDay>> loadCurrentWeek() async {
    final claimed = await _claimedDateKeys();
    final now = DateTime.now();
    final todayKey = VnWeekday.dateKey(now);

    return VnWeekday.daysOfCurrentWeek(now).asMap().entries.map((entry) {
      final date = entry.value;
      final key = VnWeekday.dateKey(date);
      final isToday = key == todayKey;

      return DailyCheckInDay(
        date: date,
        weekdayLabel: VnWeekday.label(date.weekday),
        xp: _weeklyXp[entry.key],
        isToday: isToday,
        isPast: date.isBefore(DateTime(now.year, now.month, now.day)),
        isFuture: date.isAfter(DateTime(now.year, now.month, now.day)),
        claimed: claimed.contains(key),
      );
    }).toList();
  }

  static Future<int> claimToday() async {
    final prefs = await SharedPreferences.getInstance();
    final today = DateTime.now();
    final todayKey = VnWeekday.dateKey(today);
    final weekDays = VnWeekday.daysOfCurrentWeek(today);
    final index = weekDays.indexWhere((d) => VnWeekday.dateKey(d) == todayKey);
    final xp = index >= 0 ? _weeklyXp[index] : _weeklyXp.first;

    final claimed = await _claimedDateKeys();
    claimed.add(todayKey);

    // Giữ tối đa 14 ngày gần nhất.
    final sorted = claimed.toList()..sort();
    final trimmed = sorted.length > 14 ? sorted.sublist(sorted.length - 14) : sorted;

    await prefs.setStringList(_claimedDatesKey, trimmed);
    await prefs.setString(_legacyLastClaimedKey, todayKey);

    return xp;
  }

  static DailyCheckInDay? todaySlot(List<DailyCheckInDay> week) {
    for (final day in week) {
      if (day.isToday) return day;
    }
    return null;
  }
}
