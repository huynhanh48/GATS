import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/ted/ted.dart';
import 'package:gats_academy/data/mock/mock_post_store.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/features/post/presentation/post_detail_screen.dart';
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
    final posts = MockPostStore.instance.feedForUser(userId: userId, role: role);
    if (posts.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TedSectionHeader(
          title: AppStrings.postHomeSectionTitle,
          actionLabel: AppStrings.postSeeAll,
          onAction: () {},
        ),
        const SizedBox(height: AppSpacing.md),
        ...posts.take(3).map((post) {
          final canReadFull = MockPostStore.instance.canReadFull(
            post: post,
            userId: userId,
            role: role,
          );
          return Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.md),
            child: PostCard(
              post: post,
              canReadFull: canReadFull,
              courseTitle: MockPostStore.instance.courseTitleFor(post),
              compact: true,
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => PostDetailScreen(
                      postId: post.id,
                      onEnroll: post.courseId != null && onEnrollFromPost != null
                          ? () => onEnrollFromPost!(post.courseId!)
                          : null,
                    ),
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
