import 'package:gats_academy/core/network/api_client.dart';
import 'package:gats_academy/data/api/course_api_paths.dart';
import 'package:gats_academy/data/api/post_be_mapper.dart';
import 'package:gats_academy/data/mock/models/post_models.dart';

/// Gọi BE `/api/posts` + comments.
abstract final class PostApiService {
  static Future<List<CommunityPost>> listPublished({
    String? token,
    int page = 1,
    int limit = 50,
    String? categorySlug,
  }) async {
    final query = <String, String>{
      'page': '$page',
      'limit': '$limit',
      'status': 'published',
    };
    if (categorySlug != null && categorySlug.isNotEmpty) {
      query['category'] = categorySlug;
    }
    final json = await ApiClient.get(
      PostApiPaths.list,
      token: token,
      query: query,
    );
    final data = json['data'];
    if (data is! List) return [];
    return data
        .whereType<Map>()
        .map((e) => PostBeMapper.fromListItem(Map<String, dynamic>.from(e)))
        .toList();
  }

  static Future<CommunityPost?> getById(String id, {String? token}) async {
    final json = await ApiClient.get(PostApiPaths.byId(id), token: token);
    final post = json['post'] ?? json['data'];
    if (post is! Map) return null;
    return PostBeMapper.fromDetail(Map<String, dynamic>.from(post));
  }

  static Future<CommunityPost?> getBySlug(String slug, {String? token}) async {
    final json = await ApiClient.get(PostApiPaths.bySlug(slug), token: token);
    final post = json['post'] ?? json['data'];
    if (post is! Map) return null;
    return PostBeMapper.fromDetail(Map<String, dynamic>.from(post));
  }

  static Future<CommunityPost?> createPost({
    required String title,
    required String content,
    required String token,
    String? excerpt,
    String visibility = 'public',
  }) async {
    final json = await ApiClient.post(
      PostApiPaths.list,
      body: {
        'title': title,
        'content': content,
        if (excerpt != null && excerpt.isNotEmpty) 'excerpt': excerpt,
        'visibility': visibility,
      },
      token: token,
    );
    final post = json['post'];
    if (post is! Map) return null;
    final mapped =
        PostBeMapper.fromDetail(Map<String, dynamic>.from(post));
    // Create mặc định draft — publish ngay để feed thấy.
    try {
      await ApiClient.post(
        '${PostApiPaths.byId(mapped.id)}/publish',
        token: token,
      );
    } catch (_) {
      // Giữ draft nếu không có quyền publish.
    }
    return mapped.copyWith(isPublished: true);
  }

  static Future<void> publishPost({
    required String postId,
    required String token,
  }) async {
    await ApiClient.post(
      '${PostApiPaths.byId(postId)}/publish',
      token: token,
    );
  }

  static Future<void> unpublishPost({
    required String postId,
    required String token,
  }) async {
    await ApiClient.post(
      '${PostApiPaths.byId(postId)}/unpublish',
      token: token,
    );
  }

  static Future<List<PostComment>> listComments(
    String postId, {
    String? token,
    int page = 1,
    int limit = 50,
  }) async {
    final json = await ApiClient.get(
      PostApiPaths.comments(postId),
      token: token,
      query: {
        'page': '$page',
        'limit': '$limit',
      },
    );
    final data = json['data'];
    if (data is! List) return [];
    return data
        .whereType<Map>()
        .map((e) => PostBeMapper.fromCommentJson(Map<String, dynamic>.from(e)))
        .toList();
  }

  static Future<PostComment?> createComment({
    required String postId,
    required String content,
    required String token,
    required String authorId,
    required String authorName,
  }) async {
    final json = await ApiClient.post(
      PostApiPaths.comments(postId),
      body: {'content': content},
      token: token,
    );
    final comment = json['comment'] ?? json['data'] ?? json;
    if (comment is! Map) {
      // BE có thể trả CommentRecord không kèm author — dựng từ input.
      final id = (json['id'] ?? comment)?.toString();
      if (id == null || id.isEmpty) return null;
      return PostComment(
        id: id,
        postId: postId,
        authorId: authorId,
        authorName: authorName,
        body: content,
        createdAt: DateTime.now(),
      );
    }
    final map = Map<String, dynamic>.from(comment);
    map.putIfAbsent('postId', () => postId);
    if (map['author'] is! Map) {
      return PostComment(
        id: map['id']?.toString() ?? '',
        postId: postId,
        authorId: authorId,
        authorName: authorName,
        body: map['content']?.toString() ?? content,
        createdAt: DateTime.tryParse(map['createdAt']?.toString() ?? '') ??
            DateTime.now(),
      );
    }
    return PostBeMapper.fromCommentJson(map);
  }
}
