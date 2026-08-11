import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/navigation/gats_main_navigator.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/starry_sky_background.dart';
import 'package:gats_academy/core/widgets/ted/ted.dart';
import 'package:gats_academy/data/mock/models/post_models.dart';
import 'package:gats_academy/data/post_store.dart';
import 'package:gats_academy/features/auth/models/auth_user.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/features/course/course_module.dart';
import 'package:gats_academy/features/post/presentation/post_detail_screen.dart';
import 'package:gats_academy/features/post/presentation/widgets/post_card.dart';

class PostsFeedScreen extends StatefulWidget {
  const PostsFeedScreen({super.key, this.initialCategorySlug});

  /// Optional deep-link category slug (same as web `?category=`).
  final String? initialCategorySlug;

  @override
  State<PostsFeedScreen> createState() => _PostsFeedScreenState();
}

class _PostsFeedScreenState extends State<PostsFeedScreen> {
  final _searchController = TextEditingController();
  AuthUser? _user;

  /// null = Tất cả
  String? _selectedCategorySlug;
  String _query = '';
  int _sortIndex = 0; // 0 newest, 1 oldest, 2 title

  @override
  void initState() {
    super.initState();
    _selectedCategorySlug = widget.initialCategorySlug;
    _loadUser();
    PostStore.instance.addListener(_onStoreChanged);
    PostStore.instance.syncFromApi();
  }

  @override
  void dispose() {
    _searchController.dispose();
    PostStore.instance.removeListener(_onStoreChanged);
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

  Future<void> _selectCategory(int index) async {
    final cats = PostStore.instance.categories;
    final slug = index <= 0 ? null : cats[index - 1].slug;
    if (slug == _selectedCategorySlug) return;
    setState(() => _selectedCategorySlug = slug);
  }

  PostFeedSort get _selectedSort => switch (_sortIndex) {
        1 => PostFeedSort.oldest,
        2 => PostFeedSort.titleAsc,
        _ => PostFeedSort.newest,
      };

  bool get _hasActiveFilters =>
      _query.isNotEmpty ||
      _selectedCategorySlug != null ||
      _sortIndex != 0;

  void _clearFilters() {
    _searchController.clear();
    setState(() {
      _query = '';
      _selectedCategorySlug = null;
      _sortIndex = 0;
    });
  }

  Future<void> _enrollFromPost(String courseId) async {
    final userId = _user?.id;
    if (userId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(AppStrings.courseLoginToEnroll)),
      );
      return;
    }
    final ok = await CourseModule.repository.enrollFree(courseId, userId);
    if (!mounted) return;
    if (!ok) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đăng ký thất bại. Vui lòng thử lại.')),
      );
      return;
    }
    setState(() {});
  }

  void _openPost(String postId, {String? courseId}) {
    GatsMainNavigator.push(
      context,
      PostDetailScreen(
        postId: postId,
        onEnroll: courseId != null ? () => _enrollFromPost(courseId) : null,
      ),
    );
  }

  int get _selectedCategoryIndex {
    final slug = _selectedCategorySlug;
    if (slug == null || slug.isEmpty) return 0;
    final cats = PostStore.instance.categories;
    final i = cats.indexWhere((c) => c.slug == slug);
    return i < 0 ? 0 : i + 1;
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final userId = _user?.id;
    final role = _user?.role ?? UserRole.user;
    final categories = PostStore.instance.categories;
    final categoryLabels = [
      'Tất cả',
      ...categories.map((c) => c.name),
    ];
    final posts = PostStore.instance.feedForUser(
      userId: userId,
      role: role,
      limit: null,
      categorySlug: _selectedCategorySlug,
      searchQuery: _query,
      sort: _selectedSort,
    );
    final emptyMessage = _hasActiveFilters
        ? AppStrings.postSearchEmpty
        : AppStrings.postFeedEmpty;

    return GatsThemedScaffold(
      appBar: AppBar(
        title: Text(AppStrings.postHomeSectionTitle),
        backgroundColor: gats.isStarry ? Colors.transparent : gats.background,
        surfaceTintColor: Colors.transparent,
        foregroundColor: gats.textPrimary,
        actions: [
          if (_hasActiveFilters)
            TextButton(
              onPressed: _clearFilters,
              child: Text(AppStrings.postClearFilters),
            ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => PostStore.instance.syncFromApi(),
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg,
                  AppSpacing.md,
                  AppSpacing.lg,
                  AppSpacing.sm,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    TextField(
                      controller: _searchController,
                      onChanged: (v) => setState(() => _query = v.trim()),
                      textInputAction: TextInputAction.search,
                      decoration: InputDecoration(
                        hintText: AppStrings.postSearchHint,
                        prefixIcon: const Icon(Icons.search),
                        suffixIcon: _query.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.close),
                                onPressed: () {
                                  _searchController.clear();
                                  setState(() => _query = '');
                                },
                              )
                            : null,
                        filled: true,
                        fillColor: GatsSurfaceDecoration.surfaceColor(context),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(AppRadius.pill),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                    if (categoryLabels.length > 1) ...[
                      const SizedBox(height: AppSpacing.lg),
                      Text(
                        AppStrings.homeCategories,
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                      ),
                      const SizedBox(height: AppSpacing.md),
                      TedCategoryRow(
                        categories: categoryLabels,
                        selectedIndex: _selectedCategoryIndex,
                        onSelected: _selectCategory,
                      ),
                    ],
                    const SizedBox(height: AppSpacing.lg),
                    Text(
                      AppStrings.postFilterSort,
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    TedFilterChips(
                      labels: [
                        AppStrings.postSortNewest,
                        AppStrings.postSortOldest,
                        AppStrings.postSortTitle,
                      ],
                      selectedIndex: _sortIndex,
                      onSelected: (i) => setState(() => _sortIndex = i),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    Text(
                      AppStrings.postSearchResultCount(posts.length),
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: gats.textSecondary,
                          ),
                    ),
                  ],
                ),
              ),
            ),
            if (PostStore.instance.isSyncing && posts.isEmpty)
              const SliverFillRemaining(
                hasScrollBody: false,
                child: Center(child: CircularProgressIndicator()),
              )
            else if (posts.isEmpty)
              SliverFillRemaining(
                hasScrollBody: false,
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.all(AppSpacing.xl),
                    child: Text(
                      emptyMessage,
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: gats.textSecondary,
                          ),
                    ),
                  ),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.lg,
                  AppSpacing.sm,
                  AppSpacing.lg,
                  AppSpacing.xl,
                ),
                sliver: SliverList.separated(
                  itemCount: posts.length,
                  separatorBuilder: (_, _) =>
                      const SizedBox(height: AppSpacing.md),
                  itemBuilder: (context, index) {
                    final post = posts[index];
                    final canReadFull = PostStore.instance.canReadFull(
                      post: post,
                      userId: userId,
                      role: role,
                    );
                    return RepaintBoundary(
                      child: PostCard(
                        post: post,
                        canReadFull: canReadFull,
                        courseTitle: PostStore.instance.courseTitleFor(post),
                        onTap: () =>
                            _openPost(post.id, courseId: post.courseId),
                      ),
                    );
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }
}
