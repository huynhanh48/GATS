import 'package:flutter/foundation.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/data/api/course_api_service.dart';
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
final class ApiCourseRepository extends ChangeNotifier
    implements CourseRepository {
  List<AppCourse> _courses = [];

  /// courseId → Set<userId> đã enroll (được hydrate từ BE khi user login).
  final Map<String, Set<String>> _enrolledByUser = {};

  /// progress theo userId → courseId → 0.0‥1.0 (local SharedPreferences).
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
      // rows: List<Map<String, dynamic>> where each has 'courseId'
      final userId = (await AuthPrefs.currentUser())?.id;
      if (userId == null) return;
      for (final row in rows) {
        final courseId = row['courseId']?.toString();
        if (courseId == null) continue;
        _enrolledByUser.putIfAbsent(courseId, () => {}).add(userId);
      }
    } catch (e) {
      debugPrint('ApiCourseRepository: fetch enrollments failed — $e');
    }
  }

  Future<void> _loadProgress(String userId, String courseId) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getDouble('$_progressKeyPrefix${userId}_$courseId');
    if (raw != null) {
      _progressMap.putIfAbsent(userId, () => {})[courseId] = raw;
    }
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
  void setUserProgress(String courseId, String userId, double progress) {
    _progressMap.putIfAbsent(userId, () => {})[courseId] =
        progress.clamp(0.0, 1.0);
    // Persist local
    SharedPreferences.getInstance().then((prefs) {
      prefs.setDouble(
          '$_progressKeyPrefix${userId}_$courseId', progress.clamp(0.0, 1.0));
    });
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
