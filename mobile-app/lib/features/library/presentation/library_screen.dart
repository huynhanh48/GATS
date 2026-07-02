import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/theme/gats_surface.dart';
import 'package:gats_academy/core/widgets/section_card.dart';
import 'package:gats_academy/core/widgets/ted/ted.dart';
import 'package:gats_academy/data/mock/mock_course_store.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';
import 'package:gats_academy/features/auth/models/auth_user.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/features/course/presentation/course_detail_screen.dart';

class LibraryScreen extends StatefulWidget {
  const LibraryScreen({super.key});

  @override
  State<LibraryScreen> createState() => _LibraryScreenState();
}

class _LibraryScreenState extends State<LibraryScreen> {
  int _filterIndex = 0;
  bool _isGridView = false;
  String _searchQuery = '';
  AuthUser? _user;
  List<CourseItem> _courses = [];
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadSession();
    MockCourseStore.instance.addListener(_onStoreChanged);
  }

  Future<void> _loadSession() async {
    final user = await AuthPrefs.currentUser();
    if (!mounted) return;
    setState(() {
      _user = user;
      _refreshCourses();
    });
  }

  void _onStoreChanged() {
    if (!mounted) return;
    setState(_refreshCourses);
  }

  void _refreshCourses() {
    final role = _user?.role ?? UserRole.guest;
    _courses = MockCourseStore.instance.courseItemsFor(_user?.id, role: role);
  }

  List<CourseItem> get _filtered {
    var list = switch (_filterIndex) {
      1 => _courses.where((c) => c.isEnrolled && c.progress > 0 && c.progress < 1).toList(),
      2 => _courses.where((c) => c.isEnrolled && c.progress >= 1).toList(),
      _ => _courses,
    };

    // Apply search
    if (_searchQuery.isNotEmpty) {
      final query = _searchQuery.toLowerCase();
      list = list.where((c) =>
        c.title.toLowerCase().contains(query) ||
        c.description.toLowerCase().contains(query) ||
        c.tag.toLowerCase().contains(query)
      ).toList();
    }

    return list;
  }

  void _openCourse(CourseItem course) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => CourseDetailScreen(courseId: course.id)),
    );
  }

  @override
  void dispose() {
    MockCourseStore.instance.removeListener(_onStoreChanged);
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_courses.isEmpty) {
      return EmptyState(
        icon: Icons.library_books_outlined,
        title: AppStrings.libraryEmptyTitle,
        description: AppStrings.libraryEmptyDesc,
      );
    }

    final filteredList = _filtered;
    final featured = _courses.firstWhere(
      (c) => c.isEnrolled && c.progress > 0,
      orElse: () => _courses.first,
    );

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        // Search bar with real search
        _LibrarySearchBar(
          controller: _searchController,
          onChanged: (query) => setState(() => _searchQuery = query),
        ),
        const SizedBox(height: AppSpacing.lg),

        // Filter + View Toggle Row
        Row(
          children: [
            Expanded(
              child: TedFilterChips(
                labels: [
                  AppStrings.libraryFilterAll,
                  AppStrings.libraryFilterOngoing,
                  AppStrings.libraryFilterDone,
                ],
                selectedIndex: _filterIndex,
                onSelected: (i) => setState(() => _filterIndex = i),
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            // Grid/List toggle
            Container(
              decoration: BoxDecoration(
                color: AppColors.chipInactive,
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _ViewToggleButton(
                    icon: Icons.view_list_rounded,
                    isActive: !_isGridView,
                    onTap: () => setState(() => _isGridView = false),
                  ),
                  _ViewToggleButton(
                    icon: Icons.grid_view_rounded,
                    isActive: _isGridView,
                    onTap: () => setState(() => _isGridView = true),
                  ),
                ],
              ),
            ),
          ],
        ),

        const SizedBox(height: AppSpacing.xl),

        // Results
        if (filteredList.isEmpty) ...[
          const SizedBox(height: AppSpacing.xl),
          _EmptySearchState(
            onReset: () {
              setState(() {
                _searchQuery = '';
                _searchController.clear();
                _filterIndex = 0;
              });
            },
          ),
        ] else ...[
          // Featured (only in list view, no search)
          if (!_isGridView && _searchQuery.isEmpty) ...[
            TedSectionHeader(title: AppStrings.featuredCourse),
            const SizedBox(height: AppSpacing.md),
            TedCourseCard(
              course: featured,
              bookmarked: featured.isEnrolled,
              showProgress: featured.isEnrolled,
              onTap: () => _openCourse(featured),
            ),
            const SizedBox(height: AppSpacing.xl),
          ],

          TedSectionHeader(
            title: '${AppStrings.libraryAllCourses} (${filteredList.length})',
            actionLabel: AppStrings.seeAll,
          ),
          const SizedBox(height: AppSpacing.md),

          // Grid or List view
          if (_isGridView)
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.75,
              ),
              itemCount: filteredList.length,
              itemBuilder: (context, index) {
                final course = filteredList[index];
                return _GridCourseCard(
                  course: course,
                  onTap: () => _openCourse(course),
                );
              },
            )
          else
            ...filteredList.map(
              (course) => Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.md),
                child: TedCourseCard(
                  course: course,
                  bookmarked: course.isEnrolled,
                  showProgress: course.isEnrolled,
                  onTap: () => _openCourse(course),
                ),
              ),
            ),
        ],
      ],
    );
  }
}

class _LibrarySearchBar extends StatelessWidget {
  const _LibrarySearchBar({
    required this.controller,
    required this.onChanged,
  });

  final TextEditingController controller;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      decoration: GatsSurfaceDecoration.pill(context),
      child: Row(
        children: [
          Icon(Icons.search, color: gats.textSecondary, size: 22),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: TextField(
              controller: controller,
              onChanged: onChanged,
              decoration: InputDecoration(
                hintText: AppStrings.librarySearchHint,
                hintStyle: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: gats.textSecondary,
                    ),
                border: InputBorder.none,
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(vertical: 14),
              ),
            ),
          ),
          if (controller.text.isNotEmpty)
            IconButton(
              icon: Icon(Icons.close, size: 18, color: gats.textSecondary),
              onPressed: () {
                controller.clear();
                onChanged('');
              },
            ),
        ],
      ),
    );
  }
}

class _ViewToggleButton extends StatelessWidget {
  const _ViewToggleButton({
    required this.icon,
    required this.isActive,
    required this.onTap,
  });

  final IconData icon;
  final bool isActive;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: isActive ? gats.lavenderAccent : Colors.transparent,
          borderRadius: BorderRadius.circular(AppRadius.sm),
        ),
        child: Icon(
          icon,
          size: 18,
          color: isActive ? Colors.white : gats.textSecondary,
        ),
      ),
    );
  }
}

class _GridCourseCard extends StatelessWidget {
  const _GridCourseCard({
    required this.course,
    required this.onTap,
  });

  final CourseItem course;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        child: Container(
          decoration: GatsSurfaceDecoration.card(
            context,
            borderRadius: BorderRadius.circular(AppRadius.lg),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Cover
              Container(
                height: 80,
                width: double.infinity,
                decoration: BoxDecoration(
                  gradient: AppGradients.courseCover(course.id.hashCode),
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(AppRadius.lg),
                  ),
                ),
                child: const Center(
                  child: Icon(Icons.play_circle_outline, color: Colors.white, size: 28),
                ),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Tag + Free badge
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              course.tag,
                              style: const TextStyle(
                                color: AppColors.accent,
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          if (course.isFree)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: const Text(
                                'FREE',
                                style: TextStyle(
                                  color: AppColors.primary,
                                  fontSize: 9,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        course.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                            ),
                      ),
                      const Spacer(),
                      Row(
                        children: [
                          const Icon(Icons.star_rounded, color: AppColors.accent, size: 14),
                          const SizedBox(width: 2),
                          Text(
                            '4.${course.id.hashCode % 5 + 2}',
                            style: const TextStyle(fontSize: 11),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            '${course.lessonCount} bài',
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(fontSize: 11),
                          ),
                        ],
                      ),
                      if (course.isEnrolled && course.progress > 0) ...[
                        const SizedBox(height: 6),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(3),
                          child: LinearProgressIndicator(
                            value: course.progress,
                            minHeight: 4,
                            backgroundColor: gats.divider,
                            color: gats.lavenderAccent,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _EmptySearchState extends StatelessWidget {
  const _EmptySearchState({required this.onReset});

  final VoidCallback onReset;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return Center(
      child: Column(
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: gats.lavenderAccent.withValues(alpha: 0.08),
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.search_off_rounded,
              color: gats.textSecondary,
              size: 36,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(
            AppStrings.libraryNoResults,
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            AppStrings.libraryNoResultsDesc,
            style: Theme.of(context).textTheme.bodySmall,
          ),
          const SizedBox(height: AppSpacing.lg),
          TextButton.icon(
            onPressed: onReset,
            icon: const Icon(Icons.refresh_rounded),
            label: const Text('Xóa bộ lọc'),
          ),
        ],
      ),
    );
  }
}
