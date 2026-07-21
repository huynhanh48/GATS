import 'package:gats_academy/data/mock/models/post_models.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';

/// Map JSON từ BE post/comment → model UI mobile.
abstract final class PostBeMapper {
  static CommunityPost fromListItem(Map<String, dynamic> json) {
    final author = json['author'];
    final authorId = author is Map ? '${author['id'] ?? ''}' : '';
    final authorName = author is Map
        ? (author['userName'] as String? ?? 'Thành viên')
        : 'Thành viên';

    final publishedRaw = json['publishedAt'] ?? json['createdAt'];
    final publishedAt = publishedRaw is String
        ? DateTime.tryParse(publishedRaw) ?? DateTime.now()
        : DateTime.now();

    final excerpt = json['excerpt'] as String?;
    final content = json['content'] as String?;
    final body = (content != null && content.isNotEmpty)
        ? content
        : (excerpt ?? '');

    final status = json['status'] as String? ?? 'published';

    return CommunityPost(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      body: body,
      authorId: authorId,
      authorName: authorName,
      authorRole: UserRole.user,
      scope: PostScope.global,
      coverImage: json['thumbnail'] as String?,
      publishedAt: publishedAt,
      isPublished: status == 'published',
    );
  }

  static CommunityPost fromDetail(Map<String, dynamic> json) {
    return fromListItem(json);
  }

  static PostComment fromCommentJson(Map<String, dynamic> json) {
    final author = json['author'];
    final authorId = author is Map
        ? '${author['id'] ?? ''}'
        : '${json['userId'] ?? ''}';
    final authorName = author is Map
        ? (author['userName'] as String? ?? 'Thành viên')
        : 'Thành viên';

    final createdRaw = json['createdAt'];
    final createdAt = createdRaw is String
        ? DateTime.tryParse(createdRaw) ?? DateTime.now()
        : DateTime.now();

    return PostComment(
      id: json['id'] as String? ?? '',
      postId: json['postId'] as String? ?? '',
      authorId: authorId,
      authorName: authorName,
      body: json['content'] as String? ?? '',
      createdAt: createdAt,
    );
  }
}
