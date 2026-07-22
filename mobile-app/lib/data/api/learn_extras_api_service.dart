import 'package:gats_academy/core/network/api_client.dart';
import 'package:gats_academy/data/api/learn_extras_api_paths.dart';

class LessonNoteDto {
  const LessonNoteDto({
    required this.id,
    required this.content,
    this.timestampSeconds,
  });

  final String id;
  final String content;
  final int? timestampSeconds;

  factory LessonNoteDto.fromJson(Map<String, dynamic> json) {
    return LessonNoteDto(
      id: json['id']?.toString() ?? '',
      content: json['content']?.toString() ?? '',
      timestampSeconds: (json['timestampSeconds'] as num?)?.toInt(),
    );
  }
}

class LessonBookmarkDto {
  const LessonBookmarkDto({
    required this.id,
    this.label,
    this.timestampSeconds,
  });

  final String id;
  final String? label;
  final int? timestampSeconds;

  factory LessonBookmarkDto.fromJson(Map<String, dynamic> json) {
    return LessonBookmarkDto(
      id: json['id']?.toString() ?? '',
      label: json['label']?.toString() ?? json['title']?.toString(),
      timestampSeconds: (json['timestampSeconds'] as num?)?.toInt(),
    );
  }
}

class LessonQuestionDto {
  const LessonQuestionDto({
    required this.id,
    required this.content,
    required this.isResolved,
    this.userName,
  });

  final String id;
  final String content;
  final bool isResolved;
  final String? userName;

  factory LessonQuestionDto.fromJson(Map<String, dynamic> json) {
    return LessonQuestionDto(
      id: json['id']?.toString() ?? '',
      content: json['content']?.toString() ?? '',
      isResolved: json['isResolved'] == true,
      userName: json['userName']?.toString(),
    );
  }
}

abstract final class LearnExtrasApiService {
  static List<Map<String, dynamic>> _list(dynamic data) {
    if (data is! List) return const [];
    return data
        .whereType<Map>()
        .map((e) => Map<String, dynamic>.from(e))
        .toList();
  }

  static Map<String, dynamic>? _map(dynamic data) {
    if (data is Map<String, dynamic>) return data;
    if (data is Map) return Map<String, dynamic>.from(data);
    return null;
  }

  static Future<List<LessonNoteDto>> listNotes({
    required String courseId,
    required String lessonId,
    required String token,
  }) async {
    final json = await ApiClient.get(
      LearnExtrasApiPaths.lessonNotes(courseId, lessonId),
      token: token,
    );
    return _list(json['data']).map(LessonNoteDto.fromJson).toList();
  }

  static Future<LessonNoteDto> addNote({
    required String courseId,
    required String lessonId,
    required String token,
    required String content,
    int? timestampSeconds,
  }) async {
    final json = await ApiClient.post(
      LearnExtrasApiPaths.lessonNotes(courseId, lessonId),
      token: token,
      body: {
        'content': content,
        if (timestampSeconds != null) 'timestampSeconds': timestampSeconds,
      },
    );
    final data = _map(json['data']);
    if (data == null) throw StateError('Tạo ghi chú thất bại');
    return LessonNoteDto.fromJson(data);
  }

  static Future<void> deleteNote({
    required String noteId,
    required String token,
  }) {
    return ApiClient.delete(
      LearnExtrasApiPaths.note(noteId),
      token: token,
    );
  }

  static Future<List<LessonBookmarkDto>> listBookmarks({
    required String courseId,
    required String lessonId,
    required String token,
  }) async {
    final json = await ApiClient.get(
      LearnExtrasApiPaths.lessonBookmarks(courseId, lessonId),
      token: token,
    );
    return _list(json['data']).map(LessonBookmarkDto.fromJson).toList();
  }

  static Future<LessonBookmarkDto> addBookmark({
    required String courseId,
    required String lessonId,
    required String token,
    String? label,
    int? timestampSeconds,
  }) async {
    final json = await ApiClient.post(
      LearnExtrasApiPaths.lessonBookmarks(courseId, lessonId),
      token: token,
      body: {
        if (label != null) 'label': label,
        if (timestampSeconds != null) 'timestampSeconds': timestampSeconds,
      },
    );
    final data = _map(json['data']);
    if (data == null) throw StateError('Tạo bookmark thất bại');
    return LessonBookmarkDto.fromJson(data);
  }

  static Future<void> deleteBookmark({
    required String bookmarkId,
    required String token,
  }) {
    return ApiClient.delete(
      LearnExtrasApiPaths.bookmark(bookmarkId),
      token: token,
    );
  }

  static Future<List<LessonQuestionDto>> listQuestions({
    required String courseId,
    required String lessonId,
    required String token,
  }) async {
    final json = await ApiClient.get(
      LearnExtrasApiPaths.questions(courseId, lessonId),
      token: token,
    );
    return _list(json['data']).map(LessonQuestionDto.fromJson).toList();
  }

  static Future<LessonQuestionDto> askQuestion({
    required String courseId,
    required String lessonId,
    required String token,
    required String content,
  }) async {
    final json = await ApiClient.post(
      LearnExtrasApiPaths.questions(courseId, lessonId),
      token: token,
      body: {'content': content},
    );
    final data = _map(json['data']);
    if (data == null) throw StateError('Gửi câu hỏi thất bại');
    return LessonQuestionDto.fromJson(data);
  }

  static Future<void> deleteQuestion({
    required String questionId,
    required String token,
  }) {
    return ApiClient.delete(
      LearnExtrasApiPaths.deleteQuestion(questionId),
      token: token,
    );
  }
}
