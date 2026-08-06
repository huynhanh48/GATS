import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gats_academy/core/navigation/gats_main_navigator.dart';
import 'package:gats_academy/core/navigation/main_shell_tab_controller.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/xp_popup.dart';
import 'package:gats_academy/data/mock/mock_data.dart';
import 'package:gats_academy/core/services/review_prompt_helper.dart';
import 'package:gats_academy/features/course/course_module.dart';
import 'package:gats_academy/features/course/presentation/lesson_player_screen.dart';
import 'package:gats_academy/features/daily/data/daily_tasks_controller.dart';
import 'package:gats_academy/features/daily/presentation/widgets/streak_calendar.dart';
import 'package:gats_academy/features/flashcard/presentation/flashcard_deck_section.dart';
import 'package:gats_academy/features/flashcard/presentation/flashcard_study_screen.dart';
import 'package:gats_academy/features/home/data/streak_controller.dart';
import 'package:gats_academy/shell/main_shell.dart';
import 'package:gats_academy/features/routine/data/routine_workflow_store.dart';
import 'package:gats_academy/features/routine/models/routine_workflow.dart';
import 'package:gats_academy/features/routine/presentation/widgets/routine_workflow_section.dart';

class DailyScreen extends StatefulWidget {
  const DailyScreen({super.key});

  @override
  State<DailyScreen> createState() => _DailyScreenState();
}

class _DailyScreenState extends State<DailyScreen> {
  final _tasksController = DailyTasksController.instance;
  RoutineWorkflow? _workflow;
  int _xpToday = 0;
  bool _bonusTaskVisible = false;
  bool _bonusTaskDone = false;

  @override
  void initState() {
    super.initState();
    _tasksController.addListener(_onTasksChanged);
    _tasksController.ensureLoaded();
    _loadWorkflow();
    StreakController.instance.ensureLoaded();
  }

  void _onTasksChanged() {
    if (mounted) {
      setState(() {});
      _checkAllDone();
    }
  }

  @override
  void dispose() {
    _tasksController.removeListener(_onTasksChanged);
    super.dispose();
  }

  List<DailyTask> get _tasks => _tasksController.tasks;

  Future<void> _loadWorkflow() async {
    final workflow = await RoutineWorkflowStore.load();
    if (mounted) setState(() => _workflow = workflow);
  }

  int get _doneCount => _tasksController.completedCount;

  void _showXpPopup(int xp) {
    _xpToday += xp;
    XpPopup.show(context, xp: xp);
    HapticFeedback.mediumImpact();
  }

  Future<void> _onFlashcardGoalComplete({required int reviewed}) async {
    final wasDone =
        _tasksController.taskById(DailyTasksController.flashcardId)?.isDone ??
            false;
    await _tasksController.completeFlashcardSession(reviewedCount: reviewed);
    if (!wasDone &&
        (_tasksController.taskById(DailyTasksController.flashcardId)?.isDone ??
            false)) {
      _showXpPopup(10);
      if (!mounted) return;
      await handleCoreTaskCompleted(context);
    }
  }

  void _checkAllDone() {
    if (_doneCount >= _tasks.length &&
        _tasks.isNotEmpty &&
        !_bonusTaskVisible) {
      setState(() => _bonusTaskVisible = true);
    }
  }

  Future<void> _openFlashcardGoal() async {
    var cards = _tasksController.dueCards;
    if (cards.isEmpty) {
      // Fallback: mock decks if offline / no due.
      final mock = MockData.flashcardDecks;
      if (mock.isEmpty) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Không có thẻ để ôn lúc này.')),
        );
        return;
      }
      final completed = await GatsMainNavigator.push<bool>(
        context,
        FlashcardStudyScreen(deck: mock.first),
      );
      if (completed == true) {
        await _onFlashcardGoalComplete(reviewed: mock.first.cards.length);
      }
      return;
    }

    final task = _tasksController.taskById(DailyTasksController.flashcardId);
    final target = task?.targetCount ?? DailyTasksController.defaultFlashcardTarget;
    final sessionCards = cards.take(target).toList();
    final first = sessionCards.first;
    final deck = FlashcardDeck(
      id: first.deckId ?? 'due-today',
      title: first.deckTitle?.trim().isNotEmpty == true
          ? first.deckTitle!.trim()
          : 'Ôn hôm nay',
      moduleName: first.courseTitle?.trim().isNotEmpty == true
          ? first.courseTitle!.trim()
          : 'Flashcard',
      courseId: first.courseId,
      courseTitle: first.courseTitle,
      cards: sessionCards,
      dueToday: sessionCards.length,
    );

    final completed = await GatsMainNavigator.push<bool>(
      context,
      FlashcardStudyScreen(deck: deck, syncToServer: true),
    );
    if (completed == true) {
      await _onFlashcardGoalComplete(reviewed: sessionCards.length);
    }
    await _tasksController.refresh();
  }

  Future<void> _openReadGoal(DailyTask task) async {
    final courseId = task.courseId;
    final lessonId = task.lessonId;
    if (courseId == null || lessonId == null) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            task.subtitle ?? 'Đăng ký khóa học để có bài tiếp theo.',
          ),
        ),
      );
      return;
    }

    await CourseModule.repository.ensureDetailLoaded(courseId);
    if (!mounted) return;
    final course = CourseModule.repository.getCourse(courseId);
    if (course == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Không tìm thấy khóa học.')),
      );
      return;
    }

    final lectures =
        course.lectures.where((l) => l.isPublished).toList(growable: false);
    if (lectures.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Khóa học chưa có bài giảng.')),
      );
      return;
    }

    await GatsMainNavigator.push(
      context,
      LessonPlayerScreen(
        courseId: courseId,
        lectures: lectures,
        initialLectureId: lessonId,
      ),
    );

    if (!mounted) return;
    await _tasksController.refresh();
    final updated = _tasksController.taskById(DailyTasksController.readId);
    if (updated?.isDone == true) {
      _showXpPopup(5);
    }
  }

  Future<void> _openCoachGoal() async {
    // AiCoachScreen needs shell Scaffold/Material — switch tab, don't push.
    MainShellTabController.instance.goTo(MainShellTabs.coach);
  }

  Future<void> _onGoalTap(DailyTask task) async {
    if (task.isDone) return;
    if (task.isFlashcard) {
      await _openFlashcardGoal();
    } else if (task.isRead) {
      await _openReadGoal(task);
    } else if (task.isCoach) {
      await _openCoachGoal();
    }
  }

  IconData _taskIcon(DailyTask task) {
    if (task.isFlashcard) return Icons.style_rounded;
    if (task.isRead) return Icons.menu_book_rounded;
    if (task.isCoach) return Icons.psychology_rounded;
    return Icons.check_circle_outline;
  }

  Color _taskColor(DailyTask task) {
    if (task.isFlashcard) return AppColors.primary;
    if (task.isRead) return AppColors.accent;
    if (task.isCoach) return const Color(0xFF7C3AED);
    return AppColors.textSecondary;
  }

  @override
  Widget build(BuildContext context) {
    final progress = _tasks.isEmpty ? 0.0 : _doneCount / _tasks.length;
    final streak = StreakController.instance;

    return RefreshIndicator(
      onRefresh: () async {
        await _tasksController.refresh();
        await _loadWorkflow();
        await StreakController.instance.refresh();
      },
      color: AppColors.primary,
      child: ListenableBuilder(
        listenable: streak,
        builder: (context, _) {
          return ListView(
            padding: const EdgeInsets.all(AppSpacing.lg),
            children: [
              StreakCalendar(
                streakDays: streak.streakDays,
                week: streak.week,
              ),
              const SizedBox(height: AppSpacing.xl),
              Container(
                padding: const EdgeInsets.all(AppSpacing.lg),
                decoration: BoxDecoration(
                  gradient: AppGradients.primary,
                  borderRadius: BorderRadius.circular(AppRadius.xl),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.3),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    SizedBox(
                      width: 64,
                      height: 64,
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          CircularProgressIndicator(
                            value: progress,
                            strokeWidth: 5,
                            backgroundColor: Colors.white24,
                            color: Colors.white,
                          ),
                          Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.local_fire_department_rounded,
                                color: Colors.white,
                                size: 18,
                              ),
                              Text(
                                '$_doneCount/${_tasks.length}',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w800,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: AppSpacing.lg),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            AppStrings.dailyTasksTitle,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _tasksController.pendingCount > 0
                                ? AppStrings.navDailyBadgeTooltip(
                                    _tasksController.pendingCount,
                                  )
                                : '${streak.streakDays} ngày streak · ${(progress * 100).round()}% hôm nay',
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.85),
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        '+$_xpToday XP',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.xl),
              Container(
                decoration: GatsSurfaceDecoration.card(
                  context,
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                ),
                child: Material(
                  color: Colors.transparent,
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  clipBehavior: Clip.antiAlias,
                  child: Column(
                    children: [
                      ...List.generate(_tasks.length, (index) {
                        final task = _tasks[index];
                        return _GoalTaskTile(
                          task: task,
                          icon: _taskIcon(task),
                          iconColor: _taskColor(task),
                          showDivider: index < _tasks.length - 1 ||
                              _bonusTaskVisible,
                          onTap: () => _onGoalTap(task),
                        );
                      }),
                      if (_bonusTaskVisible)
                        _GoalTaskTile(
                          task: DailyTask(
                            id: 'bonus',
                            title: AppStrings.streakBonusTask,
                            subtitle: '+15 XP bonus',
                            isDone: _bonusTaskDone,
                          ),
                          icon: Icons.star_rounded,
                          iconColor: AppColors.accent,
                          isBonus: true,
                          showDivider: false,
                          onTap: () {
                            if (_bonusTaskDone) return;
                            setState(() => _bonusTaskDone = true);
                            _showXpPopup(15);
                          },
                        ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.xl),
              FlashcardDeckSection(
                onSessionComplete: () => _onFlashcardGoalComplete(
                  reviewed: DailyTasksController.defaultFlashcardTarget,
                ),
              ),
              const SizedBox(height: AppSpacing.xl),
              if (_workflow != null)
                RoutineWorkflowSection(
                  workflow: _workflow!,
                  onWorkflowChanged: (w) => setState(() => _workflow = w),
                ),
              const SizedBox(height: AppSpacing.lg),
              Container(
                padding: const EdgeInsets.all(AppSpacing.lg),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.cloud_outlined, color: AppColors.primary),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Text(
                        AppStrings.vpsBanner,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppColors.primary,
                            ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _GoalTaskTile extends StatelessWidget {
  const _GoalTaskTile({
    required this.task,
    required this.icon,
    required this.iconColor,
    required this.onTap,
    this.isBonus = false,
    this.showDivider = true,
  });

  final DailyTask task;
  final IconData icon;
  final Color iconColor;
  final VoidCallback onTap;
  final bool isBonus;
  final bool showDivider;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final progressLabel = !task.isDone &&
            task.targetCount != null &&
            task.progressCount != null
        ? '${task.progressCount}/${task.targetCount}'
        : null;

    return Column(
      children: [
        InkWell(
          onTap: task.isDone && !isBonus ? null : onTap,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 250),
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg,
              vertical: AppSpacing.md,
            ),
            color: task.isDone
                ? gats.lavenderAccent.withValues(alpha: 0.05)
                : isBonus
                    ? AppColors.accent.withValues(alpha: 0.04)
                    : Colors.transparent,
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: (task.isDone ? AppColors.success : iconColor)
                        .withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(AppRadius.sm),
                  ),
                  child: Icon(
                    task.isDone ? Icons.check_rounded : icon,
                    color: task.isDone ? AppColors.success : iconColor,
                    size: 20,
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        task.title,
                        style: TextStyle(
                          decoration: task.isDone
                              ? TextDecoration.lineThrough
                              : null,
                          color: task.isDone
                              ? gats.textSecondary
                              : gats.textPrimary,
                          fontWeight:
                              isBonus ? FontWeight.w700 : FontWeight.w600,
                          fontSize: 14,
                          height: 1.25,
                        ),
                      ),
                      if (task.subtitle != null &&
                          task.subtitle!.trim().isNotEmpty) ...[
                        const SizedBox(height: 3),
                        Text(
                          task.subtitle!,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: isBonus && !task.isDone
                                ? AppColors.accent
                                : gats.textSecondary,
                            fontSize: 12,
                            fontWeight: isBonus
                                ? FontWeight.w600
                                : FontWeight.w400,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                if (task.isDone)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.success.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(AppRadius.pill),
                    ),
                    child: Text(
                      isBonus ? '+15 XP' : '+XP',
                      style: const TextStyle(
                        color: AppColors.success,
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  )
                else if (progressLabel != null)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: iconColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(AppRadius.pill),
                    ),
                    child: Text(
                      progressLabel,
                      style: TextStyle(
                        color: iconColor,
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  )
                else
                  Icon(
                    Icons.chevron_right_rounded,
                    color: gats.textSecondary.withValues(alpha: 0.7),
                  ),
              ],
            ),
          ),
        ),
        if (showDivider)
          Divider(height: 1, indent: 68, color: gats.divider),
      ],
    );
  }
}
