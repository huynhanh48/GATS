import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/data/mock/mock_course_store.dart';
import 'package:gats_academy/data/mock/mock_post_store.dart';
import 'package:gats_academy/features/auth/models/auth_user.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/features/post/presentation/widgets/post_card.dart';

class PostDetailScreen extends StatefulWidget {
  const PostDetailScreen({
    super.key,
    required this.postId,
    this.onEnroll,
  });

  final String postId;
  final VoidCallback? onEnroll;

  @override
  State<PostDetailScreen> createState() => _PostDetailScreenState();
}

class _PostDetailScreenState extends State<PostDetailScreen> {
  AuthUser? _user;

  @override
  void initState() {
    super.initState();
    _loadUser();
    MockPostStore.instance.addListener(_onStoreChanged);
    MockCourseStore.instance.addListener(_onStoreChanged);
  }

  Future<void> _loadUser() async {
    final user = await AuthPrefs.currentUser();
    if (!mounted) return;
    setState(() => _user = user);
  }

  void _onStoreChanged() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    MockPostStore.instance.removeListener(_onStoreChanged);
    MockCourseStore.instance.removeListener(_onStoreChanged);
    super.dispose();
  }

  void _handleEnroll(String courseId) {
    final userId = _user?.id;
    if (userId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(AppStrings.courseLoginToEnroll)),
      );
      return;
    }
    MockCourseStore.instance.enrollUser(courseId, userId);
    if (widget.onEnroll != null) {
      widget.onEnroll!();
    } else {
      final course = MockCourseStore.instance.courseById(courseId);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            AppStrings.courseEnrolled.replaceFirst('%s', course?.title ?? 'khóa học'),
          ),
        ),
      );
    }
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final post = MockPostStore.instance.postById(widget.postId);
    if (post == null) {
      return Scaffold(
        appBar: AppBar(),
        body: Center(child: Text(AppStrings.courseNotFound)),
      );
    }

    final role = _user?.role ?? UserRole.guest;
    final canReadFull = MockPostStore.instance.canReadFull(
      post: post,
      userId: _user?.id,
      role: role,
    );
    final courseTitle = MockPostStore.instance.courseTitleFor(post);
    final course = post.courseId != null
        ? MockCourseStore.instance.courseById(post.courseId!)
        : null;

    return Scaffold(
      appBar: AppBar(title: Text(post.badgeLabel)),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          if (courseTitle != null)
            Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.sm),
              child: Text(
                courseTitle,
                style: Theme.of(context).textTheme.labelLarge?.copyWith(color: AppColors.primary),
              ),
            ),
          Text(
            post.title,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            '${AppStrings.postByAuthor.replaceFirst('%s', post.authorName)} · ${formatPostTimeAgo(post.publishedAt)}',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: AppSpacing.xl),
          Text(
            canReadFull ? post.body : post.previewExcerpt,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(height: 1.55),
          ),
          if (!canReadFull) ...[
            const SizedBox(height: AppSpacing.lg),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(AppRadius.lg),
                border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.lock_outline, color: AppColors.primary),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: Text(
                          AppStrings.postPreviewLocked,
                          style: const TextStyle(fontWeight: FontWeight.w700),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    _user == null ? AppStrings.postPreviewLogin : AppStrings.postPreviewLocked,
                    style: const TextStyle(color: AppColors.textSecondary, height: 1.45),
                  ),
                  if (post.courseId != null && course != null) ...[
                    const SizedBox(height: AppSpacing.lg),
                    FilledButton(
                      onPressed: () => _handleEnroll(course.id),
                      child: Text(
                        course.isFree ? AppStrings.postEnrollFreeCta : AppStrings.postEnrollCta,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
