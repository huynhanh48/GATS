import 'package:flutter/foundation.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/data/api/post_api_service.dart';
import 'package:gats_academy/data/mock/models/post_models.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/features/course/course_module.dart';

/// Store bài viết lấy dữ liệu từ backend.
class PostStore extends ChangeNotifier {
  PostStore._();
  static final PostStore instance = PostStore._();

  List<CommunityPost> _posts = [];
  List<PostComment> _comments = [];
  bool _syncing = false;

  List<CommunityPost> get posts =>
      List.unmodifiable(_posts.where((post) => post.isPublished));
  List<CommunityPost> get allPosts => List.unmodifiable(_posts);
  bool get isSyncing => _syncing;

  Future<void> syncFromApi({String? focusPostId}) async {
    if (_syncing) return;
    _syncing = true;
    notifyListeners();
    try {
      final token = await AuthPrefs.accessToken();
      _posts = await PostApiService.listPublished(token: token);
      if (focusPostId != null && focusPostId.isNotEmpty) {
        await loadComments(focusPostId);
        try {
          final detail = await PostApiService.getById(focusPostId, token: token);
          if (detail != null) {
            final index = _posts.indexWhere((post) => post.id == focusPostId);
            if (index >= 0) {
              _posts[index] = detail;
            } else {
              _posts = [detail, ..._posts];
            }
          }
        } catch (error) {
          debugPrint('PostStore: getById failed — $error');
        }
      }
    } catch (error) {
      debugPrint('PostStore: syncFromApi failed — $error');
    } finally {
      _syncing = false;
      notifyListeners();
    }
  }

  Future<void> loadComments(String postId) async {
    try {
      final token = await AuthPrefs.accessToken();
      final remote = await PostApiService.listComments(postId, token: token);
      _comments = [
        ..._comments.where((comment) => comment.postId != postId),
        ...remote,
      ];
      notifyListeners();
    } catch (error) {
      debugPrint('PostStore: loadComments failed — $error');
    }
  }

  List<PostComment> commentsFor(String postId) {
    return _comments.where((comment) => comment.postId == postId).toList()
      ..sort((a, b) => a.createdAt.compareTo(b.createdAt));
  }

  int commentCount(String postId) =>
      _comments.where((comment) => comment.postId == postId).length;

  Future<void> addComment({
    required String postId,
    required String authorId,
    required String authorName,
    required String body,
  }) async {
    final trimmed = body.trim();
    if (trimmed.isEmpty || postById(postId) == null) return;

    final token = await AuthPrefs.accessToken();
    if (token == null) return;

    try {
      final created = await PostApiService.createComment(
        postId: postId,
        content: trimmed,
        token: token,
        authorId: authorId,
        authorName: authorName,
      );
      if (created != null) {
        _comments = [..._comments, created];
        notifyListeners();
      }
    } catch (error) {
      debugPrint('PostStore: createComment API failed — $error');
    }
  }

  CommunityPost? postById(String id) {
    for (final post in _posts) {
      if (post.id == id) return post;
    }
    return null;
  }

  List<CommunityPost> feedForUser({
    required String? userId,
    required UserRole role,
    int limit = 6,
  }) {
    final published = posts.toList()
      ..sort((a, b) => b.publishedAt.compareTo(a.publishedAt));
    return published.take(limit).toList();
  }

  List<CommunityPost> featuredForUser({
    required String? userId,
    required UserRole role,
    int limit = 6,
  }) {
    return feedForUser(userId: userId, role: role, limit: limit);
  }

  List<CommunityPost> postsForCourse(String courseId) {
    return posts
        .where((post) =>
            post.scope == PostScope.course && post.courseId == courseId)
        .toList()
      ..sort((a, b) => b.publishedAt.compareTo(a.publishedAt));
  }

  bool canReadFull({
    required CommunityPost post,
    required String? userId,
    required UserRole role,
  }) {
    if (!post.isPublished) return false;
    if (post.scope == PostScope.global) return true;

    final courseId = post.courseId;
    if (courseId == null) return false;
    return CourseModule.repository.isOwned(courseId, userId, role: role);
  }

  String? courseTitleFor(CommunityPost post) {
    if (post.courseId == null) return null;
    return CourseModule.repository.getCourse(post.courseId!)?.title;
  }

  Future<bool> addPost({
    required String title,
    required String body,
    required String authorId,
    required String authorName,
    required UserRole authorRole,
    required PostScope scope,
    String? courseId,
    String? coverImage,
  }) async {
    final token = await AuthPrefs.accessToken();
    if (token == null) return false;
    try {
      final trimmedBody = body.trim();
      final created = await PostApiService.createPost(
        title: title.trim(),
        content: trimmedBody,
        token: token,
        excerpt: trimmedBody.length > 160
            ? '${trimmedBody.substring(0, 157)}...'
            : trimmedBody,
      );
      if (created == null) return false;
      _posts = [created, ..._posts];
      notifyListeners();
      return true;
    } catch (error) {
      debugPrint('PostStore: createPost failed — $error');
      return false;
    }
  }

  Future<void> togglePublish(String postId) async {
    final index = _posts.indexWhere((post) => post.id == postId);
    if (index < 0) return;
    final post = _posts[index];
    final token = await AuthPrefs.accessToken();
    if (token == null) return;

    try {
      if (post.isPublished) {
        await PostApiService.unpublishPost(postId: postId, token: token);
        _posts[index] = post.copyWith(isPublished: false);
      } else {
        await PostApiService.publishPost(postId: postId, token: token);
        _posts[index] = post.copyWith(isPublished: true);
      }
      notifyListeners();
    } catch (error) {
      debugPrint('PostStore: togglePublish failed — $error');
    }
  }
}
