import 'package:flutter/foundation.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';

/// Tầng truy cập khóa học — thay mock bằng API repository sau này.
abstract class CourseRepository {
  void addListener(VoidCallback listener);
  void removeListener(VoidCallback listener);

  AppCourse? getCourse(String id);

  List<CourseItem> listPublished({String? userId, UserRole role = UserRole.user});

  List<AppCourse> listPublishedCourses();

  List<CourseItem> listEnrolled({String? userId, UserRole role = UserRole.user});

  /// Khóa đã mua / đăng ký thực tế (không gồm khóa free chưa enroll).
  List<CourseItem> listOwned({String? userId, UserRole role = UserRole.user});

  bool isOwned(String courseId, String? userId, {UserRole role = UserRole.user});

  bool isEnrolled(String courseId, String? userId, {UserRole role = UserRole.user});

  void enroll(String courseId, String userId);

  void setUserProgress(String courseId, String userId, double progress);

  bool canAccessGroupChat({
    required AppCourse course,
    required String? userId,
    required UserRole role,
  });

  void publishQuiz(String courseId, String quizId);
}
