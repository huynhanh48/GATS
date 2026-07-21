import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/navigation/gats_main_navigator.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/theme/gats_surface.dart';
import 'package:gats_academy/core/widgets/starry_sky_background.dart';
import 'package:gats_academy/core/widgets/ted/ted.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';
import 'package:gats_academy/features/auth/models/auth_user.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/features/course/course_module.dart';
import 'package:gats_academy/features/course/navigation/course_navigator.dart';

/// Tìm kiếm + lọc khóa học (mở từ nút sấm sét giữa).
class CourseSearchScreen extends StatefulWidget {
  const CourseSearchScreen({super.key});

  @override
  State<CourseSearchScreen> createState() => _CourseSearchScreenState();
}

class _CourseSearchScreenState extends State<CourseSearchScreen> {
  final _queryController = TextEditingController();
  String _query = '';
  int _categoryIndex = 0;
  int _chipIndex = 0;
  AuthUser? _user;
  List<CourseItem> _courses = const [];

  static const _tags = [
    'Tất cả',
    'AI cho công sở',
    'Lập trình',
    'Marketing',
    'Ngoại ngữ',
    'Kỹ năng mềm',
    'Automation',
  ];

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
    _courses = CourseModule.repository.listPublished(
      userId: _user?.id,
      role: role,
    );
  }

  List<CourseItem> get _filteredCourses {
    var list = _courses;

    if (_query.isNotEmpty) {
      final q = _query.toLowerCase();
      list = list
          .where(
            (c) =>
                c.title.toLowerCase().contains(q) ||
                c.tag.toLowerCase().contains(q),
          )
          .toList();
    }

    if (_categoryIndex > 0 && _categoryIndex < _tags.length) {
      final tag = _tags[_categoryIndex];
      list = list.where((c) => c.tag == tag).toList();
    }

    return switch (_chipIndex) {
      1 => list.where((c) => c.isEnrolled && c.progress > 0 && c.progress < 1).toList(),
      2 => list.where((c) => !c.isEnrolled).toList(),
      3 => list.where((c) => c.isFree).toList(),
      _ => list,
    };
  }

  void _openCourse(CourseItem course) {
    CourseNavigator.open(context, courseId: course.id);
  }

  @override
  void dispose() {
    _queryController.dispose();
    CourseModule.repository.removeListener(_onStoreChanged);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final results = _filteredCourses;

    final categories = [
      AppStrings.filterAll,
      AppStrings.filterOfficeAi,
      AppStrings.filterProgramming,
      AppStrings.filterMarketing,
      AppStrings.filterLanguages,
      AppStrings.filterSoftSkills,
      AppStrings.filterAutomation,
    ];

    final chips = [
      AppStrings.chipAll,
      AppStrings.chipLearning,
      AppStrings.chipNew,
      AppStrings.chipFree,
    ];

    return GatsThemedScaffold(
      appBar: AppBar(
        title: Text(AppStrings.courseSearchTitle),
        backgroundColor: gats.isStarry ? Colors.transparent : gats.background,
        surfaceTintColor: Colors.transparent,
        foregroundColor: gats.textPrimary,
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(AppSpacing.lg, 0, AppSpacing.lg, AppSpacing.xl),
        children: [
          TextField(
            controller: _queryController,
            autofocus: true,
            onChanged: (v) => setState(() => _query = v.trim()),
            decoration: InputDecoration(
              hintText: AppStrings.courseSearchHint,
              prefixIcon: const Icon(Icons.search),
              suffixIcon: _query.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () {
                        _queryController.clear();
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
          const SizedBox(height: AppSpacing.xl),
          Text(AppStrings.homeCategories, style: Theme.of(context).textTheme.titleSmall),
          const SizedBox(height: AppSpacing.md),
          TedCategoryRow(
            categories: categories,
            selectedIndex: _categoryIndex,
            onSelected: (i) => setState(() => _categoryIndex = i),
          ),
          const SizedBox(height: AppSpacing.xl),
          Text(AppStrings.homePopularCourses, style: Theme.of(context).textTheme.titleSmall),
          const SizedBox(height: AppSpacing.md),
          TedFilterChips(
            labels: chips,
            selectedIndex: _chipIndex,
            onSelected: (i) => setState(() => _chipIndex = i),
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(
            AppStrings.courseSearchResultCount.replaceFirst('%d', '${results.length}'),
            style: Theme.of(context).textTheme.bodySmall?.copyWith(color: gats.textSecondary),
          ),
          const SizedBox(height: AppSpacing.md),
          if (results.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: AppSpacing.xxl),
              child: Center(
                child: Text(
                  AppStrings.courseSearchEmpty,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: gats.textSecondary),
                  textAlign: TextAlign.center,
                ),
              ),
            )
          else
            ...results.map(
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
      ),
    );
  }
}

/// Mở màn tìm kiếm khóa học từ MainShell hoặc Home.
void openCourseSearch(BuildContext context) {
  GatsMainNavigator.push(context, const CourseSearchScreen());
}
