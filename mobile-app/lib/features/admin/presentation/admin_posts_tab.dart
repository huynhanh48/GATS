import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/navigation/gats_main_navigator.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/starry_sky_background.dart';
import 'package:gats_academy/core/widgets/section_card.dart';
import 'package:gats_academy/data/mock/mock_accounts.dart';
import 'package:gats_academy/data/mock/mock_post_store.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/features/post/presentation/post_compose_screen.dart';
import 'package:gats_academy/features/post/presentation/post_detail_screen.dart';

class AdminPostsTab extends StatefulWidget {
  const AdminPostsTab({super.key});

  @override
  State<AdminPostsTab> createState() => _AdminPostsTabState();
}

class _AdminPostsTabState extends State<AdminPostsTab> {
  @override
  void initState() {
    super.initState();
    MockPostStore.instance.addListener(_onChanged);
    MockPostStore.instance.syncFromApi();
  }

  void _onChanged() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    MockPostStore.instance.removeListener(_onChanged);
    super.dispose();
  }

  Future<void> _compose() async {
    await GatsMainNavigator.push<bool>(
      context,
      PostComposeScreen(
        authorId: MockAccounts.admin.id,
        authorName: MockAccounts.admin.displayName,
        authorRole: UserRole.admin,
        allowGlobal: true,
      ),
    );
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final posts = MockPostStore.instance.allPosts.toList()
      ..sort((a, b) => b.publishedAt.compareTo(a.publishedAt));

    return GatsThemedScaffold(
      showStarryBackground: false,
      appBar: AppBar(title: Text(AppStrings.adminNavPosts)),
      body: posts.isEmpty
          ? Center(child: Text(AppStrings.adminPostsEmpty))
          : ListView.separated(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                AppSpacing.lg,
                AppSpacing.lg,
                88,
              ),
              itemCount: posts.length,
              separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.sm),
              itemBuilder: (context, index) {
                final post = posts[index];
                return SectionCard(
                  padding: EdgeInsets.zero,
                  child: ListTile(
                    title: Text(post.title, maxLines: 2, overflow: TextOverflow.ellipsis),
                    subtitle: Text(
                      '${post.badgeLabel} · ${post.authorName}',
                    ),
                    trailing: Switch(
                      value: post.isPublished,
                      onChanged: (_) => MockPostStore.instance.togglePublish(post.id),
                    ),
                    onTap: () => GatsMainNavigator.push(
                      context,
                      PostDetailScreen(postId: post.id),
                    ),
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _compose,
        icon: const Icon(Icons.add),
        label: Text(AppStrings.adminPostCompose),
      ),
    );
  }
}
