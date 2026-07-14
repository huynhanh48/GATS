import 'package:flutter/foundation.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/utils/vn_weekday.dart';
import 'package:gats_academy/data/catalog/learning_activities_catalog.dart';
import 'package:gats_academy/data/mock/mock_data.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Task Hàng ngày dùng chung — badge nav sync với số việc chưa xong hôm nay.
class DailyTasksController extends ChangeNotifier {
  DailyTasksController._();
  static final DailyTasksController instance = DailyTasksController._();

  static const _completedKeyPrefix = 'daily_tasks_done_';

  List<DailyTask> _tasks = List.of(MockData.staticDailyTasks);
  bool _loaded = false;
  String? _dayKey;

  List<DailyTask> get tasks => List.unmodifiable(_tasks);
  bool get isLoaded => _loaded;

  int get pendingCount => _tasks.where((t) => !t.isDone).length;

  String? get badgeLabel {
    final n = pendingCount;
    if (!_loaded || n <= 0) return null;
    return n > 9 ? '9+' : '$n';
  }

  Future<void> ensureLoaded() async {
    final today = VnWeekday.dateKey(DateTime.now());
    if (_loaded && _dayKey == today) return;
    await refresh();
  }

  Future<void> refresh() async {
    final user = await AuthPrefs.currentUser();
    final catalogTasks = await LearningActivitiesCatalog.instance.dailyTasks(
      userId: user?.id,
      role: user?.role ?? UserRole.user,
    );

    final today = VnWeekday.dateKey(DateTime.now());
    _dayKey = today;

    final prefs = await SharedPreferences.getInstance();
    final doneIds = prefs.getStringList(_prefsKey(today))?.toSet() ?? {};

    _tasks = catalogTasks
        .map(
          (t) => DailyTask(
            id: t.id,
            title: t.title,
            isDone: doneIds.contains(t.id) || t.isDone,
            deckId: t.deckId,
            courseId: t.courseId,
            quizId: t.quizId,
            type: t.type,
          ),
        )
        .toList();

    _loaded = true;
    notifyListeners();
  }

  Future<void> setDone(String taskId, bool done) async {
    final index = _tasks.indexWhere((t) => t.id == taskId);
    if (index < 0) return;
    final task = _tasks[index];
    if (task.isDone == done) return;

    _tasks = [
      for (var i = 0; i < _tasks.length; i++)
        if (i == index)
          DailyTask(
            id: task.id,
            title: task.title,
            isDone: done,
            deckId: task.deckId,
            courseId: task.courseId,
            quizId: task.quizId,
            type: task.type,
          )
        else
          _tasks[i],
    ];
    await _persist();
    notifyListeners();
  }

  Future<void> _persist() async {
    final day = _dayKey ?? VnWeekday.dateKey(DateTime.now());
    final prefs = await SharedPreferences.getInstance();
    final doneIds = _tasks.where((t) => t.isDone).map((t) => t.id).toList();
    await prefs.setStringList(_prefsKey(day), doneIds);
  }

  static String _prefsKey(String dayKey) => '$_completedKeyPrefix$dayKey';
}
