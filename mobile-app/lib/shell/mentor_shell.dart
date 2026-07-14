import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/navigation/gats_main_navigator.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/starry_sky_background.dart';
import 'package:gats_academy/core/widgets/app_header.dart';
import 'package:gats_academy/core/widgets/ted/ted.dart';
import 'package:gats_academy/data/mock/mock_accounts.dart';
import 'package:gats_academy/data/mock/mock_course_store.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/features/course/presentation/course_detail_screen.dart';
import 'package:gats_academy/features/settings/presentation/settings_screen.dart';

class MentorShell extends StatefulWidget {
  const MentorShell({super.key});

  @override
  State<MentorShell> createState() => _MentorShellState();
}

class _MentorShellState extends State<MentorShell> {
  int _index = 0;
  String? _userId;

  @override
  void initState() {
    super.initState();
    _loadUser();
    MockCourseStore.instance.addListener(_onStoreChanged);
  }

  Future<void> _loadUser() async {
    final user = await AuthPrefs.currentUser();
    if (!mounted) return;
    setState(() => _userId = user?.id ?? MockAccounts.mentor.id);
  }

  void _onStoreChanged() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    MockCourseStore.instance.removeListener(_onStoreChanged);
    super.dispose();
  }

  void _openCourse(AppCourse course) {
    GatsMainNavigator.push(
      context,
      CourseDetailScreen(courseId: course.id),
    );
  }

  @override
  Widget build(BuildContext context) {
    final courses = MockCourseStore.instance.coursesForUser(
      _userId,
      role: UserRole.mentor,
    );

    return GatsThemedScaffold(
      extendBody: true,
      appBar: _index == 2
          ? null
          : AppHeader(
              title: _index == 0 ? AppStrings.mentorNavCourses : AppStrings.mentorNavChats,
              subtitle: AppStrings.mentorShellSubtitle,
            ),
      body: IndexedStack(
        index: _index,
        children: [
          _MentorCoursesTab(courses: courses, onOpen: _openCourse),
          _MentorChatsTab(courses: courses, onOpen: _openCourse),
          const SettingsScreen(),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: [
          NavigationDestination(
            icon: Icon(Icons.school_outlined),
            selectedIcon: Icon(Icons.school, color: AppColors.primary),
            label: AppStrings.mentorNavCourses,
          ),
          NavigationDestination(
            icon: Icon(Icons.forum_outlined),
            selectedIcon: Icon(Icons.forum, color: AppColors.primary),
            label: AppStrings.mentorNavChats,
          ),
          NavigationDestination(
            icon: Icon(Icons.settings_outlined),
            selectedIcon: Icon(Icons.settings, color: AppColors.primary),
            label: AppStrings.settingsTitle,
          ),
        ],
      ),
    );
  }
}

class _MentorCoursesTab extends StatelessWidget {
  const _MentorCoursesTab({required this.courses, required this.onOpen});

  final List<AppCourse> courses;
  final void Function(AppCourse course) onOpen;

  @override
  Widget build(BuildContext context) {
    if (courses.isEmpty) {
      return Center(child: Text(AppStrings.mentorNoCourses));
    }
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        TedSearchBar(hint: AppStrings.mentorSearchHint),
        const SizedBox(height: AppSpacing.lg),
        ...courses.map(
          (course) => Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.md),
            child: TedCourseCard(
              course: course.toListItem(),
              showProgress: false,
              onTap: () => onOpen(course),
            ),
          ),
        ),
      ],
    );
  }
}

class _MentorChatsTab extends StatelessWidget {
  const _MentorChatsTab({required this.courses, required this.onOpen});

  final List<AppCourse> courses;
  final void Function(AppCourse course) onOpen;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return ListView.separated(
      padding: const EdgeInsets.all(AppSpacing.lg),
      itemCount: courses.length,
      separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.sm),
      itemBuilder: (context, index) {
        final course = courses[index];
        return Material(
          color: gats.surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.md),
            side: BorderSide(color: gats.divider),
          ),
          clipBehavior: Clip.antiAlias,
          child: ListTile(
            leading: const CircleAvatar(child: Icon(Icons.forum_outlined)),
            title: Text(course.title),
            subtitle: Text(AppStrings.groupChatOnePerCourse),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => onOpen(course),
          ),
        );
      },
    );
  }
}
