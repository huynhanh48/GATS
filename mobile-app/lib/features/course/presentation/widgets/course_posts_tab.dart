import 'package:flutter/material.dart';
import 'package:gats_academy/core/navigation/gats_main_navigator.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/data/post_store.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/features/post/presentation/post_compose_screen.dart';
import 'package:gats_academy/features/post/presentation/post_detail_screen.dart';
import 'package:gats_academy/features/post/presentation/widgets/post_card.dart';

class CoursePostsTab extends StatelessWidget {
  const CoursePostsTab({
    super.key,
    required this.courseId,
    required this.userId,
    required this.userName,
    required this.role,
    required this.isMentor,
    required this.onEnroll,
  });

  final String courseId;
  final String? userId;
  final String userName;
  final UserRole role;
  final bool isMentor;
  final VoidCallback onEnroll;

  Future<void> _openCompose(BuildContext context) async {
    if (userId == null) return;
    final published = await GatsMainNavigator.push<bool>(
      context,
      PostComposeScreen(
        authorId: userId!,
        authorName: userName,
        authorRole: role,
        fixedCourseId: courseId,
      ),
    );
    if (published == true && context.mounted) {
      // store notifies listeners
    }
  }

  void _openPost(BuildContext context, String postId) {
    GatsMainNavigator.push(
      context,
      PostDetailScreen(
        postId: postId,
        onEnroll: onEnroll,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final posts = PostStore.instance.postsForCourse(courseId);

    return Stack(
      children: [
        if (posts.isEmpty)
          Center(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.xl),
              child: Text(
                AppStrings.postEmptyCourse,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
              ),
            ),
          )
        else
          ListView.separated(
            padding: EdgeInsets.fromLTRB(
              AppSpacing.lg,
              AppSpacing.lg,
              AppSpacing.lg,
              isMentor ? 88 : AppSpacing.lg,
            ),
            itemCount: posts.length,
            separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.md),
            itemBuilder: (context, index) {
              final post = posts[index];
              final canReadFull = PostStore.instance.canReadFull(
                post: post,
                userId: userId,
                role: role,
              );
              return PostCard(
                post: post,
                canReadFull: canReadFull,
                courseTitle: PostStore.instance.courseTitleFor(post),
                onTap: () => _openPost(context, post.id),
              );
            },
          ),
        if (isMentor)
          Positioned(
            right: AppSpacing.lg,
            bottom: AppSpacing.lg,
            child: FilledButton.icon(
              onPressed: () => _openCompose(context),
              icon: const Icon(Icons.edit_outlined, size: 18),
              label: Text(AppStrings.postMentorCompose),
            ),
          ),
      ],
    );
  }
}
