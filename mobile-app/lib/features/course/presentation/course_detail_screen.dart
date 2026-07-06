import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/section_card.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';
import 'package:gats_academy/features/auth/models/auth_user.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/features/course/course_module.dart';
import 'package:gats_academy/features/course/domain/course_repository.dart';
import 'package:gats_academy/features/course/presentation/widgets/course_learning_header.dart';
import 'package:gats_academy/features/course/presentation/widgets/course_tab_shell.dart';
import 'package:gats_academy/features/course/presentation/widgets/group_chat_panel.dart';
import 'package:gats_academy/features/store/presentation/course_store_detail_screen.dart';

/// Màn học đầy đủ — chỉ dành cho khóa đã mua / đăng ký (hoặc mentor/admin).
class CourseDetailScreen extends StatefulWidget {
  const CourseDetailScreen({super.key, required this.courseId});

  final String courseId;

  @override
  State<CourseDetailScreen> createState() => _CourseDetailScreenState();
}

class _CourseDetailScreenState extends State<CourseDetailScreen> {
  AuthUser? _user;
  bool _userLoaded = false;

  CourseRepository get _repo => CourseModule.repository;

  @override
  void initState() {
    super.initState();
    _loadUser();
    _repo.addListener(_onStoreChanged);
  }

  Future<void> _loadUser() async {
    final user = await AuthPrefs.currentUser();
    if (!mounted) return;
    setState(() {
      _user = user;
      _userLoaded = true;
    });
  }

  void _onStoreChanged() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _repo.removeListener(_onStoreChanged);
    super.dispose();
  }

  bool _hasFullAccess(AppCourse course) {
    final user = _user;
    if (user == null) return false;
    final role = user.role;
    if (role == UserRole.admin) return true;
    if (role == UserRole.mentor && course.isManagedBy(user.id)) return true;
    return _repo.isOwned(course.id, user.id, role: role);
  }

  @override
  Widget build(BuildContext context) {
    final course = _repo.getCourse(widget.courseId);
    if (course == null) {
      return Scaffold(
        appBar: AppBar(title: Text(AppStrings.courseNotFound)),
        body: Center(child: Text(AppStrings.courseNotFound)),
      );
    }

    if (!_userLoaded) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (!_hasFullAccess(course)) {
      return _RedirectToStorePreview(courseId: widget.courseId);
    }

    final role = _user!.role;
    final userId = _user!.id;
    final isMentor = role == UserRole.mentor && course.isManagedBy(userId);
    final canAccessChat = _repo.canAccessGroupChat(
      course: course,
      userId: userId,
      role: role,
    );

    return _CourseLearningView(
      course: course,
      user: _user,
      isMentor: isMentor,
      canAccessChat: canAccessChat,
    );
  }
}

class _RedirectToStorePreview extends StatefulWidget {
  const _RedirectToStorePreview({required this.courseId});

  final String courseId;

  @override
  State<_RedirectToStorePreview> createState() => _RedirectToStorePreviewState();
}

class _RedirectToStorePreviewState extends State<_RedirectToStorePreview> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute<void>(
          builder: (_) => CourseStoreDetailScreen(courseId: widget.courseId),
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: Center(child: CircularProgressIndicator()));
  }
}

class _CourseLearningView extends StatefulWidget {
  const _CourseLearningView({
    required this.course,
    required this.user,
    required this.isMentor,
    required this.canAccessChat,
  });

  final AppCourse course;
  final AuthUser? user;
  final bool isMentor;
  final bool canAccessChat;

  @override
  State<_CourseLearningView> createState() => _CourseLearningViewState();
}

class _CourseLearningViewState extends State<_CourseLearningView>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController = TabController(length: 3, vsync: this);

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final course = widget.course;
    final userId = widget.user?.id;

    return CourseTabShell(
      tabController: _tabController,
      tabLabels: [
        AppStrings.courseTabLectures,
        AppStrings.courseTabQuiz,
        AppStrings.courseTabGroup,
      ],
      hero: CourseLearningHeader(
        course: course,
        progress: course.progressFor(userId),
        onBack: () => Navigator.pop(context),
      ),
      tabBodies: [
        _LecturesTab(course: course),
        _QuizTab(course: course, isMentor: widget.isMentor),
        widget.canAccessChat
            ? GroupChatPanel(
                groupChatId: course.groupChatId,
                currentUser: widget.user,
                canPin: widget.isMentor,
              )
            : const _LockedChatTab(),
      ],
    );
  }
}

class _LecturesTab extends StatelessWidget {
  const _LecturesTab({required this.course});

  final AppCourse course;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;

    return ListView.separated(
      padding: const EdgeInsets.all(AppSpacing.lg),
      itemCount: course.lectures.length,
      separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.sm),
      itemBuilder: (context, index) {
        final lecture = course.lectures[index];
        return SectionCard(
          padding: EdgeInsets.zero,
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: gats.lavenderAccent.withValues(alpha: 0.1),
              child: Text('${index + 1}'),
            ),
            title: Text(lecture.title),
            subtitle: Text('${lecture.durationMinutes} phút'),
            trailing: Icon(Icons.play_circle_outline, color: gats.lavenderAccent),
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
    required this.isMentor,
  });

  final AppCourse course;
  final bool isMentor;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;

    if (course.quizzes.isEmpty) {
      return Center(child: Text(AppStrings.quizEmptyDesc));
    }

    return ListView.separated(
      padding: const EdgeInsets.all(AppSpacing.lg),
      itemCount: course.quizzes.length,
      separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.sm),
      itemBuilder: (context, index) {
        final quiz = course.quizzes[index];
        final visible = quiz.isPublished || isMentor;
        if (!visible) return const SizedBox.shrink();

        return SectionCard(
          padding: EdgeInsets.zero,
          child: ListTile(
            leading: Icon(
              quiz.isPublished ? Icons.quiz_outlined : Icons.edit_note_outlined,
              color: gats.lavenderAccent,
            ),
            title: Text(quiz.title),
            subtitle: Text('${quiz.questionCount} câu · ${quiz.isPublished ? 'Đã giao' : 'Nháp'}'),
            trailing: isMentor && !quiz.isPublished
                ? TextButton(
                    onPressed: () {
                      CourseModule.repository.publishQuiz(course.id, quiz.id);
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
  const _LockedChatTab();

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.lock_outline, size: 48, color: gats.textSecondary),
            const SizedBox(height: AppSpacing.md),
            Text(AppStrings.courseChatLocked, textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}
