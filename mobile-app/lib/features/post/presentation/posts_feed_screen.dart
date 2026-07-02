import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/data/mock/mock_course_store.dart';
import 'package:gats_academy/data/mock/mock_post_store.dart';
import 'package:gats_academy/features/auth/models/auth_user.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/features/post/presentation/post_detail_screen.dart';
import 'package:gats_academy/features/post/presentation/widgets/post_card.dart';

class PostsFeedScreen extends StatefulWidget {
  const PostsFeedScreen({super.key});

  @override
  State<PostsFeedScreen> createState() => _PostsFeedScreenState();
}

class _PostsFeedScreenState extends State<PostsFeedScreen> {
  AuthUser? _user;

  @override
  void initState() {
    super.initState();
    _loadUser();
    MockPostStore.instance.addListener(_onStoreChanged);
  }

  @override
  void dispose() {
    MockPostStore.instance.removeListener(_onStoreChanged);
    super.dispose();
  }

  Future<void> _loadUser() async {
    final user = await AuthPrefs.currentUser();
    if (!mounted) return;
    setState(() => _user = user);
  }

  void _onStoreChanged() {
    if (mounted) setState(() {});
  }

  void _enrollFromPost(String courseId) {
    final userId = _user?.id;
    if (userId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(AppStrings.courseLoginToEnroll)),
      );
      return;
    }
    MockCourseStore.instance.enrollUser(courseId, userId);
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final userId = _user?.id;
    final role = _user?.role ?? UserRole.guest;
    final posts = MockPostStore.instance.feedForUser(userId: userId, role: role);

    return Scaffold(
      backgroundColor: context.gatsColors.background,
      appBar: AppBar(
        title: Text(AppStrings.postHomeSectionTitle),
        backgroundColor: AppColors.surface,
      ),
      body: posts.isEmpty
          ? Center(
              child: Text(
                AppStrings.postFeedEmpty,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(AppSpacing.lg),
              itemCount: posts.length,
              separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.md),
              itemBuilder: (context, index) {
                final post = posts[index];
                final canReadFull = MockPostStore.instance.canReadFull(
                  post: post,
                  userId: userId,
                  role: role,
                );
                return PostCard(
                  post: post,
                  canReadFull: canReadFull,
                  courseTitle: MockPostStore.instance.courseTitleFor(post),
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute<void>(
                        builder: (_) => PostDetailScreen(
                          postId: post.id,
                          onEnroll: post.courseId != null
                              ? () => _enrollFromPost(post.courseId!)
                              : null,
                        ),
                      ),
                    );
                  },
                );
              },
            ),
    );
  }
}
