import 'package:flutter/foundation.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/data/api/course_api_service.dart';
import 'package:gats_academy/data/api/progress_api_service.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/features/course/domain/course_repository.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Repository khóa học dùng BE REST API.
///
/// Vòng đời:
///   1. Tạo instance — [_courses] rỗng.
///   2. Gọi [init] một lần ở app startup (hoặc khi user login/logout).
///   3. Sau đó tất cả read operation dùng local cache; write operation
///      (enroll) cập nhật cache ngay và gọi API async.
///
/// Progress: BE là source of truth; SharedPreferences chỉ cache offline.
final class ApiCourseRepository extends ChangeNotifier
    implements CourseRepository {
  List<AppCourse> _courses = [];

  /// courseId → set of userId đã enroll (được hydrate từ BE khi user login).
  final Map<String, Set<String>> _enrolledByUser = {};

  /// progress theo userId → courseId → 0.0..1.0 (cache; hydrated từ BE).
  final Map<String, Map<String, double>> _progressMap = {};

  static const _progressKeyPrefix = 'api_progress_';

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  /// Khởi tạo: fetch danh sách courses + enrollment của user hiện tại.
  ///
  /// Gọi khi app start và mỗi khi auth state thay đổi.
  Future<void> init() async {
    final token = await AuthPrefs.accessToken();
    await _fetchCourses(token: token);
    if (token != null) {
      await _fetchMyEnrollments(token: token);
    }
    notifyListeners();
  }

  Future<void> _fetchCourses({String? token}) async {
    try {
      final list = await CourseApiService.listPublished(token: token);
      _courses = list;
    } catch (e) {
      debugPrint('ApiCourseRepository: fetch courses failed — $e');
    }
  }

  Future<void> _fetchMyEnrollments({required String token}) async {
    try {
      final rows = await CourseApiService.listMyEnrollments(token: token);
      final userId = (await AuthPrefs.currentUser())?.id;
      if (userId == null) return;
      final courseIds = <String>[];
      for (final row in rows) {
        final courseId = row['courseId']?.toString();
        if (courseId == null) continue;
        _enrolledByUser.putIfAbsent(courseId, () => {}).add(userId);
        courseIds.add(courseId);
      }
      await Future.wait(
        courseIds.map((id) => refreshCourseProgress(id, userId, token: token)),
      );
    } catch (e) {
      debugPrint('ApiCourseRepository: fetch enrollments failed — $e');
    }
  }

  /// Hydrate % khóa học từ BE; fallback prefs cache nếu offline.
  Future<void> refreshCourseProgress(
    String courseId,
    String userId, {
    String? token,
  }) async {
    final authToken = token ?? await AuthPrefs.accessToken();
    if (authToken != null && authToken.isNotEmpty) {
      try {
        final remote = await ProgressApiService.getCourseProgress(
          courseId: courseId,
          token: authToken,
        );
        _setProgressLocal(userId, courseId, remote.fraction);
        return;
      } catch (e) {
        debugPrint('ApiCourseRepository: progress API failed — $e');
      }
    }
    await _loadProgressCache(userId, courseId);
  }

  Future<void> _loadProgressCache(String userId, String courseId) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getDouble('$_progressKeyPrefix${userId}_$courseId');
    if (raw != null) {
      _progressMap.putIfAbsent(userId, () => {})[courseId] = raw;
    }
  }

  void _setProgressLocal(String userId, String courseId, double progress) {
    final clamped = progress.clamp(0.0, 1.0);
    _progressMap.putIfAbsent(userId, () => {})[courseId] = clamped;
    SharedPreferences.getInstance().then((prefs) {
      prefs.setDouble('$_progressKeyPrefix${userId}_$courseId', clamped);
    });
  }

  // ─── CourseRepository interface ─────────────────────────────────────────────

  @override
  AppCourse? getCourse(String id) {
    for (final c in _courses) {
      if (c.id == id) return c;
    }
    return null;
  }

  @override
  List<AppCourse> listPublishedCourses() =>
      _courses.where((c) => c.isPublished).toList();

  @override
  List<CourseItem> listPublished(
      {String? userId, UserRole role = UserRole.user}) {
    return listPublishedCourses()
        .map((c) => _toCourseItem(c, userId: userId))
        .toList();
  }

  @override
  List<CourseItem> listEnrolled(
      {String? userId, UserRole role = UserRole.user}) {
    if (userId == null) return [];
    return listPublished(userId: userId, role: role)
        .where((c) => c.isEnrolled)
        .toList();
  }

  @override
  List<CourseItem> listOwned(
      {String? userId, UserRole role = UserRole.user}) {
    if (userId == null) return [];
    if (role == UserRole.admin) {
      return listPublished(userId: userId, role: role);
    }
    return listEnrolled(userId: userId, role: role);
  }

  @override
  bool isOwned(String courseId, String? userId,
      {UserRole role = UserRole.user}) {
    if (userId == null) return false;
    if (role == UserRole.admin) return true;
    return _enrolledByUser[courseId]?.contains(userId) ?? false;
  }

  @override
  bool isEnrolled(String courseId, String? userId,
      {UserRole role = UserRole.user}) =>
      isOwned(courseId, userId, role: role);

  @override
  void enroll(String courseId, String userId) {
    _enrolledByUser.putIfAbsent(courseId, () => {}).add(userId);
    notifyListeners();
  }

  @override
  void unenroll(String courseId, String userId) {
    _enrolledByUser[courseId]?.remove(userId);
    notifyListeners();
  }

  @override
  Future<void> ensureDetailLoaded(String courseId) async {
    final existing = getCourse(courseId);
    final token = await AuthPrefs.accessToken();
    try {
      AppCourse? detailed;
      final slug = existing?.slug;
      if (slug != null && slug.isNotEmpty) {
        detailed = await CourseApiService.getBySlug(slug, token: token);
      }

      if (detailed == null || detailed.lectures.isEmpty) {
        final lectures = await CourseApiService.listCurriculumLectures(
          courseId,
          token: token,
        );
        if (existing != null) {
          detailed = existing.copyWith(
            lectures: lectures,
            lessonCount: lectures.isNotEmpty
                ? lectures.length
                : existing.lessonCount,
            durationMinutes: lectures.isNotEmpty
                ? lectures.fold<int>(0, (s, l) => s + l.durationMinutes)
                : existing.durationMinutes,
          );
        }
      }

      if (detailed == null) return;

      final idx = _courses.indexWhere((c) => c.id == courseId);
      if (idx >= 0) {
        final prev = _courses[idx];
        _courses[idx] = detailed.copyWith(
          enrolledUserIds: prev.enrolledUserIds,
          progressByUser: prev.progressByUser,
          mentorId: detailed.mentorId.isNotEmpty
              ? detailed.mentorId
              : prev.mentorId,
          groupChatId: detailed.groupChatId.isNotEmpty
              ? detailed.groupChatId
              : prev.groupChatId,
        );
      } else {
        _courses = [..._courses, detailed];
      }
      notifyListeners();
    } catch (e) {
      debugPrint('ApiCourseRepository: ensureDetailLoaded failed — $e');
    }
  }

  @override
  Future<bool> enrollFree(String courseId, String userId) async {
    enroll(courseId, userId);
    try {
      final token = await AuthPrefs.accessToken();
      if (token == null) {
        unenroll(courseId, userId);
        return false;
      }
      await CourseApiService.enrollFree(courseId: courseId, token: token);
      // Refresh curriculum locks sau khi enroll.
      final idx = _courses.indexWhere((c) => c.id == courseId);
      if (idx >= 0) {
        _courses[idx] = _courses[idx].copyWith(lectures: const []);
      }
      await ensureDetailLoaded(courseId);
      await refreshCourseProgress(courseId, userId, token: token);
      notifyListeners();
      return true;
    } catch (e) {
      debugPrint('ApiCourseRepository: enrollFree failed — $e');
      unenroll(courseId, userId);
      return false;
    }
  }

  @override
  void setUserProgress(String courseId, String userId, double progress) {
    _setProgressLocal(userId, courseId, progress);
    notifyListeners();
  }

  @override
  bool canAccessGroupChat({
    required AppCourse course,
    required String? userId,
    required UserRole role,
  }) {
    if (role == UserRole.admin) return true;
    if (role == UserRole.mentor && userId != null &&
        course.isManagedBy(userId)) {
      return true;
    }
    return isOwned(course.id, userId, role: role);
  }

  @override
  void publishQuiz(String courseId, String quizId) {
    final idx = _courses.indexWhere((c) => c.id == courseId);
    if (idx < 0) return;
    final course = _courses[idx];
    final quizzes = course.quizzes
        .map((q) => q.id == quizId
            ? CourseQuiz(
                id: q.id,
                title: q.title,
                questionCount: q.questionCount,
                isPublished: true,
              )
            : q)
        .toList();
    _courses[idx] = course.copyWith(quizzes: quizzes);
    notifyListeners();
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  CourseItem _toCourseItem(AppCourse course, {String? userId}) {
    final enrolled = isOwned(course.id, userId);
    final progress =
        userId != null ? (_progressMap[userId]?[course.id] ?? 0.0) : 0.0;
    return CourseItem(
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      progress: enrolled ? progress : 0.0,
      tag: course.tag,
      lessonCount: course.lessonCount,
      durationMinutes: course.durationMinutes,
      isEnrolled: enrolled,
      isFree: course.isFree,
      price: course.price,
      salePrice: course.salePrice,
      thumbnailUrl: course.thumbnailUrl,
    );
  }
}
