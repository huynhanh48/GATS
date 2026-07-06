/// Trạng thái điểm danh từ API.
class DailyCheckInDay {
  const DailyCheckInDay({
    required this.day,
    required this.xp,
    required this.claimed,
    this.isToday = false,
  });

  final int day;
  final int xp;
  final bool claimed;
  final bool isToday;

  DailyCheckInDay copyWith({bool? claimed, bool? isToday}) {
    return DailyCheckInDay(
      day: day,
      xp: xp,
      claimed: claimed ?? this.claimed,
      isToday: isToday ?? this.isToday,
    );
  }
}

class DailyCheckInStatus {
  const DailyCheckInStatus({
    required this.canClaim,
    required this.claimedToday,
    required this.streak,
    required this.todayXp,
    required this.week,
  });

  final bool canClaim;
  final bool claimedToday;
  final int streak;
  final int todayXp;
  final List<DailyCheckInDay> week;

  int? get todayIndex {
    final index = week.indexWhere((d) => d.isToday);
    if (index >= 0) return index;
    return week.indexWhere((d) => !d.claimed);
  }

  DailyCheckInDay? get todayReward {
    final index = todayIndex;
    if (index == null || index < 0 || index >= week.length) return null;
    return week[index];
  }
}

class DailyCheckInClaimResult {
  const DailyCheckInClaimResult({
    required this.xp,
    required this.streak,
  });

  final int xp;
  final int streak;
}
