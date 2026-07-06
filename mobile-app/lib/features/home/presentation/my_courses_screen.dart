import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/section_card.dart';
import 'package:gats_academy/core/widgets/ted/ted.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';
import 'package:gats_academy/features/auth/models/auth_user.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/features/course/course_module.dart';
import 'package:gats_academy/features/course/navigation/course_navigator.dart';

class MyCoursesScreen extends StatefulWidget {
  const MyCoursesScreen({super.key});

  @override
  State<MyCoursesScreen> createState() => _MyCoursesScreenState();
}

class _MyCoursesScreenState extends State<MyCoursesScreen> {
  int _filterIndex = 0;
  String _searchQuery = '';
  AuthUser? _user;
  List<CourseItem> _courses = [];
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadSession();
    CourseModule.repository.addListener(_onStoreChanged);
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
    final role = _user?.role ?? UserRole.user;
    _courses = CourseModule.repository.listOwned(userId: _user?.id, role: role);
  }

  List<CourseItem> get _filtered {
    var list = switch (_filterIndex) {
      1 => _courses.where((c) => c.progress > 0 && c.progress < 1).toList(),
      2 => _courses.where((c) => c.progress >= 1).toList(),
      _ => _courses,
    };

    if (_searchQuery.isNotEmpty) {
      final query = _searchQuery.toLowerCase();
      list = list
          .where((c) =>
              c.title.toLowerCase().contains(query) ||
              c.description.toLowerCase().contains(query) ||
              c.tag.toLowerCase().contains(query))
          .toList();
    }

    return list;
  }

  @override
  void dispose() {
    CourseModule.repository.removeListener(_onStoreChanged);
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final filtered = _filtered;

    return Scaffold(
      appBar: AppBar(
        title: Text(AppStrings.homeYourCourses),
        backgroundColor: gats.background,
      ),
      body: _courses.isEmpty
          ? EmptyState(
              icon: Icons.school_outlined,
              title: AppStrings.libraryEmptyTitle,
              description: AppStrings.libraryEmptyDesc,
            )
          : ListView(
              padding: const EdgeInsets.all(AppSpacing.lg),
              children: [
                TextField(
                  controller: _searchController,
                  onChanged: (query) => setState(() => _searchQuery = query),
                  decoration: InputDecoration(
                    hintText: AppStrings.librarySearchHint,
                    prefixIcon: const Icon(Icons.search),
                    filled: true,
                    fillColor: gats.surface,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppRadius.pill),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
                const SizedBox(height: AppSpacing.lg),
                TedFilterChips(
                  labels: [
                    AppStrings.libraryFilterAll,
                    AppStrings.libraryFilterOngoing,
                    AppStrings.libraryFilterDone,
                  ],
                  selectedIndex: _filterIndex,
                  onSelected: (index) => setState(() => _filterIndex = index),
                ),
                const SizedBox(height: AppSpacing.lg),
                if (filtered.isEmpty)
                  EmptyState(
                    icon: Icons.search_off,
                    title: AppStrings.libraryNoResults,
                    description: AppStrings.libraryNoResultsDesc,
                  )
                else
                  ...filtered.map(
                    (course) => Padding(
                      padding: const EdgeInsets.only(bottom: AppSpacing.md),
                      child: TedCourseCard(
                        course: course,
                        bookmarked: true,
                        onTap: () => CourseNavigator.open(
                          context,
                          courseId: course.id,
                          mode: CourseOpenMode.learn,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
    );
  }
}
