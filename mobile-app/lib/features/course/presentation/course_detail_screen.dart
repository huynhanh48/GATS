import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/navigation/gats_main_navigator.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/starry_sky_background.dart';
import 'package:gats_academy/core/widgets/section_card.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';
import 'package:gats_academy/features/auth/models/auth_user.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/features/course/course_module.dart';
import 'package:gats_academy/features/course/data/lecture_progress_store.dart';
import 'package:gats_academy/features/course/domain/course_repository.dart';
import 'package:gats_academy/features/course/presentation/widgets/course_continue_bar.dart';
import 'package:gats_academy/features/course/presentation/widgets/course_learning_header.dart';
import 'package:gats_academy/features/course/presentation/widgets/course_lecture_card.dart';
import 'package:gats_academy/features/course/presentation/widgets/course_tab_shell.dart';
import 'package:gats_academy/features/course/presentation/widgets/group_chat_panel.dart';
import 'package:gats_academy/features/course/presentation/widgets/lecture_preview_sheet.dart';
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
    _repo.ensureDetailLoaded(widget.courseId);
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
      return GatsThemedScaffold(
        appBar: AppBar(title: Text(AppStrings.courseNotFound)),
        body: Center(child: Text(AppStrings.courseNotFound)),
      );
    }

    if (!_userLoaded) {
      return const GatsThemedScaffold(body: Center(child: CircularProgressIndicator()));
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
      GatsMainNavigator.pushReplacement<void, void>(
        context,
        CourseStoreDetailScreen(courseId: widget.courseId),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return const GatsThemedScaffold(body: Center(child: CircularProgressIndicator()));
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
  final _progress = LectureProgressStore.instance;
  bool _progressReady = false;

  @override
  void initState() {
    super.initState();
    _tabController.addListener(_onTabChanged);
    _progress.addListener(_onProgressChanged);
    _loadProgress();
  }

  @override
  void didUpdateWidget(covariant _CourseLearningView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.course.id != widget.course.id ||
        oldWidget.user?.id != widget.user?.id) {
      _progressReady = false;
      _loadProgress();
    }
  }

  Future<void> _loadProgress() async {
    final userId = widget.user?.id;
    if (userId == null) {
      setState(() => _progressReady = true);
      return;
    }
    await _progress.load(
      userId: userId,
      courseId: widget.course.id,
      lectures: widget.course.lectures,
      fallbackCourseProgress: widget.course.progressFor(userId),
    );
    if (!mounted) return;
    setState(() => _progressReady = true);
  }

  void _onProgressChanged() {
    if (mounted) setState(() {});
  }

  void _onTabChanged() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _tabController.removeListener(_onTabChanged);
    _progress.removeListener(_onProgressChanged);
    _tabController.dispose();
    super.dispose();
  }

  List<CourseLecture> get _published =>
      widget.course.lectures.where((l) => l.isPublished).toList();

  String _headerCaption() {
    final current = _progress.currentLecture;
    if (current != null) {
      return AppStrings.lectureLearningCaption(current.title);
    }
    if (_progress.totalCount > 0 && _progress.completedCount >= _progress.totalCount) {
      return AppStrings.lectureAllDoneCaption;
    }
    return AppStrings.lectureStartCaption;
  }

  Future<void> _openLecture(CourseLecture lecture) async {
    if (lecture.locked && !lecture.isPreview) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Bài học này đã bị khóa.')),
      );
      return;
    }
    final index = _progress.indexOf(lecture);
    if (index < 0) return;
    await LecturePreviewSheet.show(
      context,
      courseId: widget.course.id,
      lecture: lecture,
      index: index,
      total: _progress.totalCount,
      state: _progress.stateOf(lecture),
      onMarkComplete: () => _progress.markComplete(lecture.id),
    );
  }

  Future<void> _continueLearning() async {
    final current = _progress.currentLecture ??
        (_published.isNotEmpty ? _published.last : null);
    if (current == null) return;
    await _openLecture(current);
  }

  @override
  Widget build(BuildContext context) {
    final course = widget.course;
    final showContinueBar = _tabController.index == 0 && _progressReady;

    final progress = _progressReady ? _progress.progress : course.progressFor(widget.user?.id);
    final current = _progress.currentLecture;
    final allDone = _progressReady &&
        _progress.totalCount > 0 &&
        _progress.completedCount >= _progress.totalCount;

    return CourseTabShell(
      tabController: _tabController,
      tabLabels: [
        AppStrings.courseTabLectures,
        AppStrings.courseTabQuiz,
        AppStrings.courseTabGroup,
      ],
      hero: CourseLearningHeader(
        course: course,
        progress: progress,
        caption: _progressReady ? _headerCaption() : null,
        onBack: () => Navigator.pop(context),
      ),
      bottomBar: showContinueBar
          ? CourseContinueBar(
              progressLabel: AppStrings.lectureProgressCount(
                _progress.completedCount,
                _progress.totalCount,
              ),
              subtitle: allDone
                  ? AppStrings.lectureAllDoneCaption
                  : (current?.title ?? AppStrings.lectureStartCaption),
              buttonLabel: _progress.completedCount == 0
                  ? AppStrings.lectureStartNext
                  : allDone
                      ? AppStrings.lectureContinue
                      : AppStrings.lectureContinue,
              enabled: _published.isNotEmpty,
              onPressed: _published.isEmpty ? null : _continueLearning,
            )
          : null,
      tabBodies: [
        _LecturesTab(
          lectures: _published,
          progressReady: _progressReady,
          bottomInset: showContinueBar ? 96 : 0,
          onOpen: _openLecture,
        ),
        _QuizTab(
          course: course,
          isMentor: widget.isMentor,
          bottomInset: 0,
        ),
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
  const _LecturesTab({
    required this.lectures,
    required this.progressReady,
    required this.onOpen,
    this.bottomInset = 0,
  });

  final List<CourseLecture> lectures;
  final bool progressReady;
  final ValueChanged<CourseLecture> onOpen;
  final double bottomInset;

  @override
  Widget build(BuildContext context) {
    if (lectures.isEmpty) {
      return EmptyState(
        icon: Icons.play_lesson_outlined,
        title: AppStrings.lecturesEmptyTitle,
        description: AppStrings.lecturesEmptyDesc,
      );
    }

    final store = LectureProgressStore.instance;

    return ListView.separated(
      padding: EdgeInsets.fromLTRB(
        AppSpacing.lg,
        AppSpacing.lg,
        AppSpacing.lg,
        AppSpacing.lg + bottomInset,
      ),
      itemCount: lectures.length,
      separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.md),
      itemBuilder: (context, index) {
        final lecture = lectures[index];
        final state = progressReady
            ? store.stateOf(lecture)
            : LectureLearnState.upcoming;
        return CourseLectureCard(
          lecture: lecture,
          index: index,
          state: state,
          onTap: () => onOpen(lecture),
        );
      },
    );
  }
}

class _QuizTab extends StatelessWidget {
  const _QuizTab({
    required this.course,
    required this.isMentor,
    this.bottomInset = 0,
  });

  final AppCourse course;
  final bool isMentor;
  final double bottomInset;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final quizzes = course.quizzes
        .where((q) => q.isPublished || isMentor)
        .toList();

    if (quizzes.isEmpty) {
      return EmptyState(
        icon: Icons.quiz_outlined,
        title: AppStrings.quizEmptyTitle,
        description: AppStrings.quizEmptyDesc,
      );
    }

    return ListView.separated(
      padding: EdgeInsets.fromLTRB(
        AppSpacing.lg,
        AppSpacing.lg,
        AppSpacing.lg,
        AppSpacing.lg + bottomInset,
      ),
      itemCount: quizzes.length,
      separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.md),
      itemBuilder: (context, index) {
        final quiz = quizzes[index];
        return SectionCard(
          padding: EdgeInsets.zero,
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              borderRadius: BorderRadius.circular(AppRadius.md),
              onTap: quiz.isPublished && !isMentor
                  ? () => ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(AppStrings.comingSoon)),
                      )
                  : null,
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: gats.lavenderAccent.withValues(alpha: 0.12),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        quiz.isPublished
                            ? Icons.quiz_outlined
                            : Icons.edit_note_outlined,
                        color: gats.lavenderAccent,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            quiz.title,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 15,
                              color: gats.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${quiz.questionCount} câu · ${quiz.isPublished ? 'Đã giao' : 'Nháp'}',
                            style: TextStyle(
                              fontSize: 12,
                              color: gats.textSecondary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (isMentor && !quiz.isPublished)
                      TextButton(
                        onPressed: () {
                          CourseModule.repository.publishQuiz(course.id, quiz.id);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text(AppStrings.courseQuizPublished)),
                          );
                        },
                        child: const Text('Giao bài'),
                      )
                    else if (quiz.isPublished)
                      Icon(Icons.chevron_right, color: gats.textSecondary),
                  ],
                ),
              ),
            ),
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
