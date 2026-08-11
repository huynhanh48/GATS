import 'package:flutter/foundation.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/data/api/progress_api_service.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';
import 'package:gats_academy/features/course/course_module.dart';
import 'package:gats_academy/features/course/data/progress_outbox.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Tiến độ từng bài giảng — BE là source of truth; prefs chỉ cache offline.
class LectureProgressStore extends ChangeNotifier {
  LectureProgressStore._();
  static final LectureProgressStore instance = LectureProgressStore._();

  static const _prefsPrefix = 'lecture_progress_';

  String? _userId;
  String? _courseId;
  List<CourseLecture> _lectures = const [];
  final Set<String> _completed = {};
  bool _loaded = false;
  bool _loading = false;
  String? _syncError;
  bool _marking = false;

  bool get isLoaded => _loaded;
  bool get isLoading => _loading;
  bool get isMarking => _marking;
  String? get syncError => _syncError;
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
    _syncError = null;
    _loading = true;
    _loaded = false;
    notifyListeners();

    try {
      final token = await AuthPrefs.accessToken();
      if (token != null && token.isNotEmpty) {
        final remote = await ProgressApiService.getCourseProgress(
          courseId: courseId,
          token: token,
        );
        _completed.addAll(remote.completedLessonIds);
        await _persistCache();
        CourseModule.repository.setUserProgress(
          courseId,
          userId,
          remote.fraction,
        );
        await ProgressOutbox.flush();
      } else {
        await _hydrateFromCache(
          userId: userId,
          courseId: courseId,
          fallbackCourseProgress: fallbackCourseProgress,
        );
      }
    } catch (e) {
      debugPrint('LectureProgressStore: hydrate failed — $e');
      _syncError = 'Không đồng bộ được tiến độ. Đang dùng bản lưu cục bộ.';
      await _hydrateFromCache(
        userId: userId,
        courseId: courseId,
        fallbackCourseProgress: fallbackCourseProgress,
      );
    } finally {
      _loading = false;
      _loaded = true;
      notifyListeners();
    }
  }

  /// Keep lesson list in sync when curriculum arrives after first paint.
  void replaceLectures(List<CourseLecture> lectures) {
    final next = List<CourseLecture>.of(lectures);
    if (_sameLectureIds(_lectures, next)) return;
    _lectures = next;
    notifyListeners();
  }

  static bool _sameLectureIds(List<CourseLecture> a, List<CourseLecture> b) {
    if (identical(a, b)) return true;
    if (a.length != b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (a[i].id != b[i].id || a[i].isPublished != b[i].isPublished) {
        return false;
      }
    }
    return true;
  }

  Future<void> retrySync() async {
    final userId = _userId;
    final courseId = _courseId;
    if (userId == null || courseId == null) return;
    await load(
      userId: userId,
      courseId: courseId,
      lectures: _lectures,
      fallbackCourseProgress: progress,
    );
  }

  /// After BE syncQuizResult (quiz passed): optimistic local complete + refresh.
  Future<void> applyQuizPassed(String lectureId) async {
    final userId = _userId;
    final courseId = _courseId;
    if (userId == null || courseId == null) return;

    if (!_completed.contains(lectureId)) {
      _completed.add(lectureId);
      await _persistCache();
      _syncCourseProgress();
      notifyListeners();
    }

    final token = await AuthPrefs.accessToken();
    if (token == null || token.isEmpty) return;

    try {
      final remote = await ProgressApiService.getCourseProgress(
        courseId: courseId,
        token: token,
      );
      _completed
        ..clear()
        ..addAll(remote.completedLessonIds);
      await _persistCache();
      CourseModule.repository.setUserProgress(
        courseId,
        userId,
        remote.fraction,
      );
      notifyListeners();
    } catch (e) {
      debugPrint('LectureProgressStore: applyQuizPassed refresh failed — $e');
    }
  }

  Future<void> markComplete(String lectureId) async {
    final userId = _userId;
    final courseId = _courseId;
    if (userId == null || courseId == null) return;
    if (_completed.contains(lectureId)) {
      notifyListeners();
      return;
    }

    CourseLecture? lecture;
    for (final l in _lectures) {
      if (l.id == lectureId) {
        lecture = l;
        break;
      }
    }
    // Quiz/assignment complete only via submit flows (web parity).
    if (lecture != null && (lecture.isQuiz || lecture.isAssignment)) {
      throw StateError(
        'Bài quiz/assignment chỉ hoàn thành khi nộp bài đạt yêu cầu.',
      );
    }

    final token = await AuthPrefs.accessToken();
    if (token == null || token.isEmpty) {
      throw StateError('Chưa đăng nhập — không thể cập nhật tiến độ.');
    }

    final durationSeconds =
        ((lecture?.durationMinutes ?? 0) * 60).clamp(100, 24 * 3600);

    _marking = true;
    _syncError = null;
    notifyListeners();

    try {
      // Optimistic local complete + outbox for offline-safe sync.
      _completed.add(lectureId);
      await _persistCache();
      _syncCourseProgress();

      await ProgressOutbox.enqueueStarted(
        courseId: courseId,
        lessonId: lectureId,
      );
      await ProgressOutbox.enqueueCompleted(
        courseId: courseId,
        lessonId: lectureId,
        positionSeconds: durationSeconds,
      );

      // Also keep legacy PUT path when online for immediate web parity.
      try {
        await ProgressApiService.markLessonComplete(
          courseId: courseId,
          lessonId: lectureId,
          token: token,
          durationSeconds: durationSeconds,
        );
      } catch (e) {
        debugPrint('LectureProgressStore: PUT fallback deferred — $e');
      }

      try {
        final remote = await ProgressApiService.getCourseProgress(
          courseId: courseId,
          token: token,
        );
        CourseModule.repository.setUserProgress(
          courseId,
          userId,
          remote.fraction,
        );
      } catch (_) {
        _syncCourseProgress();
      }
    } catch (e) {
      debugPrint('LectureProgressStore: markComplete failed — $e');
      _syncError = 'Không lưu được tiến độ. Thử lại khi có mạng.';
      // Keep optimistic complete in outbox — do not rethrow hard fail.
    } finally {
      _marking = false;
      notifyListeners();
    }
  }

  Future<void> markIncomplete(String lectureId) async {
    // BE không hạ hoàn thành khi xem lại; local-only toggle không sync.
    if (_userId == null || _courseId == null) return;
    if (!_completed.remove(lectureId)) return;
    await _persistCache();
    _syncCourseProgress();
    notifyListeners();
  }

  Future<void> _hydrateFromCache({
    required String userId,
    required String courseId,
    required double fallbackCourseProgress,
  }) async {
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
      await _persistCache();
      _syncCourseProgress();
    }
  }

  Future<void> _persistCache() async {
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
