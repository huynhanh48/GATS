import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/theme/gats_surface.dart';
import 'package:gats_academy/core/widgets/xp_popup.dart';
import 'package:gats_academy/data/mock/mock_data.dart';
import 'package:gats_academy/core/services/review_prompt_helper.dart';
import 'package:gats_academy/features/daily/presentation/widgets/streak_calendar.dart';
import 'package:gats_academy/features/flashcard/presentation/flashcard_deck_section.dart';
import 'package:gats_academy/features/flashcard/presentation/flashcard_study_screen.dart';
import 'package:gats_academy/features/routine/data/routine_workflow_store.dart';
import 'package:gats_academy/features/routine/models/routine_workflow.dart';
import 'package:gats_academy/features/routine/presentation/widgets/routine_workflow_section.dart';

class DailyScreen extends StatefulWidget {
  const DailyScreen({super.key});

  @override
  State<DailyScreen> createState() => _DailyScreenState();
}

class _DailyScreenState extends State<DailyScreen> {
  late List<DailyTask> _tasks;
  RoutineWorkflow? _workflow;
  int _xpToday = 0;
  bool _bonusTaskVisible = false;
  bool _bonusTaskDone = false;

  @override
  void initState() {
    super.initState();
    _tasks = List.of(MockData.dailyTasks);
    _loadWorkflow();
  }

  Future<void> _loadWorkflow() async {
    final workflow = await RoutineWorkflowStore.load();
    if (mounted) setState(() => _workflow = workflow);
  }

  int get _doneCount => _tasks.where((t) => t.isDone).length;

  void _showXpPopup(int xp) {
    _xpToday += xp;
    XpPopup.show(context, xp: xp);
  }

  Future<void> _completeFlashcardTask() async {
    final index = _tasks.indexWhere((t) => t.id == 'flashcard');
    if (index >= 0 && !_tasks[index].isDone) {
      setState(() {
        _tasks[index] = DailyTask(
          id: _tasks[index].id,
          title: _tasks[index].title,
          isDone: true,
          deckId: _tasks[index].deckId,
        );
      });
      _showXpPopup(10);
      _checkAllDone();
      await handleCoreTaskCompleted(context);
    }
  }

  void _checkAllDone() {
    if (_doneCount >= _tasks.length && !_bonusTaskVisible) {
      setState(() => _bonusTaskVisible = true);
    }
  }

  IconData _taskIcon(String id) {
    return switch (id) {
      'flashcard' => Icons.style_rounded,
      'read' => Icons.menu_book_rounded,
      'coach' => Icons.psychology_rounded,
      _ => Icons.check_circle_outline,
    };
  }

  Color _taskColor(String id) {
    return switch (id) {
      'flashcard' => AppColors.primary,
      'read' => AppColors.accent,
      'coach' => const Color(0xFF7C3AED),
      _ => AppColors.textSecondary,
    };
  }

  @override
  Widget build(BuildContext context) {
    final progress = _tasks.isEmpty ? 0.0 : _doneCount / _tasks.length;

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        // Streak Calendar
        StreakCalendar(
          streakDays: MockData.streakDays,
          todayCompleted: _doneCount > 0,
        ),

        const SizedBox(height: AppSpacing.xl),

        // Daily Progress Header
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
              // Animated ring
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
                      '${MockData.streakDays} ngày streak · ${(progress * 100).round()}% hôm nay',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.85),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              // XP today
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
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

        // Tasks
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
                  return _EnhancedTaskTile(
                    task: task,
                    icon: _taskIcon(task.id),
                    iconColor: _taskColor(task.id),
                    onChanged: (value) {
                      setState(() {
                        _tasks[index] = DailyTask(
                          id: task.id,
                          title: task.title,
                          isDone: value ?? false,
                          deckId: task.deckId,
                        );
                      });
                      if (value == true) {
                        _showXpPopup(5);
                        _checkAllDone();
                      }
                    },
                    onFlashcardTap: task.deckId != null
                        ? () async {
                            final deck = MockData.deckById(task.deckId!);
                            if (deck == null) return;
                            final completed = await Navigator.of(context).push<bool>(
                              MaterialPageRoute<bool>(
                                builder: (_) => FlashcardStudyScreen(deck: deck),
                              ),
                            );
                            if (completed == true) await _completeFlashcardTask();
                          }
                        : null,
                  );
                }),
                // Bonus task
                if (_bonusTaskVisible)
                  _EnhancedTaskTile(
                    task: DailyTask(
                      id: 'bonus',
                      title: AppStrings.streakBonusTask,
                      isDone: _bonusTaskDone,
                    ),
                    icon: Icons.star_rounded,
                    iconColor: AppColors.accent,
                    isBonus: true,
                    onChanged: (value) {
                      setState(() => _bonusTaskDone = value ?? false);
                      if (value == true) _showXpPopup(15);
                    },
                  ),
              ],
            ),
          ),
        ),

        const SizedBox(height: AppSpacing.xl),

        // Flashcard section
        FlashcardDeckSection(onSessionComplete: () => _completeFlashcardTask()),

        const SizedBox(height: AppSpacing.xl),

        // Routine
        if (_workflow != null)
          RoutineWorkflowSection(
            workflow: _workflow!,
            onWorkflowChanged: (w) => setState(() => _workflow = w),
          ),

        const SizedBox(height: AppSpacing.lg),

        // VPS Banner
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
  }
}

class _EnhancedTaskTile extends StatelessWidget {
  const _EnhancedTaskTile({
    required this.task,
    required this.onChanged,
    required this.icon,
    required this.iconColor,
    this.isBonus = false,
    this.onFlashcardTap,
  });

  final DailyTask task;
  final ValueChanged<bool?> onChanged;
  final IconData icon;
  final Color iconColor;
  final bool isBonus;
  final VoidCallback? onFlashcardTap;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      color: task.isDone
          ? gats.lavenderAccent.withValues(alpha: 0.04)
          : isBonus
              ? AppColors.accent.withValues(alpha: 0.04)
              : Colors.transparent,
      child: ListTile(
        leading: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: (task.isDone ? gats.lavenderAccent : iconColor)
                    .withValues(alpha: 0.12),
                shape: BoxShape.circle,
              ),
              child: Icon(
                task.isDone ? Icons.check_circle : icon,
                color: task.isDone ? gats.lavenderAccent : iconColor,
                size: 16,
              ),
            ),
          ],
        ),
        title: AnimatedDefaultTextStyle(
          duration: const Duration(milliseconds: 200),
          style: TextStyle(
            decoration: task.isDone ? TextDecoration.lineThrough : null,
            color: task.isDone ? gats.textSecondary : gats.textPrimary,
            fontWeight: isBonus ? FontWeight.w600 : FontWeight.w500,
            fontSize: 14,
          ),
          child: Text(task.title),
        ),
        subtitle: isBonus && !task.isDone
            ? const Text(
                '+15 XP bonus',
                style: TextStyle(
                  color: AppColors.accent,
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                ),
              )
            : null,
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (task.isDone)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: gats.lavenderAccent.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '+5 XP',
                  style: TextStyle(
                    color: gats.lavenderAccent,
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            if (onFlashcardTap != null && !task.isDone)
              IconButton(
                icon: Icon(Icons.style_outlined, color: iconColor),
                onPressed: onFlashcardTap,
              ),
            Checkbox(
              value: task.isDone,
              onChanged: onChanged,
              activeColor: AppColors.primary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ],
        ),
        onTap: onFlashcardTap,
      ),
    );
  }
}
