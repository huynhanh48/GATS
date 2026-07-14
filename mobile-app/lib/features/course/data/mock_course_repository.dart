import 'package:flutter/foundation.dart';
import 'package:gats_academy/data/mock/mock_course_store.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/features/course/domain/course_repository.dart';

final class MockCourseRepository implements CourseRepository {
  MockCourseStore get _store => MockCourseStore.instance;

  @override
  void addListener(VoidCallback listener) => _store.addListener(listener);

  @override
  void removeListener(VoidCallback listener) => _store.removeListener(listener);

  @override
  AppCourse? getCourse(String id) => _store.courseById(id);

  @override
  List<AppCourse> listPublishedCourses() => _store.publishedCourses();

  @override
  List<CourseItem> listPublished({String? userId, UserRole role = UserRole.user}) {
    return _store.courseItemsFor(userId, role: role);
  }

  @override
  List<CourseItem> listEnrolled({String? userId, UserRole role = UserRole.user}) {
    return listPublished(userId: userId, role: role).where((c) => c.isEnrolled).toList();
  }

  @override
  List<CourseItem> listOwned({String? userId, UserRole role = UserRole.user}) {
    if (userId == null) return [];
    if (role == UserRole.admin) {
      return listPublished(userId: userId, role: role);
    }
    return listPublished(userId: userId, role: role).where((c) {
      final course = getCourse(c.id);
      if (course == null) return false;
      if (role == UserRole.mentor && course.isManagedBy(userId)) return true;
      return course.isOwnedBy(userId);
    }).toList();
  }

  @override
  bool isOwned(String courseId, String? userId, {UserRole role = UserRole.user}) {
    final course = getCourse(courseId);
    if (course == null) return false;
    if (role == UserRole.admin) return true;
    if (role == UserRole.mentor && userId == course.mentorId) return true;
    return course.isOwnedBy(userId);
  }

  @override
  bool isEnrolled(String courseId, String? userId, {UserRole role = UserRole.user}) =>
      isOwned(courseId, userId, role: role);

  @override
  void enroll(String courseId, String userId) => _store.enrollUser(courseId, userId);

  @override
  void setUserProgress(String courseId, String userId, double progress) =>
      _store.setUserProgress(courseId, userId, progress);

  @override
  bool canAccessGroupChat({
    required AppCourse course,
    required String? userId,
    required UserRole role,
  }) {
    return _store.canAccessGroupChat(course: course, userId: userId, role: role);
  }

  @override
  void publishQuiz(String courseId, String quizId) => _store.publishQuiz(courseId, quizId);
}
