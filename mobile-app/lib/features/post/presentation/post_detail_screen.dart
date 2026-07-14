import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/starry_sky_background.dart';
import 'package:gats_academy/data/mock/mock_course_store.dart';
import 'package:gats_academy/data/mock/mock_post_store.dart';
import 'package:gats_academy/data/mock/models/post_models.dart';
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
  final _commentController = TextEditingController();
  final _commentFocus = FocusNode();

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
    _commentController.dispose();
    _commentFocus.dispose();
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

  void _submitComment() {
    final user = _user;
    if (user == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(AppStrings.postCommentLogin)),
      );
      return;
    }
    final text = _commentController.text.trim();
    if (text.isEmpty) return;

    MockPostStore.instance.addComment(
      postId: widget.postId,
      authorId: user.id,
      authorName: user.displayName,
      body: text,
    );
    _commentController.clear();
    _commentFocus.unfocus();
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final post = MockPostStore.instance.postById(widget.postId);

    if (post == null) {
      return GatsThemedScaffold(
        appBar: AppBar(
          backgroundColor: gats.isStarry ? Colors.transparent : gats.background,
          surfaceTintColor: Colors.transparent,
        ),
        body: Center(child: Text(AppStrings.courseNotFound)),
      );
    }

    final role = _user?.role ?? UserRole.user;
    final canReadFull = MockPostStore.instance.canReadFull(
      post: post,
      userId: _user?.id,
      role: role,
    );
    final courseTitle = MockPostStore.instance.courseTitleFor(post);
    final course = post.courseId != null
        ? MockCourseStore.instance.courseById(post.courseId!)
        : null;
    final comments = MockPostStore.instance.commentsFor(post.id);
    final canComment = canReadFull && _user != null;

    return GatsThemedScaffold(
      appBar: AppBar(
        title: Text(post.badgeLabel),
        backgroundColor: gats.isStarry ? Colors.transparent : gats.background,
        surfaceTintColor: Colors.transparent,
        foregroundColor: gats.textPrimary,
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(AppSpacing.lg),
              children: [
                if (post.coverImage != null && post.coverImage!.isNotEmpty) ...[
                  PostCoverImage(
                    assetPath: post.coverImage!,
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                    fallbackSeed: post.id.hashCode,
                  ),
                  const SizedBox(height: AppSpacing.lg),
                ],
                if (courseTitle != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                    child: Text(
                      courseTitle,
                      style: Theme.of(context).textTheme.labelLarge?.copyWith(
                            color: gats.lavenderAccent,
                          ),
                    ),
                  ),
                Text(
                  post.title,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.w800,
                        color: gats.textPrimary,
                      ),
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  '${AppStrings.postByAuthor.replaceFirst('%s', post.authorName)} · ${formatPostTimeAgo(post.publishedAt)}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: gats.textSecondary,
                      ),
                ),
                const SizedBox(height: AppSpacing.xl),
                Text(
                  canReadFull ? post.body : post.previewExcerpt,
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        height: 1.55,
                        color: gats.textPrimary,
                      ),
                ),
                if (!canReadFull) ...[
                  const SizedBox(height: AppSpacing.lg),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    decoration: BoxDecoration(
                      color: gats.lavenderAccent.withValues(alpha: gats.isStarry ? 0.12 : 0.06),
                      borderRadius: BorderRadius.circular(AppRadius.lg),
                      border: Border.all(
                        color: gats.lavenderAccent.withValues(alpha: 0.25),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.lock_outline, color: gats.lavenderAccent),
                            const SizedBox(width: AppSpacing.sm),
                            Expanded(
                              child: Text(
                                AppStrings.postPreviewLocked,
                                style: TextStyle(
                                  fontWeight: FontWeight.w700,
                                  color: gats.textPrimary,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        Text(
                          _user == null ? AppStrings.postPreviewLogin : AppStrings.postPreviewLocked,
                          style: TextStyle(color: gats.textSecondary, height: 1.45),
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
                if (canReadFull) ...[
                  const SizedBox(height: AppSpacing.xl),
                  Divider(color: gats.divider.withValues(alpha: 0.7)),
                  const SizedBox(height: AppSpacing.lg),
                  Text(
                    AppStrings.postCommentsCount(comments.length),
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w800,
                          color: gats.textPrimary,
                        ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  if (comments.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: AppSpacing.lg),
                      child: Text(
                        AppStrings.postCommentsEmpty,
                        style: TextStyle(color: gats.textSecondary, height: 1.4),
                      ),
                    )
                  else
                    ...comments.map(
                      (comment) => Padding(
                        padding: const EdgeInsets.only(bottom: AppSpacing.md),
                        child: _CommentTile(comment: comment),
                      ),
                    ),
                  const SizedBox(height: AppSpacing.xl),
                ],
              ],
            ),
          ),
          if (canReadFull)
            _CommentComposer(
              controller: _commentController,
              focusNode: _commentFocus,
              enabled: canComment,
              onSend: _submitComment,
            ),
        ],
      ),
    );
  }
}

class _CommentTile extends StatelessWidget {
  const _CommentTile({required this.comment});

  final PostComment comment;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final initial = comment.authorName.isNotEmpty
        ? comment.authorName.characters.first.toUpperCase()
        : '?';

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        CircleAvatar(
          radius: 18,
          backgroundColor: gats.lavenderAccent.withValues(alpha: 0.15),
          child: Text(
            initial,
            style: TextStyle(
              fontWeight: FontWeight.w800,
              color: gats.lavenderAccent,
              fontSize: 14,
            ),
          ),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: gats.surface.withValues(alpha: gats.isStarry ? 0.85 : 1),
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border.all(color: gats.divider.withValues(alpha: 0.6)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        comment.authorName,
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 13,
                          color: gats.textPrimary,
                        ),
                      ),
                    ),
                    Text(
                      formatPostTimeAgo(comment.createdAt),
                      style: TextStyle(
                        fontSize: 11,
                        color: gats.textSecondary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  comment.body,
                  style: TextStyle(
                    fontSize: 14,
                    height: 1.45,
                    color: gats.textPrimary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _CommentComposer extends StatelessWidget {
  const _CommentComposer({
    required this.controller,
    required this.focusNode,
    required this.enabled,
    required this.onSend,
  });

  final TextEditingController controller;
  final FocusNode focusNode;
  final bool enabled;
  final VoidCallback onSend;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final bottom = MediaQuery.paddingOf(context).bottom;

    return Material(
      color: gats.surface.withValues(alpha: gats.isStarry ? 0.95 : 1),
      elevation: gats.isStarry ? 0 : 6,
      shadowColor: Colors.black26,
      child: Container(
        decoration: BoxDecoration(
          border: Border(top: BorderSide(color: gats.divider.withValues(alpha: 0.6))),
        ),
        padding: EdgeInsets.fromLTRB(
          AppSpacing.lg,
          AppSpacing.md,
          AppSpacing.md,
          AppSpacing.md + bottom,
        ),
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: controller,
                focusNode: focusNode,
                enabled: enabled,
                minLines: 1,
                maxLines: 4,
                textInputAction: TextInputAction.send,
                onSubmitted: (_) {
                  if (enabled) onSend();
                },
                decoration: InputDecoration(
                  hintText: enabled ? AppStrings.postCommentHint : AppStrings.postCommentLogin,
                  filled: true,
                  fillColor: gats.background,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.sm,
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.pill),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            IconButton.filled(
              onPressed: enabled ? onSend : null,
              style: IconButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                disabledBackgroundColor: gats.divider,
              ),
              icon: const Icon(Icons.send_rounded),
              tooltip: AppStrings.postCommentSend,
            ),
          ],
        ),
      ),
    );
  }
}
