import 'package:gats_academy/features/auth/models/user_role.dart';

enum PostScope { global, course }

enum PostFeedSort { newest, oldest, titleAsc }

class PostCategory {
  const PostCategory({
    required this.id,
    required this.name,
    required this.slug,
    this.postCount = 0,
  });

  final String id;
  final String name;
  final String slug;
  final int postCount;
}

class PostComment {
  const PostComment({
    required this.id,
    required this.postId,
    required this.authorId,
    required this.authorName,
    required this.body,
    required this.createdAt,
  });

  final String id;
  final String postId;
  final String authorId;
  final String authorName;
  final String body;
  final DateTime createdAt;
}

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
    this.coverImage,
    this.isPublished = true,
    this.categoryId,
    this.categoryName,
    this.categorySlug,
  });

  final String id;
  final String title;
  final String body;
  final String authorId;
  final String authorName;
  final UserRole authorRole;
  final PostScope scope;
  final String? courseId;
  /// Asset path ảnh bìa, ví dụ `assets/images/images.jpg`.
  final String? coverImage;
  final DateTime publishedAt;
  final bool isPublished;
  final String? categoryId;
  final String? categoryName;
  final String? categorySlug;

  String get previewExcerpt {
    // Strip HTML/markdown markers for list cards.
    var plain = body.trim();
    plain = plain
        .replaceAll(RegExp(r'<[^>]*>', multiLine: true), ' ')
        .replaceAll(RegExp(r'^#{1,6}\s+', multiLine: true), '')
        .replaceAll(RegExp(r'\s+'), ' ')
        .replaceAll('&nbsp;', ' ')
        .trim();
    if (plain.length <= 160) return plain;
    return '${plain.substring(0, 157)}...';
  }

  String get badgeLabel {
    final cat = categoryName?.trim();
    if (cat != null && cat.isNotEmpty) return cat;
    return switch (scope) {
      PostScope.global => 'GATS',
      PostScope.course => 'Khóa học',
    };
  }

  CommunityPost copyWith({
    String? title,
    String? body,
    String? coverImage,
    bool? isPublished,
    String? categoryId,
    String? categoryName,
    String? categorySlug,
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
      coverImage: coverImage ?? this.coverImage,
      publishedAt: publishedAt,
      isPublished: isPublished ?? this.isPublished,
      categoryId: categoryId ?? this.categoryId,
      categoryName: categoryName ?? this.categoryName,
      categorySlug: categorySlug ?? this.categorySlug,
    );
  }
}
