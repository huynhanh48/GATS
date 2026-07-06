/// Thứ trong tuần kiểu Việt Nam (T2 = Thứ Hai … CN = Chủ Nhật).
abstract final class VnWeekday {
  static String label(int weekday) {
    return switch (weekday) {
      DateTime.monday => 'T2',
      DateTime.tuesday => 'T3',
      DateTime.wednesday => 'T4',
      DateTime.thursday => 'T5',
      DateTime.friday => 'T6',
      DateTime.saturday => 'T7',
      DateTime.sunday => 'CN',
      _ => '',
    };
  }

  /// Thứ Hai của tuần chứa [date] (local time).
  static DateTime mondayOfWeek(DateTime date) {
    final local = DateTime(date.year, date.month, date.day);
    return local.subtract(Duration(days: local.weekday - DateTime.monday));
  }

  /// 7 ngày T2 → CN của tuần hiện tại (theo [anchor] hoặc hôm nay).
  static List<DateTime> daysOfCurrentWeek([DateTime? anchor]) {
    final monday = mondayOfWeek(anchor ?? DateTime.now());
    return List.generate(7, (i) => monday.add(Duration(days: i)));
  }

  static String dateKey(DateTime date) {
    final d = DateTime(date.year, date.month, date.day);
    return '${d.year.toString().padLeft(4, '0')}-'
        '${d.month.toString().padLeft(2, '0')}-'
        '${d.day.toString().padLeft(2, '0')}';
  }

  static bool isSameDay(DateTime a, DateTime b) => dateKey(a) == dateKey(b);

  static bool isToday(DateTime date) => isSameDay(date, DateTime.now());
}
