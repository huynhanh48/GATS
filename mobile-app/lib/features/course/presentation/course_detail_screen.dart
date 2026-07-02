import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/section_card.dart';
import 'package:gats_academy/data/mock/mock_course_store.dart';
import 'package:gats_academy/data/mock/mock_post_store.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';
import 'package:gats_academy/features/auth/models/auth_user.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/features/course/presentation/widgets/course_posts_tab.dart';
import 'package:gats_academy/features/course/presentation/widgets/group_chat_panel.dart';

class CourseDetailScreen extends StatefulWidget {
  const CourseDetailScreen({super.key, required this.courseId});

  final String courseId;

  @override
  State<CourseDetailScreen> createState() => _CourseDetailScreenState();
}

class _CourseDetailScreenState extends State<CourseDetailScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  AuthUser? _user;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 5, vsync: this);
    _loadUser();
    MockCourseStore.instance.addListener(_onStoreChanged);
    MockPostStore.instance.addListener(_onStoreChanged);
  }

  Future<void> _loadUser() async {
    final user = await AuthPrefs.currentUser();
    if (!mounted) return;
    setState(() => _user = user);
  }

  void _onStoreChanged() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    MockCourseStore.instance.removeListener(_onStoreChanged);
    MockPostStore.instance.removeListener(_onStoreChanged);
    _tabController.dispose();
    super.dispose();
  }

  void _enroll(AppCourse course) {
    final userId = _user?.id;
    if (userId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(AppStrings.courseLoginToEnroll)),
      );
      return;
    }
    MockCourseStore.instance.enrollUser(course.id, userId);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(AppStrings.courseEnrolled.replaceFirst('%s', course.title))),
    );
  }

  @override
  Widget build(BuildContext context) {
    final course = MockCourseStore.instance.courseById(widget.courseId);
    if (course == null) {
      return Scaffold(
        appBar: AppBar(title: Text(AppStrings.courseNotFound)),
        body: Center(child: Text(AppStrings.courseNotFound)),
      );
    }

    final role = _user?.role ?? UserRole.guest;
    final userId = _user?.id;
    final canAccessChat = MockCourseStore.instance.canAccessGroupChat(
      course: course,
      userId: userId,
      role: role,
    );
    final isMentor = role == UserRole.mentor && course.isManagedBy(userId);
    final enrolled = course.isEnrolledBy(userId) || isMentor || role == UserRole.admin;

    return Scaffold(
      appBar: AppBar(
        title: Text(course.title, maxLines: 1, overflow: TextOverflow.ellipsis),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabs: [
            Tab(text: AppStrings.courseTabOverview),
            Tab(text: AppStrings.courseTabLectures),
            Tab(text: AppStrings.courseTabQuiz),
            Tab(text: AppStrings.courseTabPosts),
            Tab(text: AppStrings.courseTabChat),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _OverviewTab(
            course: course,
            enrolled: enrolled,
            isMentor: isMentor,
            onEnroll: () => _enroll(course),
          ),
          _LecturesTab(course: course, canView: enrolled),
          _QuizTab(course: course, canView: enrolled, isMentor: isMentor),
          CoursePostsTab(
            courseId: course.id,
            userId: userId,
            userName: _user?.displayName ?? 'Mentor',
            role: role,
            isMentor: isMentor,
            onEnroll: () => _enroll(course),
          ),
          canAccessChat
              ? GroupChatPanel(
                  groupChatId: course.groupChatId,
                  currentUser: _user,
                  canPin: isMentor,
                )
              : _LockedChatTab(onEnroll: course.isFree || !enrolled ? () => _enroll(course) : null),
        ],
      ),
    );
  }
}

class _OverviewTab extends StatelessWidget {
  const _OverviewTab({
    required this.course,
    required this.enrolled,
    required this.isMentor,
    required this.onEnroll,
  });

  final AppCourse course;
  final bool enrolled;
  final bool isMentor;
  final VoidCallback onEnroll;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        SectionCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(course.tag, style: const TextStyle(color: AppColors.accent, fontWeight: FontWeight.w600)),
              const SizedBox(height: AppSpacing.sm),
              Text(course.title, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
              const SizedBox(height: AppSpacing.md),
              Text(course.description),
              const SizedBox(height: AppSpacing.md),
              Row(
                children: [
                  const Icon(Icons.menu_book_outlined, size: 16, color: AppColors.textSecondary),
                  const SizedBox(width: 4),
                  Text('${course.lessonCount} bài · ${course.durationMinutes} phút'),
                ],
              ),
              if (course.isFree) ...[
                const SizedBox(height: AppSpacing.sm),
                const Chip(label: Text('Miễn phí'), backgroundColor: Color(0xFFE8F4FF)),
              ],
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        if (isMentor)
          SectionCard(
            child: Row(
              children: [
                const Icon(Icons.school_outlined, color: AppColors.primary),
                const SizedBox(width: AppSpacing.md),
                Expanded(child: Text(AppStrings.courseMentorBadge)),
              ],
            ),
          )
        else if (!enrolled)
          FilledButton(
            onPressed: onEnroll,
            child: Text(course.isFree ? AppStrings.courseEnrollFree : AppStrings.courseEnroll),
          )
        else
          SectionCard(
            child: Row(
              children: [
                const Icon(Icons.check_circle_outline, color: AppColors.primary),
                const SizedBox(width: AppSpacing.md),
                Expanded(child: Text(AppStrings.courseAlreadyEnrolled)),
              ],
            ),
          ),
      ],
    );
  }
}

class _LecturesTab extends StatelessWidget {
  const _LecturesTab({required this.course, required this.canView});

  final AppCourse course;
  final bool canView;

  @override
  Widget build(BuildContext context) {
    if (!canView) {
      return Center(child: Text(AppStrings.courseEnrollToView));
    }
    return ListView.separated(
      padding: const EdgeInsets.all(AppSpacing.lg),
      itemCount: course.lectures.length,
      separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.sm),
      itemBuilder: (context, index) {
        final lecture = course.lectures[index];
        return SectionCard(
          padding: EdgeInsets.zero,
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: AppColors.primary.withValues(alpha: 0.1),
              child: Text('${index + 1}'),
            ),
            title: Text(lecture.title),
            subtitle: Text('${lecture.durationMinutes} phút'),
            trailing: const Icon(Icons.play_circle_outline, color: AppColors.primary),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(AppStrings.comingSoon)),
              );
            },
          ),
        );
      },
    );
  }
}

class _QuizTab extends StatelessWidget {
  const _QuizTab({
    required this.course,
    required this.canView,
    required this.isMentor,
  });

  final AppCourse course;
  final bool canView;
  final bool isMentor;

  @override
  Widget build(BuildContext context) {
    if (!canView) {
      return Center(child: Text(AppStrings.courseEnrollToView));
    }
    if (course.quizzes.isEmpty) {
      return Center(child: Text(AppStrings.quizEmptyDesc));
    }

    return ListView.separated(
      padding: const EdgeInsets.all(AppSpacing.lg),
      itemCount: course.quizzes.length,
      separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.sm),
      itemBuilder: (context, index) {
        final quiz = course.quizzes[index];
        final visible = quiz.isPublished || isMentor;
        if (!visible) return const SizedBox.shrink();

        return SectionCard(
          padding: EdgeInsets.zero,
          child: ListTile(
            leading: Icon(
              quiz.isPublished ? Icons.quiz_outlined : Icons.edit_note_outlined,
              color: AppColors.primary,
            ),
            title: Text(quiz.title),
            subtitle: Text('${quiz.questionCount} câu · ${quiz.isPublished ? 'Đã giao' : 'Nháp'}'),
            trailing: isMentor && !quiz.isPublished
                ? TextButton(
                    onPressed: () {
                      MockCourseStore.instance.publishQuiz(course.id, quiz.id);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(AppStrings.courseQuizPublished)),
                      );
                    },
                    child: const Text('Giao bài'),
                  )
                : quiz.isPublished
                    ? const Icon(Icons.chevron_right)
                    : null,
            onTap: quiz.isPublished && !isMentor
                ? () => ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text(AppStrings.comingSoon)),
                    )
                : null,
          ),
        );
      },
    );
  }
}

class _LockedChatTab extends StatelessWidget {
  const _LockedChatTab({this.onEnroll});

  final VoidCallback? onEnroll;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.lock_outline, size: 48, color: AppColors.textSecondary),
            const SizedBox(height: AppSpacing.md),
            Text(AppStrings.courseChatLocked, textAlign: TextAlign.center),
            if (onEnroll != null) ...[
              const SizedBox(height: AppSpacing.lg),
              FilledButton(onPressed: onEnroll, child: Text(AppStrings.courseEnroll)),
            ],
          ],
        ),
      ),
    );
  }
}
