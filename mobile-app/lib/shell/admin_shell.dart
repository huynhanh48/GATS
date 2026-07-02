import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/app_header.dart';
import 'package:gats_academy/core/widgets/section_card.dart';
import 'package:gats_academy/data/mock/mock_accounts.dart';
import 'package:gats_academy/data/mock/mock_course_store.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/features/course/presentation/course_detail_screen.dart';
import 'package:gats_academy/features/admin/presentation/admin_posts_tab.dart';
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
    MockCourseStore.instance.addListener(_onStoreChanged);
  }

  void _onStoreChanged() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    MockCourseStore.instance.removeListener(_onStoreChanged);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final store = MockCourseStore.instance;

    return Scaffold(
      backgroundColor: AppColors.background,
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
          _AdminCoursesTab(courses: store.courses),
          _AdminUsersTab(users: store.users),
          _AdminMentorsTab(
            users: store.users.where((u) => u.role == UserRole.mentor).toList(),
            courses: store.courses,
          ),
          const AdminPostsTab(),
          const SettingsScreen(),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: [
          NavigationDestination(icon: Icon(Icons.library_books_outlined), label: AppStrings.adminNavCourses),
          NavigationDestination(icon: Icon(Icons.people_outline), label: AppStrings.adminNavUsers),
          NavigationDestination(icon: Icon(Icons.school_outlined), label: AppStrings.adminNavMentors),
          NavigationDestination(icon: Icon(Icons.article_outlined), label: AppStrings.adminNavPosts),
          NavigationDestination(icon: Icon(Icons.settings_outlined), label: AppStrings.settingsTitle),
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
              '${course.isPublished ? AppStrings.adminStatusPublished : AppStrings.adminStatusDraft} · 1 ${AppStrings.adminGroupChatLabel} · ${AppStrings.adminMentorLabel}: ${MockAccounts.mentor.displayName}',
            ),
            trailing: Switch(
              value: course.isPublished,
              onChanged: (_) => MockCourseStore.instance.togglePublish(course.id),
            ),
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute<void>(
                builder: (_) => CourseDetailScreen(courseId: course.id),
              ),
            ),
          ),
        );
      },
    );
  }
}

class _AdminUsersTab extends StatelessWidget {
  const _AdminUsersTab({required this.users});

  final List<MockUserRecord> users;

  @override
  Widget build(BuildContext context) {
    final learners = users.where((u) => u.role == UserRole.user).toList();
    return ListView.separated(
      padding: const EdgeInsets.all(AppSpacing.lg),
      itemCount: learners.length,
      separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.sm),
      itemBuilder: (context, index) {
        final user = learners[index];
        return SectionCard(
          padding: EdgeInsets.zero,
          child: ListTile(
            leading: CircleAvatar(child: Text(user.displayName.characters.first)),
            title: Text(user.displayName),
            subtitle: Text(user.email),
            trailing: Switch(
              value: user.isActive,
              onChanged: (_) => MockCourseStore.instance.toggleUserActive(user.id),
            ),
          ),
        );
      },
    );
  }
}

class _AdminMentorsTab extends StatelessWidget {
  const _AdminMentorsTab({required this.users, required this.courses});

  final List<MockUserRecord> users;
  final List<AppCourse> courses;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        ...users.map(
          (mentor) => SectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(mentor.displayName, style: const TextStyle(fontWeight: FontWeight.w700)),
                Text(mentor.email, style: const TextStyle(color: AppColors.textSecondary)),
                const SizedBox(height: AppSpacing.md),
                Text(
                  AppStrings.adminAssignedCourses.replaceFirst('%s', courses.where((c) => c.mentorId == mentor.id).map((c) => c.title).join(', ')),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        Text(AppStrings.adminAssignMentorHint, style: const TextStyle(color: AppColors.textSecondary)),
      ],
    );
  }
}
