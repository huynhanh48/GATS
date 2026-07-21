import 'package:flutter/foundation.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/data/api/post_api_service.dart';
import 'package:gats_academy/data/mock/models/post_models.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/features/course/course_module.dart';

/// Store bài viết — nguồn chính là BE (`PostApiService`).
class MockPostStore extends ChangeNotifier {
  MockPostStore._();
  static final MockPostStore instance = MockPostStore._();

  List<CommunityPost> _posts = [];
  List<PostComment> _comments = [];
  bool _syncing = false;

  List<CommunityPost> get posts =>
      List.unmodifiable(_posts.where((p) => p.isPublished));

  List<CommunityPost> get allPosts => List.unmodifiable(_posts);

  bool get isSyncing => _syncing;

  Future<void> syncFromApi({String? focusPostId}) async {
    if (_syncing) return;
    _syncing = true;
    notifyListeners();
    try {
      final token = await AuthPrefs.accessToken();
      final remote = await PostApiService.listPublished(token: token);
      _posts = remote;

      if (focusPostId != null && focusPostId.isNotEmpty) {
        await loadComments(focusPostId);
        try {
          final detail =
              await PostApiService.getById(focusPostId, token: token);
          if (detail != null) {
            final idx = _posts.indexWhere((p) => p.id == focusPostId);
            if (idx >= 0) {
              _posts[idx] = detail;
            } else {
              _posts = [detail, ..._posts];
            }
          }
        } catch (e) {
          debugPrint('MockPostStore: getById failed — $e');
        }
      }
    } catch (e) {
      debugPrint('MockPostStore: syncFromApi failed — $e');
    } finally {
      _syncing = false;
      notifyListeners();
    }
  }

  Future<void> loadComments(String postId) async {
    try {
      final token = await AuthPrefs.accessToken();
      final remote =
          await PostApiService.listComments(postId, token: token);
      _comments = [
        ..._comments.where((c) => c.postId != postId),
        ...remote,
      ];
      notifyListeners();
    } catch (e) {
      debugPrint('MockPostStore: loadComments failed — $e');
    }
  }

  List<PostComment> commentsFor(String postId) {
    return _comments.where((c) => c.postId == postId).toList()
      ..sort((a, b) => a.createdAt.compareTo(b.createdAt));
  }

  int commentCount(String postId) =>
      _comments.where((c) => c.postId == postId).length;

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
    } catch (e) {
      debugPrint('MockPostStore: createComment API failed — $e');
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
        .where((p) => p.scope == PostScope.course && p.courseId == courseId)
        .toList()
      ..sort((a, b) => b.publishedAt.compareTo(a.publishedAt));
  }

  bool canReadFull({
    required CommunityPost post,
    required String? userId,
    required UserRole role,
  }) {
    if (!post.isPublished && role != UserRole.admin) {
      if (role == UserRole.mentor && post.authorId == userId) return true;
      return false;
    }

    if (post.scope == PostScope.global) return true;

    final courseId = post.courseId;
    if (courseId == null) return false;

    if (role == UserRole.admin) return true;
    final course = CourseModule.repository.getCourse(courseId);
    if (course != null &&
        role == UserRole.mentor &&
        course.isManagedBy(userId)) {
      return true;
    }
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
      final created = await PostApiService.createPost(
        title: title.trim(),
        content: body.trim(),
        token: token,
        excerpt: body.trim().length > 160
            ? '${body.trim().substring(0, 157)}...'
            : body.trim(),
      );
      if (created == null) return false;
      _posts = [created, ..._posts];
      notifyListeners();
      return true;
    } catch (e) {
      debugPrint('MockPostStore: createPost failed — $e');
      return false;
    }
  }

  Future<void> togglePublish(String postId) async {
    final index = _posts.indexWhere((p) => p.id == postId);
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
    } catch (e) {
      debugPrint('MockPostStore: togglePublish failed — $e');
    }
  }
}
