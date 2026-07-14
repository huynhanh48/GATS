import 'package:flutter/foundation.dart';
import 'package:gats_academy/core/constants/course_cover_assets.dart';
import 'package:gats_academy/data/mock/mock_accounts.dart';
import 'package:gats_academy/data/mock/mock_course_store.dart';
import 'package:gats_academy/data/mock/models/post_models.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';

class MockPostStore extends ChangeNotifier {
  MockPostStore._();
  static final MockPostStore instance = MockPostStore._();

  List<CommunityPost> _posts = _seedPosts();
  List<PostComment> _comments = _seedComments();

  List<CommunityPost> get posts => List.unmodifiable(_posts.where((p) => p.isPublished));

  List<CommunityPost> get allPosts => List.unmodifiable(_posts);

  List<PostComment> commentsFor(String postId) {
    return _comments.where((c) => c.postId == postId).toList()
      ..sort((a, b) => a.createdAt.compareTo(b.createdAt));
  }

  int commentCount(String postId) =>
      _comments.where((c) => c.postId == postId).length;

  void addComment({
    required String postId,
    required String authorId,
    required String authorName,
    required String body,
  }) {
    final trimmed = body.trim();
    if (trimmed.isEmpty || postById(postId) == null) return;

    _comments = [
      ..._comments,
      PostComment(
        id: 'comment-${DateTime.now().millisecondsSinceEpoch}',
        postId: postId,
        authorId: authorId,
        authorName: authorName,
        body: trimmed,
        createdAt: DateTime.now(),
      ),
    ];
    notifyListeners();
  }

  CommunityPost? postById(String id) {
    for (final post in _posts) {
      if (post.id == id) return post;
    }
    return null;
  }

  /// Bài hiển thị trên Home: tin GATS + bài khóa user đang học / tất cả course published preview.
  List<CommunityPost> feedForUser({
    required String? userId,
    required UserRole role,
    int limit = 6,
  }) {
    final published = posts.toList()
      ..sort((a, b) => b.publishedAt.compareTo(a.publishedAt));

    final visible = published.where((post) {
      if (post.scope == PostScope.global) return true;
      return post.courseId != null;
    }).toList();

    return visible.take(limit).toList();
  }

  /// Bài nổi bật trên Home — ưu tiên tin GATS + mới nhất.
  List<CommunityPost> featuredForUser({
    required String? userId,
    required UserRole role,
    int limit = 6,
  }) {
    final feed = feedForUser(userId: userId, role: role, limit: 20);
    final global = feed.where((p) => p.scope == PostScope.global).toList();
    final rest = feed.where((p) => p.scope != PostScope.global).toList();
    return [...global, ...rest].take(limit).toList();
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
    final course = MockCourseStore.instance.courseById(courseId);
    if (course == null) return false;

    if (role == UserRole.admin) return true;
    if (role == UserRole.mentor && course.isManagedBy(userId)) return true;
    if (role == UserRole.user && course.isOwnedBy(userId)) return true;
    return false;
  }

  String? courseTitleFor(CommunityPost post) {
    if (post.courseId == null) return null;
    return MockCourseStore.instance.courseById(post.courseId!)?.title;
  }

  void addPost({
    required String title,
    required String body,
    required String authorId,
    required String authorName,
    required UserRole authorRole,
    required PostScope scope,
    String? courseId,
    String? coverImage,
  }) {
    final id = 'post-${DateTime.now().millisecondsSinceEpoch}';
    _posts = [
      CommunityPost(
        id: id,
        title: title.trim(),
        body: body.trim(),
        authorId: authorId,
        authorName: authorName,
        authorRole: authorRole,
        scope: scope,
        courseId: courseId,
        coverImage: coverImage ?? CourseCoverAssets.pathForSeed(id.hashCode),
        publishedAt: DateTime.now(),
      ),
      ..._posts,
    ];
    notifyListeners();
  }

  void togglePublish(String postId) {
    final index = _posts.indexWhere((p) => p.id == postId);
    if (index < 0) return;
    _posts[index] = _posts[index].copyWith(isPublished: !_posts[index].isPublished);
    notifyListeners();
  }

  static List<CommunityPost> _seedPosts() {
    final now = DateTime.now();
    return [
      CommunityPost(
        id: 'post-global-1',
        title: 'Chào mừng đến GATS Academy — Lộ trình AI cho người đi làm',
        body:
            'GATS Academy giúp bạn học AI theo nhịp công việc thực tế: flashcard hàng ngày, khóa học ngắn gọn, và AI Coach 24/7. '
            'Bắt đầu với khóa miễn phí Prompt Engineering hoặc đăng ký khóa AI cho dân văn phòng để nhận lộ trình cá nhân từ mentor.',
        authorId: MockAccounts.admin.id,
        authorName: MockAccounts.admin.displayName,
        authorRole: UserRole.admin,
        scope: PostScope.global,
        coverImage: CourseCoverAssets.pathForIndex(0),
        publishedAt: now.subtract(const Duration(hours: 2)),
      ),
      CommunityPost(
        id: 'post-course-1',
        title: 'Tuần này: 3 prompt mẫu cho email & báo cáo',
        body:
            'Chào cả lớp! Dưới đây là 3 prompt mẫu bạn có thể dùng ngay:\n\n'
            '1. Viết email xin phép nghỉ — tone chuyên nghiệp\n'
            '2. Tóm tắt cuộc họp 30 phút thành bullet action items\n'
            '3. Chuyển bảng số liệu Excel thành đoạn phân tích cho sếp\n\n'
            'Làm bài quiz tuần 1 trước thứ Sáu nhé. Có thắc mắc ping trong GroupChat.',
        authorId: MockAccounts.mentor.id,
        authorName: MockAccounts.mentor.displayName,
        authorRole: UserRole.mentor,
        scope: PostScope.course,
        courseId: 'course-1',
        coverImage: CourseCoverAssets.pathForIndex(1),
        publishedAt: now.subtract(const Duration(hours: 5)),
      ),
      CommunityPost(
        id: 'post-course-2',
        title: 'Mở khóa Prompt Engineering — Bài đọc đầu tiên',
        body:
            'Khóa miễn phí này dành cho ai muốn nắm zero-shot và few-shot trước khi vào khóa nâng cao. '
            'Đăng ký miễn phí để đọc toàn bộ series bài viết mentor đăng mỗi tuần, kèm quiz và flashcard ôn tập.',
        authorId: MockAccounts.mentor.id,
        authorName: MockAccounts.mentor.displayName,
        authorRole: UserRole.mentor,
        scope: PostScope.course,
        courseId: 'course-2',
        coverImage: CourseCoverAssets.pathForIndex(2),
        publishedAt: now.subtract(const Duration(days: 1)),
      ),
    ];
  }

  static List<PostComment> _seedComments() {
    final now = DateTime.now();
    return [
      PostComment(
        id: 'c-1',
        postId: 'post-global-1',
        authorId: MockAccounts.user.id,
        authorName: MockAccounts.user.displayName,
        body: 'Tuyệt vời! Mình đang học khóa AI văn phòng, lộ trình rất rõ ràng.',
        createdAt: now.subtract(const Duration(hours: 1, minutes: 20)),
      ),
      PostComment(
        id: 'c-2',
        postId: 'post-global-1',
        authorId: MockAccounts.mentor.id,
        authorName: MockAccounts.mentor.displayName,
        body: 'Welcome cả nhà! Có câu hỏi cứ hỏi trong GroupChat của khóa nhé.',
        createdAt: now.subtract(const Duration(minutes: 40)),
      ),
      PostComment(
        id: 'c-3',
        postId: 'post-course-1',
        authorId: MockAccounts.user.id,
        authorName: MockAccounts.user.displayName,
        body: 'Prompt số 2 cực hữu ích cho họp chiều nay 🙌',
        createdAt: now.subtract(const Duration(hours: 2)),
      ),
    ];
  }
}
