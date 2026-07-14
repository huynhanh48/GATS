import 'package:flutter/foundation.dart';
import 'package:gats_academy/data/catalog/course_catalog_loader.dart';
import 'package:gats_academy/data/mock/mock_accounts.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';

class MockCourseStore extends ChangeNotifier {
  MockCourseStore._();
  static final MockCourseStore instance = MockCourseStore._();

  final List<MockUserRecord> _users = [
    MockUserRecord(
      id: MockAccounts.user.id,
      displayName: MockAccounts.user.displayName,
      email: MockAccounts.user.email,
      role: UserRole.user,
    ),
    MockUserRecord(
      id: MockAccounts.mentor.id,
      displayName: MockAccounts.mentor.displayName,
      email: MockAccounts.mentor.email,
      role: UserRole.mentor,
    ),
    MockUserRecord(
      id: MockAccounts.admin.id,
      displayName: MockAccounts.admin.displayName,
      email: MockAccounts.admin.email,
      role: UserRole.admin,
    ),
  ];

  List<AppCourse> _courses = [];

  /// Nạp catalog JSON; fallback Dart seed nếu JSON trống.
  static Future<void> ensureLoaded() async {
    final store = instance;
    if (store._courses.isNotEmpty) return;

    final catalog = CourseCatalogLoader.instance;
    if (!catalog.isLoaded) await catalog.init();

    if (catalog.courses.isNotEmpty) {
      store._courses = catalog.courses
          .map(
            (c) => c.copyWith(
              enrolledUserIds: Set.of(c.enrolledUserIds),
              progressByUser: Map.of(c.progressByUser),
            ),
          )
          .toList();
    } else {
      store._courses = _seedCourses();
    }
  }

  List<MockUserRecord> get users => List.unmodifiable(_users);
  List<AppCourse> get courses => List.unmodifiable(_courses);

  List<AppCourse> publishedCourses() =>
      _courses.where((c) => c.isPublished).toList();

  List<AppCourse> coursesForUser(String? userId, {UserRole role = UserRole.user}) {
    if (role == UserRole.admin) return publishedCourses();
    if (role == UserRole.mentor && userId != null) {
      return _courses.where((c) => c.mentorId == userId && c.isPublished).toList();
    }
    return publishedCourses();
  }

  List<CourseItem> courseItemsFor(String? userId, {UserRole role = UserRole.user}) {
    return coursesForUser(userId, role: role)
        .map((c) => c.toListItem(userId: userId))
        .toList();
  }

  AppCourse? courseById(String id) {
    for (final course in _courses) {
      if (course.id == id) return course;
    }
    return null;
  }

  AppCourse? courseByGroupChatId(String groupChatId) {
    for (final course in _courses) {
      if (course.groupChatId == groupChatId) return course;
    }
    return null;
  }

  bool canAccessGroupChat({
    required AppCourse course,
    required String? userId,
    required UserRole role,
  }) {
    if (role == UserRole.admin) return true;
    if (role == UserRole.mentor && userId == course.mentorId) return true;
    if (role == UserRole.user && course.isOwnedBy(userId)) return true;
    return false;
  }

  void enrollUser(String courseId, String userId) {
    final index = _courses.indexWhere((c) => c.id == courseId);
    if (index < 0) return;
    final course = _courses[index];
    final enrolled = {...course.enrolledUserIds, userId};
    final progress = Map<String, double>.from(course.progressByUser);
    progress.putIfAbsent(userId, () => 0);
    _courses[index] = course.copyWith(
      enrolledUserIds: enrolled,
      progressByUser: progress,
    );
    notifyListeners();
  }

  void setUserProgress(String courseId, String userId, double progress) {
    final index = _courses.indexWhere((c) => c.id == courseId);
    if (index < 0) return;
    final course = _courses[index];
    final map = Map<String, double>.from(course.progressByUser);
    map[userId] = progress.clamp(0.0, 1.0);
    _courses[index] = course.copyWith(progressByUser: map);
    notifyListeners();
  }

  void assignMentor(String courseId, String mentorId) {
    final index = _courses.indexWhere((c) => c.id == courseId);
    if (index < 0) return;
    _courses[index] = _courses[index].copyWith(mentorId: mentorId);
    notifyListeners();
  }

  void togglePublish(String courseId) {
    final index = _courses.indexWhere((c) => c.id == courseId);
    if (index < 0) return;
    final course = _courses[index];
    _courses[index] = course.copyWith(isPublished: !course.isPublished);
    notifyListeners();
  }

  void toggleUserActive(String userId) {
    final index = _users.indexWhere((u) => u.id == userId);
    if (index < 0) return;
    final user = _users[index];
    _users[index] = MockUserRecord(
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      isActive: !user.isActive,
    );
    notifyListeners();
  }

  void publishQuiz(String courseId, String quizId) {
    final index = _courses.indexWhere((c) => c.id == courseId);
    if (index < 0) return;
    final course = _courses[index];
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
    _courses[index] = course.copyWith(quizzes: quizzes);
    notifyListeners();
  }

  static List<AppCourse> _seedCourses() {
    const mentorId = 'mock_mentor';
    const userId = 'mock_user';

    return [
      AppCourse(
        id: 'course-1',
        title: 'AI cho Dân văn phòng',
        description: 'Từ zero đến thành thạo AI trong công việc hàng ngày',
        tag: 'AI cho công sở',
        lessonCount: 24,
        durationMinutes: 480,
        mentorId: mentorId,
        groupChatId: 'gc-course-1',
        isPublished: true,
        isFree: false,
        price: 299000.0,
        enrolledUserIds: {userId},
        progressByUser: {userId: 0.35},
        lectures: const [
          CourseLecture(id: 'l1', title: 'Giới thiệu AI & LLM', durationMinutes: 15),
          CourseLecture(id: 'l2', title: 'Prompt cho email & báo cáo', durationMinutes: 20),
          CourseLecture(id: 'l3', title: 'Tự động hóa Excel với AI', durationMinutes: 25),
        ],
        quizzes: const [
          CourseQuiz(id: 'q1', title: 'Quiz tuần 1: Prompt cơ bản', questionCount: 10, isPublished: true),
          CourseQuiz(id: 'q2', title: 'Quiz tuần 2: Ứng dụng văn phòng', questionCount: 8),
        ],
      ),
      AppCourse(
        id: 'course-2',
        title: 'Prompt Engineering',
        description: 'Viết prompt chuyên nghiệp cho mọi tình huống',
        tag: 'AI cho công sở',
        lessonCount: 18,
        durationMinutes: 360,
        mentorId: mentorId,
        groupChatId: 'gc-course-2',
        isPublished: true,
        isFree: true,
        price: 0.0,
        enrolledUserIds: {},
        lectures: const [
          CourseLecture(id: 'l1', title: 'Zero-shot vs Few-shot', durationMinutes: 18),
          CourseLecture(id: 'l2', title: 'Chain-of-thought', durationMinutes: 22),
        ],
        quizzes: const [
          CourseQuiz(id: 'q1', title: 'Kiểm tra Prompt nâng cao', questionCount: 12),
        ],
      ),
      AppCourse(
        id: 'course-3',
        title: 'Tự động hóa với AI',
        description: 'Workflow và agent cho team nhỏ',
        tag: 'Automation',
        lessonCount: 12,
        durationMinutes: 240,
        mentorId: mentorId,
        groupChatId: 'gc-course-3',
        isPublished: false,
        isFree: false,
        price: 499000.0,
        enrolledUserIds: {},
        lectures: const [
          CourseLecture(id: 'l1', title: 'Workflow cơ bản', durationMinutes: 20),
        ],
        quizzes: const [],
      ),
      AppCourse(
        id: 'course-4',
        title: 'Nhập môn Lập trình Flutter',
        description: 'Tạo ứng dụng di động đa nền tảng nhanh chóng',
        tag: 'Lập trình',
        lessonCount: 40,
        durationMinutes: 1200,
        mentorId: mentorId,
        groupChatId: 'gc-course-4',
        isPublished: true,
        isFree: false,
        price: 899000.0,
        enrolledUserIds: {userId},
        progressByUser: {userId: 0.15},
        lectures: const [
          CourseLecture(id: 'l1', title: 'Cài đặt môi trường', durationMinutes: 30),
          CourseLecture(id: 'l2', title: 'Widget cơ bản', durationMinutes: 45),
        ],
        quizzes: const [],
      ),
      AppCourse(
        id: 'course-5',
        title: 'Digital Marketing Thực chiến',
        description: 'Tối ưu quảng cáo và tăng tỷ lệ chuyển đổi',
        tag: 'Marketing',
        lessonCount: 20,
        durationMinutes: 600,
        mentorId: mentorId,
        groupChatId: 'gc-course-5',
        isPublished: true,
        isFree: true,
        price: 0.0,
        enrolledUserIds: {},
        progressByUser: {},
        lectures: const [
          CourseLecture(id: 'l1', title: 'Tổng quan Digital Marketing', durationMinutes: 20),
        ],
        quizzes: const [],
      ),
      AppCourse(
        id: 'course-6',
        title: 'Tiếng Anh Giao tiếp cơ bản',
        description: 'Tự tự giao tiếp tiếng Anh trong 30 ngày',
        tag: 'Ngoại ngữ',
        lessonCount: 30,
        durationMinutes: 900,
        mentorId: mentorId,
        groupChatId: 'gc-course-6',
        isPublished: true,
        isFree: false,
        price: 149000.0,
        enrolledUserIds: {userId},
        progressByUser: {userId: 0.8},
        lectures: const [
          CourseLecture(id: 'l1', title: 'Chào hỏi và giới thiệu bản thân', durationMinutes: 15),
        ],
        quizzes: const [],
      ),
      AppCourse(
        id: 'course-7',
        title: 'Kỹ năng thuyết trình trước đám đông',
        description: 'Nói trước đám đông không còn là nỗi sợ',
        tag: 'Kỹ năng mềm',
        lessonCount: 15,
        durationMinutes: 450,
        mentorId: mentorId,
        groupChatId: 'gc-course-7',
        isPublished: true,
        isFree: true,
        price: 0.0,
        enrolledUserIds: {},
        progressByUser: {},
        lectures: const [
          CourseLecture(id: 'l1', title: 'Chuẩn bị nội dung', durationMinutes: 20),
        ],
        quizzes: const [],
      ),
    ];
  }
}
