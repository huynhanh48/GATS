import 'package:gats_academy/features/auth/models/user_role.dart';

class CourseItem {
  const CourseItem({
    required this.id,
    required this.title,
    required this.description,
    required this.progress,
    required this.tag,
    required this.lessonCount,
    required this.durationMinutes,
    this.isEnrolled = false,
    this.isFree = false,
    this.price = 0.0,
  });

  final String id;
  final String title;
  final String description;
  final double progress;
  final String tag;
  final int lessonCount;
  final int durationMinutes;
  final bool isEnrolled;
  final bool isFree;
  final double price;
}

class CourseLecture {
  const CourseLecture({
    required this.id,
    required this.title,
    required this.durationMinutes,
    this.isPublished = true,
  });

  final String id;
  final String title;
  final int durationMinutes;
  final bool isPublished;
}

class CourseQuiz {
  const CourseQuiz({
    required this.id,
    required this.title,
    required this.questionCount,
    this.isPublished = false,
  });

  final String id;
  final String title;
  final int questionCount;
  final bool isPublished;
}

class AppCourse {
  const AppCourse({
    required this.id,
    required this.title,
    required this.description,
    required this.tag,
    required this.lessonCount,
    required this.durationMinutes,
    required this.mentorId,
    required this.groupChatId,
    required this.isPublished,
    required this.isFree,
    required this.enrolledUserIds,
    required this.lectures,
    required this.quizzes,
    this.price = 0.0,
    this.progressByUser = const {},
  });

  final String id;
  final String title;
  final String description;
  final String tag;
  final int lessonCount;
  final int durationMinutes;
  final String mentorId;
  final String groupChatId;
  final bool isPublished;
  final bool isFree;
  final double price;
  final Set<String> enrolledUserIds;
  final List<CourseLecture> lectures;
  final List<CourseQuiz> quizzes;
  final Map<String, double> progressByUser;

  bool isEnrolledBy(String? userId) => isOwnedBy(userId);

  /// Khóa user thực sự đã đăng ký / mua (có trong enrolledUserIds).
  bool isOwnedBy(String? userId) =>
      userId != null && enrolledUserIds.contains(userId);

  bool isManagedBy(String? userId) => userId != null && mentorId == userId;

  double progressFor(String? userId) {
    if (userId == null) return 0;
    return progressByUser[userId] ?? 0;
  }

  CourseItem toListItem({String? userId}) {
    final enrolled = isEnrolledBy(userId);
    return CourseItem(
      id: id,
      title: title,
      description: description,
      progress: enrolled ? progressFor(userId) : 0,
      tag: tag,
      lessonCount: lessonCount,
      durationMinutes: durationMinutes,
      isEnrolled: enrolled,
      isFree: isFree,
      price: price,
    );
  }

  AppCourse copyWith({
    String? id,
    String? title,
    String? description,
    String? tag,
    int? lessonCount,
    int? durationMinutes,
    String? mentorId,
    String? groupChatId,
    bool? isPublished,
    bool? isFree,
    double? price,
    Set<String>? enrolledUserIds,
    List<CourseLecture>? lectures,
    List<CourseQuiz>? quizzes,
    Map<String, double>? progressByUser,
  }) {
    return AppCourse(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      tag: tag ?? this.tag,
      lessonCount: lessonCount ?? this.lessonCount,
      durationMinutes: durationMinutes ?? this.durationMinutes,
      mentorId: mentorId ?? this.mentorId,
      groupChatId: groupChatId ?? this.groupChatId,
      isPublished: isPublished ?? this.isPublished,
      isFree: isFree ?? this.isFree,
      price: price ?? this.price,
      enrolledUserIds: enrolledUserIds ?? this.enrolledUserIds,
      lectures: lectures ?? this.lectures,
      quizzes: quizzes ?? this.quizzes,
      progressByUser: progressByUser ?? this.progressByUser,
    );
  }
}

class GroupChatMessage {
  const GroupChatMessage({
    required this.id,
    required this.groupChatId,
    required this.senderId,
    required this.senderName,
    required this.text,
    required this.sentAt,
    this.isPinned = false,
    this.isMentor = false,
  });

  final String id;
  final String groupChatId;
  final String senderId;
  final String senderName;
  final String text;
  final DateTime sentAt;
  final bool isPinned;
  final bool isMentor;
}

class MockUserRecord {
  const MockUserRecord({
    required this.id,
    required this.displayName,
    required this.email,
    required this.role,
    this.isActive = true,
  });

  final String id;
  final String displayName;
  final String email;
  final UserRole role;
  final bool isActive;
}
