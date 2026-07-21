import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/navigation/gats_main_navigator.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/starry_sky_background.dart';
import 'package:gats_academy/core/widgets/app_header.dart';
import 'package:gats_academy/core/widgets/section_card.dart';
import 'package:gats_academy/data/mock/mock_accounts.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';
import 'package:gats_academy/features/admin/presentation/admin_posts_tab.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/features/course/course_module.dart';
import 'package:gats_academy/features/course/presentation/course_detail_screen.dart';
import 'package:gats_academy/features/settings/presentation/settings_screen.dart';

class AdminShell extends StatefulWidget {
  const AdminShell({super.key});

  @override
  State<AdminShell> createState() => _AdminShellState();
}

class _AdminShellState extends State<AdminShell> {
  int _index = 0;

  @override
  void initState() {
    super.initState();
    CourseModule.repository.addListener(_onStoreChanged);
  }

  void _onStoreChanged() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    CourseModule.repository.removeListener(_onStoreChanged);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final courses = CourseModule.repository.listPublishedCourses();
    final users = MockAccounts.all;

    return GatsThemedScaffold(
      extendBody: true,
      appBar: _index >= 3
          ? null
          : AppHeader(
              title: switch (_index) {
                0 => AppStrings.adminNavCourses,
                1 => AppStrings.adminNavUsers,
                2 => AppStrings.adminNavMentors,
                _ => AppStrings.adminNavPosts,
              },
              subtitle: AppStrings.adminShellSubtitle,
            ),
      body: IndexedStack(
        index: _index,
        children: [
          _AdminCoursesTab(courses: courses),
          _AdminUsersTab(users: users),
          _AdminMentorsTab(
            users: users.where((u) => u.role == UserRole.mentor).toList(),
            courses: courses,
          ),
          const AdminPostsTab(),
          const SettingsScreen(),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: [
          NavigationDestination(
              icon: Icon(Icons.library_books_outlined),
              label: AppStrings.adminNavCourses),
          NavigationDestination(
              icon: Icon(Icons.people_outline),
              label: AppStrings.adminNavUsers),
          NavigationDestination(
              icon: Icon(Icons.school_outlined),
              label: AppStrings.adminNavMentors),
          NavigationDestination(
              icon: Icon(Icons.article_outlined),
              label: AppStrings.adminNavPosts),
          NavigationDestination(
              icon: Icon(Icons.settings_outlined),
              label: AppStrings.settingsTitle),
        ],
      ),
    );
  }
}

class _AdminCoursesTab extends StatelessWidget {
  const _AdminCoursesTab({required this.courses});

  final List<AppCourse> courses;

  @override
  Widget build(BuildContext context) {
    if (courses.isEmpty) {
      return Center(child: Text(AppStrings.storeCourseNotFound));
    }
    return ListView.separated(
      padding: const EdgeInsets.all(AppSpacing.lg),
      itemCount: courses.length,
      separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.sm),
      itemBuilder: (context, index) {
        final course = courses[index];
        return SectionCard(
          padding: EdgeInsets.zero,
          child: ListTile(
            title: Text(course.title),
            subtitle: Text(
              '${course.isPublished ? AppStrings.adminStatusPublished : AppStrings.adminStatusDraft}'
              ' · ${course.lessonCount} lessons',
            ),
            trailing: Icon(
              course.isPublished ? Icons.check_circle : Icons.drafts_outlined,
              color: course.isPublished
                  ? Colors.green
                  : Theme.of(context).disabledColor,
            ),
            onTap: () => GatsMainNavigator.push(
              context,
              CourseDetailScreen(courseId: course.id),
            ),
          ),
        );
      },
    );
  }
}

class _AdminUsersTab extends StatelessWidget {
  const _AdminUsersTab({required this.users});

  final List<MockAccount> users;

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.all(AppSpacing.lg),
      itemCount: users.length,
      separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.sm),
      itemBuilder: (context, index) {
        final user = users[index];
        return SectionCard(
          padding: EdgeInsets.zero,
          child: ListTile(
            title: Text(user.displayName),
            subtitle: Text('${user.email} · ${user.role.name}'),
          ),
        );
      },
    );
  }
}

class _AdminMentorsTab extends StatelessWidget {
  const _AdminMentorsTab({
    required this.users,
    required this.courses,
  });

  final List<MockAccount> users;
  final List<AppCourse> courses;

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.all(AppSpacing.lg),
      itemCount: users.length,
      separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.sm),
      itemBuilder: (context, index) {
        final user = users[index];
        final managed =
            courses.where((c) => c.mentorId == user.id).length;
        return SectionCard(
          padding: EdgeInsets.zero,
          child: ListTile(
            title: Text(user.displayName),
            subtitle: Text('$managed khóa · ${user.email}'),
          ),
        );
      },
    );
  }
}
