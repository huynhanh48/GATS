import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/navigation/gats_main_navigator.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/ted/ted.dart';
import 'package:gats_academy/data/post_store.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/features/post/presentation/post_detail_screen.dart';
import 'package:gats_academy/features/post/presentation/posts_feed_screen.dart';
import 'package:gats_academy/features/post/presentation/widgets/post_card.dart';

class HomePostsSection extends StatelessWidget {
  const HomePostsSection({
    super.key,
    required this.userId,
    required this.role,
    this.onEnrollFromPost,
  });

  final String? userId;
  final UserRole role;
  final void Function(String courseId)? onEnrollFromPost;

  @override
  Widget build(BuildContext context) {
    final posts = PostStore.instance.featuredForUser(userId: userId, role: role);
    if (posts.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TedSectionHeader(
          title: AppStrings.homeFeaturedPosts,
          actionLabel: AppStrings.postSeeAll,
          onAction: () => GatsMainNavigator.push(context, const PostsFeedScreen()),
        ),
        const SizedBox(height: AppSpacing.md),
        ...posts.map((post) {
          final canReadFull = PostStore.instance.canReadFull(
            post: post,
            userId: userId,
            role: role,
          );
          return Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.md),
            child: PostCard(
              post: post,
              canReadFull: canReadFull,
              courseTitle: PostStore.instance.courseTitleFor(post),
              compact: true,
              onTap: () {
                GatsMainNavigator.push(
                  context,
                  PostDetailScreen(
                    postId: post.id,
                    onEnroll: post.courseId != null && onEnrollFromPost != null
                        ? () => onEnrollFromPost!(post.courseId!)
                        : null,
                  ),
                );
              },
            ),
          );
        }),
      ],
    );
  }
}
