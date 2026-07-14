import 'package:flutter/foundation.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';
import 'package:gats_academy/features/course/course_module.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Tiến độ từng bài giảng (local) — đồng bộ % khóa học lên [CourseModule.repository].
class LectureProgressStore extends ChangeNotifier {
  LectureProgressStore._();
  static final LectureProgressStore instance = LectureProgressStore._();

  static const _prefsPrefix = 'lecture_progress_';

  String? _userId;
  String? _courseId;
  List<CourseLecture> _lectures = const [];
  final Set<String> _completed = {};
  bool _loaded = false;

  bool get isLoaded => _loaded;
  String? get courseId => _courseId;
  List<CourseLecture> get lectures => _lectures;

  List<CourseLecture> get publishedLectures =>
      _lectures.where((l) => l.isPublished).toList();

  Set<String> get completedIds => Set.unmodifiable(_completed);

  int get completedCount =>
      publishedLectures.where((l) => _completed.contains(l.id)).length;

  int get totalCount => publishedLectures.length;

  double get progress {
    if (totalCount == 0) return 0;
    return (completedCount / totalCount).clamp(0.0, 1.0);
  }

  /// Bài đầu tiên chưa hoàn thành — null nếu đã xong hết.
  CourseLecture? get currentLecture {
    for (final lecture in publishedLectures) {
      if (!_completed.contains(lecture.id)) return lecture;
    }
    return null;
  }

  int indexOf(CourseLecture lecture) =>
      publishedLectures.indexWhere((l) => l.id == lecture.id);

  LectureLearnState stateOf(CourseLecture lecture) {
    if (_completed.contains(lecture.id)) return LectureLearnState.completed;
    final current = currentLecture;
    if (current != null && current.id == lecture.id) {
      return LectureLearnState.current;
    }
    return LectureLearnState.upcoming;
  }

  Future<void> load({
    required String userId,
    required String courseId,
    required List<CourseLecture> lectures,
    double fallbackCourseProgress = 0,
  }) async {
    _userId = userId;
    _courseId = courseId;
    _lectures = List.of(lectures);
    _completed.clear();

    final prefs = await SharedPreferences.getInstance();
    final key = _storageKey(userId, courseId);
    final saved = prefs.getStringList(key);

    if (saved != null) {
      _completed.addAll(saved);
    } else if (fallbackCourseProgress > 0 && publishedLectures.isNotEmpty) {
      final seedCount =
          (fallbackCourseProgress * publishedLectures.length).floor().clamp(
                0,
                publishedLectures.length,
              );
      for (var i = 0; i < seedCount; i++) {
        _completed.add(publishedLectures[i].id);
      }
      await _persist();
      _syncCourseProgress();
    }

    _loaded = true;
    notifyListeners();
  }

  Future<void> markComplete(String lectureId) async {
    if (_userId == null || _courseId == null) return;
    if (!_completed.add(lectureId)) {
      notifyListeners();
      return;
    }
    await _persist();
    _syncCourseProgress();
    notifyListeners();
  }

  Future<void> markIncomplete(String lectureId) async {
    if (_userId == null || _courseId == null) return;
    if (!_completed.remove(lectureId)) return;
    await _persist();
    _syncCourseProgress();
    notifyListeners();
  }

  Future<void> _persist() async {
    final userId = _userId;
    final courseId = _courseId;
    if (userId == null || courseId == null) return;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(
      _storageKey(userId, courseId),
      _completed.toList()..sort(),
    );
  }

  void _syncCourseProgress() {
    final userId = _userId;
    final courseId = _courseId;
    if (userId == null || courseId == null) return;
    CourseModule.repository.setUserProgress(courseId, userId, progress);
  }

  static String _storageKey(String userId, String courseId) =>
      '$_prefsPrefix${userId}_$courseId';
}

enum LectureLearnState { completed, current, upcoming }
