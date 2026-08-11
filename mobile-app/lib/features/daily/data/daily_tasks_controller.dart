import 'dart:math' as math;

import 'package:flutter/foundation.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/utils/vn_weekday.dart';
import 'package:gats_academy/data/api/flashcard_api_service.dart';
import 'package:gats_academy/data/api/progress_api_service.dart';
import 'package:gats_academy/data/mock/mock_data.dart';
import 'package:gats_academy/features/course/course_module.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Daily goals derived from real activity (due cards, next lesson, coach chat).
class DailyTasksController extends ChangeNotifier {
  DailyTasksController._();
  static final DailyTasksController instance = DailyTasksController._();

  static const flashcardId = 'flashcard';
  static const readId = 'read';
  static const coachId = 'coach';
  static const defaultFlashcardTarget = 5;

  static const _completedKeyPrefix = 'daily_tasks_done_';
  static const _reviewsKeyPrefix = 'daily_fc_reviews_';
  static const _coachKeyPrefix = 'daily_coach_done_';

  List<DailyTask> _tasks = List.of(MockData.staticDailyTasks);
  List<FlashcardItem> _dueCards = const [];
  bool _loaded = false;
  String? _dayKey;

  List<DailyTask> get tasks => List.unmodifiable(_tasks);
  List<FlashcardItem> get dueCards => List.unmodifiable(_dueCards);
  bool get isLoaded => _loaded;

  int get completedCount => _tasks.where((t) => t.isDone).length;
  int get pendingCount => _tasks.where((t) => !t.isDone).length;

  String? get badgeLabel {
    final n = pendingCount;
    if (!_loaded || n <= 0) return null;
    return n > 9 ? '9+' : '$n';
  }

  DailyTask? taskById(String id) {
    for (final t in _tasks) {
      if (t.id == id) return t;
    }
    return null;
  }

  Future<void> ensureLoaded() async {
    final today = VnWeekday.dateKey(DateTime.now());
    if (_loaded && _dayKey == today) return;
    await refresh();
  }

  Future<void> refresh() async {
    final today = VnWeekday.dateKey(DateTime.now());
    _dayKey = today;

    final prefs = await SharedPreferences.getInstance();
    final doneIds = prefs.getStringList(_prefsKey(today))?.toSet() ?? {};
    final reviewsToday = prefs.getInt(_reviewsKey(today)) ?? 0;
    final coachPrefDone = prefs.getBool(_coachKey(today)) == true;

    final token = await AuthPrefs.accessToken();
    final user = await AuthPrefs.currentUser();

    var dueCards = <FlashcardItem>[];
    var dueCount = 0;
    String? flashcardSubtitle;

    String? readCourseId;
    String? readLessonId;
    String? readTitle;
    String? readSubtitle;
    var readComplete = false;

    if (token != null && token.isNotEmpty) {
      try {
        dueCards = await FlashcardApiService.due(token: token, limit: 30);
        dueCount = dueCards.length;
        if (dueCards.isNotEmpty) {
          final first = dueCards.first;
          flashcardSubtitle = first.deckTitle?.trim().isNotEmpty == true
              ? first.deckTitle
              : (first.courseTitle?.trim().isNotEmpty == true
                  ? first.courseTitle
                  : '$dueCount thẻ đến hạn');
        } else {
          flashcardSubtitle = 'Không có thẻ đến hạn — mở để ôn lại';
        }
      } catch (e) {
        debugPrint('DailyTasksController: due failed — $e');
        flashcardSubtitle = 'Không tải được thẻ — thử lại sau';
      }

      if (user != null) {
        try {
          final next = await _resolveNextLesson(
            userId: user.id,
            token: token,
          );
          if (next != null) {
            readCourseId = next.courseId;
            readLessonId = next.lessonId;
            readTitle = next.lessonTitle;
            readSubtitle = next.courseTitle;
            readComplete = next.isCompleted ||
                doneIds.contains(readId) ||
                next.completedIds.contains(next.lessonId);
          } else {
            readSubtitle = 'Đăng ký khóa học để có bài tiếp theo';
          }
        } catch (e) {
          debugPrint('DailyTasksController: next lesson failed — $e');
          readSubtitle = 'Không tải được bài học — thử lại sau';
        }
      } else {
        readSubtitle = 'Đăng nhập để đồng bộ bài học';
      }
    } else {
      flashcardSubtitle = 'Đăng nhập để ôn thẻ đến hạn';
      readSubtitle = 'Đăng nhập để học bài tiếp theo';
    }

    _dueCards = dueCards;

    final fcTarget = dueCount <= 0
        ? defaultFlashcardTarget
        : math.min(dueCount, defaultFlashcardTarget);
    final fcProgress = math.min(reviewsToday, fcTarget);
    final fcDone =
        doneIds.contains(flashcardId) || (dueCount > 0 && fcProgress >= fcTarget);

    final coachDone = coachPrefDone || doneIds.contains(coachId);

    _tasks = [
      DailyTask(
        id: flashcardId,
        title: dueCount <= 0
            ? 'Ôn flashcard hôm nay'
            : 'Ôn $fcTarget thẻ đến hạn',
        subtitle: flashcardSubtitle,
        isDone: fcDone,
        type: 'flashcard',
        targetCount: fcTarget,
        progressCount: fcProgress,
      ),
      DailyTask(
        id: readId,
        title: readTitle != null ? 'Học tiếp: $readTitle' : 'Học bài tiếp theo',
        subtitle: readSubtitle,
        isDone: readLessonId != null &&
            (readComplete || doneIds.contains(readId)),
        type: 'read',
        courseId: readCourseId,
        lessonId: readLessonId,
      ),
      DailyTask(
        id: coachId,
        title: 'Hỏi AI Coach 1 câu',
        subtitle: 'Gửi một tin nhắn để hoàn thành',
        isDone: coachDone,
        type: 'coach',
      ),
    ];

    _loaded = true;
    await _persist();
    notifyListeners();
  }

  /// After a finished study session — records reviews and may complete goal.
  Future<void> completeFlashcardSession({required int reviewedCount}) async {
    final today = _dayKey ?? VnWeekday.dateKey(DateTime.now());
    final prefs = await SharedPreferences.getInstance();
    final prev = prefs.getInt(_reviewsKey(today)) ?? 0;
    final next = prev + reviewedCount;
    await prefs.setInt(_reviewsKey(today), next);

    final task = taskById(flashcardId);
    final target = task?.targetCount ?? defaultFlashcardTarget;
    if (next >= target || reviewedCount > 0) {
      await _setDoneInternal(flashcardId, true);
    } else {
      await refresh();
    }
  }

  Future<void> markCoachDoneToday() async {
    final today = VnWeekday.dateKey(DateTime.now());
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_coachKey(today), true);
    await _setDoneInternal(coachId, true);
  }

  Future<void> markReadDoneIfLesson(String lessonId) async {
    final task = taskById(readId);
    if (task == null || task.lessonId != lessonId) {
      await refresh();
      return;
    }
    await _setDoneInternal(readId, true);
  }

  /// Internal only — core goals are not toggled by checkbox.
  Future<void> setDone(String taskId, bool done) =>
      _setDoneInternal(taskId, done);

  Future<void> _setDoneInternal(String taskId, bool done) async {
    final index = _tasks.indexWhere((t) => t.id == taskId);
    if (index < 0) return;
    final task = _tasks[index];
    if (task.isDone == done) {
      notifyListeners();
      return;
    }
    _tasks = [
      for (var i = 0; i < _tasks.length; i++)
        if (i == index) task.copyWith(isDone: done) else _tasks[i],
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

  Future<_NextLesson?> _resolveNextLesson({
    required String userId,
    required String token,
  }) async {
    final enrolled = CourseModule.repository.listOwned(userId: userId);
    if (enrolled.isEmpty) return null;

    // Prefer in-progress course, else first owned.
    final ordered = [
      ...enrolled.where((c) => c.progress > 0 && c.progress < 1),
      ...enrolled.where((c) => c.progress <= 0),
      ...enrolled.where((c) => c.progress >= 1),
    ];
    final seen = <String>{};
    for (final item in ordered) {
      if (!seen.add(item.id)) continue;
      await CourseModule.repository.ensureDetailLoaded(item.id);
      final course = CourseModule.repository.getCourse(item.id);
      if (course == null) continue;

      CourseProgressDto progress;
      try {
        progress = await ProgressApiService.getCourseProgress(
          courseId: item.id,
          token: token,
        );
      } catch (_) {
        continue;
      }

      final nextId = progress.nextLessonId;
      CourseLecture? lecture;
      if (nextId != null && nextId.isNotEmpty) {
        for (final l in course.lectures) {
          if (l.id == nextId) {
            lecture = l;
            break;
          }
        }
      }
      if (lecture == null) {
        for (final l in course.lectures) {
          if (l.isPublished &&
              !progress.completedLessonIds.contains(l.id)) {
            lecture = l;
            break;
          }
        }
      }
      if (lecture == null && course.lectures.isNotEmpty) {
        lecture = course.lectures.first;
      }
      if (lecture == null) continue;

      return _NextLesson(
        courseId: course.id,
        courseTitle: course.title,
        lessonId: lecture.id,
        lessonTitle: lecture.title,
        isCompleted: progress.completedLessonIds.contains(lecture.id),
        completedIds: progress.completedLessonIds,
      );
    }
    return null;
  }

  static String _prefsKey(String dayKey) => '$_completedKeyPrefix$dayKey';
  static String _reviewsKey(String dayKey) => '$_reviewsKeyPrefix$dayKey';
  static String _coachKey(String dayKey) => '$_coachKeyPrefix$dayKey';
}

class _NextLesson {
  const _NextLesson({
    required this.courseId,
    required this.courseTitle,
    required this.lessonId,
    required this.lessonTitle,
    required this.isCompleted,
    required this.completedIds,
  });

  final String courseId;
  final String courseTitle;
  final String lessonId;
  final String lessonTitle;
  final bool isCompleted;
  final List<String> completedIds;
}
