import 'package:gats_academy/features/auth/models/user_role.dart';

enum PostScope { global, course }

class CommunityPost {
  const CommunityPost({
    required this.id,
    required this.title,
    required this.body,
    required this.authorId,
    required this.authorName,
    required this.authorRole,
    required this.scope,
    required this.publishedAt,
    this.courseId,
    this.isPublished = true,
  });

  final String id;
  final String title;
  final String body;
  final String authorId;
  final String authorName;
  final UserRole authorRole;
  final PostScope scope;
  final String? courseId;
  final DateTime publishedAt;
  final bool isPublished;

  String get previewExcerpt {
    final trimmed = body.trim();
    if (trimmed.length <= 160) return trimmed;
    return '${trimmed.substring(0, 157)}...';
  }

  String get badgeLabel => switch (scope) {
        PostScope.global => 'GATS',
        PostScope.course => 'Khóa học',
      };

  CommunityPost copyWith({
    String? title,
    String? body,
    bool? isPublished,
  }) {
    return CommunityPost(
      id: id,
      title: title ?? this.title,
      body: body ?? this.body,
      authorId: authorId,
      authorName: authorName,
      authorRole: authorRole,
      scope: scope,
      courseId: courseId,
      publishedAt: publishedAt,
      isPublished: isPublished ?? this.isPublished,
    );
  }
}
