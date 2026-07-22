import 'package:gats_academy/core/network/api_client.dart';
import 'package:gats_academy/data/api/progress_api_paths.dart';

class CourseProgressDto {
  const CourseProgressDto({
    required this.completedLessons,
    required this.totalLessons,
    required this.percent,
    required this.completedLessonIds,
  });

  final int completedLessons;
  final int totalLessons;
  final int percent;
  final List<String> completedLessonIds;

  /// 0.0‥1.0 for UI / repository.
  double get fraction => (percent / 100).clamp(0.0, 1.0);

  factory CourseProgressDto.fromJson(Map<String, dynamic> json) {
    final ids = json['completedLessonIds'];
    return CourseProgressDto(
      completedLessons: (json['completedLessons'] as num?)?.toInt() ?? 0,
      totalLessons: (json['totalLessons'] as num?)?.toInt() ?? 0,
      percent: (json['percent'] as num?)?.toInt() ?? 0,
      completedLessonIds: ids is List
          ? ids.map((e) => e.toString()).where((e) => e.isNotEmpty).toList()
          : const [],
    );
  }
}

class LessonProgressDto {
  const LessonProgressDto({
    required this.lessonId,
    required this.watchedSeconds,
    required this.percent,
    required this.isCompleted,
    this.durationSeconds,
  });

  final String lessonId;
  final int watchedSeconds;
  final int? durationSeconds;
  final int percent;
  final bool isCompleted;

  factory LessonProgressDto.fromJson(Map<String, dynamic> json) {
    return LessonProgressDto(
      lessonId: json['lessonId']?.toString() ?? '',
      watchedSeconds: (json['watchedSeconds'] as num?)?.toInt() ?? 0,
      durationSeconds: (json['durationSeconds'] as num?)?.toInt(),
      percent: (json['percent'] as num?)?.toInt() ?? 0,
      isCompleted: json['isCompleted'] == true,
    );
  }
}

/// Progress REST — BE là source of truth; prefs chỉ cache offline.
abstract final class ProgressApiService {
  static Future<CourseProgressDto> getCourseProgress({
    required String courseId,
    required String token,
  }) async {
    final json = await ApiClient.get(
      ProgressApiPaths.course(courseId),
      token: token,
    );
    final data = json['data'];
    if (data is Map<String, dynamic>) {
      return CourseProgressDto.fromJson(data);
    }
    if (data is Map) {
      return CourseProgressDto.fromJson(Map<String, dynamic>.from(data));
    }
    return const CourseProgressDto(
      completedLessons: 0,
      totalLessons: 0,
      percent: 0,
      completedLessonIds: [],
    );
  }

  static Future<LessonProgressDto?> getLessonProgress({
    required String courseId,
    required String lessonId,
    required String token,
  }) async {
    final json = await ApiClient.get(
      ProgressApiPaths.lesson(courseId, lessonId),
      token: token,
    );
    final data = json['data'];
    if (data == null) return null;
    if (data is Map<String, dynamic>) {
      return LessonProgressDto.fromJson(data);
    }
    if (data is Map) {
      return LessonProgressDto.fromJson(Map<String, dynamic>.from(data));
    }
    return null;
  }

  /// Mirror Web `markComplete`: watched == duration (≥90% → completed).
  static Future<LessonProgressDto> upsertLessonProgress({
    required String courseId,
    required String lessonId,
    required String token,
    required int watchedSeconds,
    int? durationSeconds,
    String? videoId,
  }) async {
    final body = <String, dynamic>{
      'watched_seconds': watchedSeconds,
      if (durationSeconds != null) 'duration_seconds': durationSeconds,
      if (videoId != null && videoId.isNotEmpty) 'video_id': videoId,
    };
    final json = await ApiClient.put(
      ProgressApiPaths.lesson(courseId, lessonId),
      token: token,
      body: body,
    );
    final data = json['data'];
    if (data is Map<String, dynamic>) {
      return LessonProgressDto.fromJson(data);
    }
    if (data is Map) {
      return LessonProgressDto.fromJson(Map<String, dynamic>.from(data));
    }
    return LessonProgressDto(
      lessonId: lessonId,
      watchedSeconds: watchedSeconds,
      durationSeconds: durationSeconds,
      percent: 100,
      isCompleted: true,
    );
  }

  /// Đánh dấu hoàn thành bài (giống Web LearnCourseWorkspace.markComplete).
  static Future<LessonProgressDto> markLessonComplete({
    required String courseId,
    required String lessonId,
    required String token,
    int? durationSeconds,
    String? videoId,
  }) {
    final duration =
        (durationSeconds != null && durationSeconds > 0) ? durationSeconds : 100;
    return upsertLessonProgress(
      courseId: courseId,
      lessonId: lessonId,
      token: token,
      watchedSeconds: duration,
      durationSeconds: duration,
      videoId: videoId,
    );
  }
}
