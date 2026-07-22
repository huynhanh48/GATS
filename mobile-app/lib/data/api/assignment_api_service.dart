import 'package:gats_academy/core/network/api_client.dart';
import 'package:gats_academy/data/api/assignment_api_paths.dart';

class AssignmentSubmissionDto {
  const AssignmentSubmissionDto({
    required this.id,
    required this.status,
    this.score,
    this.feedback,
    this.textContent,
    this.url,
    this.submittedAt,
    this.gradedAt,
  });

  final String id;
  final String status;
  final num? score;
  final String? feedback;
  final String? textContent;
  final String? url;
  final String? submittedAt;
  final String? gradedAt;

  factory AssignmentSubmissionDto.fromJson(Map<String, dynamic> json) {
    return AssignmentSubmissionDto(
      id: json['id']?.toString() ?? '',
      status: json['status']?.toString() ?? '',
      score: json['score'] as num?,
      feedback: json['feedback']?.toString(),
      textContent: json['textContent']?.toString(),
      url: json['url']?.toString(),
      submittedAt: json['submittedAt']?.toString(),
      gradedAt: json['gradedAt']?.toString(),
    );
  }
}

class AssignmentPayload {
  const AssignmentPayload({
    required this.id,
    required this.maxScore,
    required this.allowedSubmissionTypes,
    required this.lateSubmissionAllowed,
    required this.maxSubmissions,
    required this.remainingSubmissions,
    this.title,
    this.dueAt,
    this.latestSubmission,
  });

  final String id;
  final String? title;
  final String? dueAt;
  final num maxScore;
  final List<String> allowedSubmissionTypes;
  final bool lateSubmissionAllowed;
  final int maxSubmissions;
  final int remainingSubmissions;
  final AssignmentSubmissionDto? latestSubmission;

  bool get allowsText => allowedSubmissionTypes.contains('text');
  bool get allowsUrl => allowedSubmissionTypes.contains('url');

  factory AssignmentPayload.fromJson(Map<String, dynamic> json) {
    final types = json['allowedSubmissionTypes'];
    final latest = json['latestSubmission'];
    return AssignmentPayload(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString(),
      dueAt: json['dueAt']?.toString(),
      maxScore: (json['maxScore'] as num?) ?? 100,
      allowedSubmissionTypes: types is List
          ? types.map((e) => e.toString()).toList()
          : const ['text', 'url'],
      lateSubmissionAllowed: json['lateSubmissionAllowed'] == true,
      maxSubmissions: (json['maxSubmissions'] as num?)?.toInt() ?? 1,
      remainingSubmissions:
          (json['remainingSubmissions'] as num?)?.toInt() ?? 0,
      latestSubmission: latest is Map
          ? AssignmentSubmissionDto.fromJson(Map<String, dynamic>.from(latest))
          : null,
    );
  }
}

abstract final class AssignmentApiService {
  static Map<String, dynamic>? _asMap(dynamic data) {
    if (data is Map<String, dynamic>) return data;
    if (data is Map) return Map<String, dynamic>.from(data);
    return null;
  }

  static Future<AssignmentPayload> byLesson({
    required String courseId,
    required String lessonId,
    required String token,
  }) async {
    final json = await ApiClient.get(
      AssignmentApiPaths.byLesson(courseId, lessonId),
      token: token,
    );
    final data = _asMap(json['data']);
    if (data == null) {
      throw StateError('Assignment trống');
    }
    return AssignmentPayload.fromJson(data);
  }

  static Future<AssignmentSubmissionDto> submit({
    required String assignmentId,
    required String token,
    String? textContent,
    String? url,
  }) async {
    final body = <String, dynamic>{
      if (textContent != null && textContent.isNotEmpty)
        'text_content': textContent,
      if (url != null && url.isNotEmpty) 'url': url,
    };
    final json = await ApiClient.post(
      AssignmentApiPaths.submit(assignmentId),
      token: token,
      body: body,
    );
    final data = _asMap(json['data']);
    if (data == null) {
      throw StateError('Submit assignment thất bại');
    }
    return AssignmentSubmissionDto.fromJson(data);
  }
}
