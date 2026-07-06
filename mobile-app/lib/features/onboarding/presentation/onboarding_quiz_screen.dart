import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gats_academy/core/l10n/l10n.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/brand_icon.dart';
import 'package:gats_academy/features/onboarding/models/onboarding_answers.dart';
import 'package:gats_academy/features/onboarding/presentation/widgets/onboarding_answer_ack_sheet.dart';
import 'package:gats_academy/features/onboarding/presentation/widgets/onboarding_option_card.dart';
import 'package:gats_academy/features/onboarding/presentation/widgets/onboarding_pill_grid.dart';
import 'package:gats_academy/features/onboarding/presentation/widgets/onboarding_reminder_step.dart';
import 'package:gats_academy/features/onboarding/presentation/widgets/onboarding_shell.dart';

class OnboardingQuizScreen extends StatefulWidget {
  const OnboardingQuizScreen({
    super.key,
    required this.answers,
    required this.onAnswersChanged,
    required this.onComplete,
    required this.onBack,
  });

  final OnboardingAnswers answers;
  final ValueChanged<OnboardingAnswers> onAnswersChanged;
  final VoidCallback onComplete;
  final VoidCallback onBack;

  @override
  State<OnboardingQuizScreen> createState() => _OnboardingQuizScreenState();
}

class _OnboardingQuizScreenState extends State<OnboardingQuizScreen> {
  final _pageController = PageController();
  final _reminderStepKey = GlobalKey<OnboardingReminderStepState>();
  int _step = 0;
  bool _isTransitioning = false;

  static const _steps = [
    QuizStepId.referral,
    QuizStepId.level,
    QuizStepId.profile,
    QuizStepId.motivation,
    QuizStepId.interests,
    QuizStepId.age,
    QuizStepId.dailyGoal,
    QuizStepId.purpose,
    QuizStepId.reminder,
  ];
  static int get _totalSteps => _steps.length;

  QuizStepId get _currentStep => _steps[_step];

  bool get _canProceed {
    final a = widget.answers;
    return switch (_currentStep) {
      QuizStepId.language => a.language != null,
      QuizStepId.referral => a.referral != null,
      QuizStepId.level => a.level != null,
      QuizStepId.profile => a.profile != null,
      QuizStepId.motivation => a.motivation != null,
      QuizStepId.interests => a.interests.isNotEmpty,
      QuizStepId.age => a.ageRange != null,
      QuizStepId.dailyGoal => a.dailyGoal != null,
      QuizStepId.purpose => a.purpose != null,
      QuizStepId.reminder => true,
    };
  }

  Future<void> _next() async {
    if (!_canProceed || _isTransitioning) return;
    if (_currentStep == QuizStepId.reminder) return;

    _isTransitioning = true;

    final config = OnboardingAckConfig.forStep(_currentStep, widget.answers, context.l10n);
    await OnboardingAnswerAckSheet.show(context, config);
    if (!mounted) return;

    if (_step < _totalSteps - 1) {
      setState(() => _step++);
      await _pageController.nextPage(
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeOutCubic,
      );
    } else {
      widget.onComplete();
    }

    if (mounted) {
      setState(() => _isTransitioning = false);
    }
  }

  Future<void> _onReminderNoThanks() async {
    await _finishReminderStep(widget.answers.copyWith(dailyReminderEnabled: false));
  }

  Future<void> _onReminderContinue() async {
    final answers = _reminderStepKey.currentState?.commit(widget.answers) ?? widget.answers;
    await _finishReminderStep(answers);
  }

  Future<void> _finishReminderStep(OnboardingAnswers answers) async {
    if (_isTransitioning) return;
    _isTransitioning = true;

    widget.onAnswersChanged(answers);

    await applyOnboardingReminderSettings(answers);
    if (!mounted) return;

    final config = OnboardingAckConfig.forStep(QuizStepId.reminder, answers, context.l10n);
    await OnboardingAnswerAckSheet.show(context, config);
    if (!mounted) return;

    widget.onComplete();

    if (mounted) {
      setState(() => _isTransitioning = false);
    }
  }

  void _back() {
    if (_isTransitioning) return;
    if (_step == 0) {
      widget.onBack();
      return;
    }
    setState(() => _step--);
    _pageController.previousPage(
      duration: const Duration(milliseconds: 350),
      curve: Curves.easeOutCubic,
    );
  }

  void _update(OnboardingAnswers newAnswers) {
    widget.onAnswersChanged(newAnswers);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return OnboardingShell(
      currentStep: _step,
      totalSteps: _totalSteps,
      onBack: _back,
      bottom: _currentStep == QuizStepId.reminder
          ? OnboardingReminderBottomBar(
              isLoading: _isTransitioning,
              onNoThanks: _onReminderNoThanks,
              onContinue: _onReminderContinue,
            )
          : SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: _canProceed && !_isTransitioning ? _next : null,
                child: Text(l10n.onboardingNext),
              ),
            ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.sm, AppSpacing.lg, AppSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  l10n.titleForStep(_currentStep),
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w800,
                        height: 1.2,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  l10n.subtitleForStep(_currentStep),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.textSecondary,
                        height: 1.35,
                      ),
                ),
              ],
            ),
          ),
          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _ReferralStep(
                  selected: widget.answers.referral,
                  onSelect: (v) => _update(widget.answers.copyWith(referral: v)),
                ),
                _LevelStep(
                  selected: widget.answers.level,
                  onSelect: (v) => _update(widget.answers.copyWith(level: v)),
                ),
                _ProfileStep(
                  selected: widget.answers.profile,
                  onSelect: (v) => _update(widget.answers.copyWith(profile: v)),
                ),
                _MotivationStep(
                  selected: widget.answers.motivation,
                  onSelect: (v) => _update(widget.answers.copyWith(motivation: v)),
                ),
                _InterestsStep(
                  selected: widget.answers.interests,
                  onToggle: (v) => _update(widget.answers.toggleInterest(v)),
                ),
                _AgeStep(
                  selected: widget.answers.ageRange,
                  onSelect: (v) => _update(widget.answers.copyWith(ageRange: v)),
                ),
                _DailyGoalStep(
                  selected: widget.answers.dailyGoal,
                  onSelect: (v) => _update(widget.answers.copyWith(dailyGoal: v)),
                ),
                _PurposeStep(
                  selected: widget.answers.purpose,
                  onSelect: (v) => _update(widget.answers.copyWith(purpose: v)),
                ),
                OnboardingReminderStep(
                  key: _reminderStepKey,
                  initialAnswers: widget.answers,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ReferralStep extends StatelessWidget {
  const _ReferralStep({required this.selected, required this.onSelect});

  final ReferralSource? selected;
  final ValueChanged<ReferralSource> onSelect;

  static const _icons = {
    ReferralSource.friend: Icons.people_alt_outlined,
    ReferralSource.other: Icons.more_horiz_rounded,
  };

  static const _brandIcons = {
    ReferralSource.tiktok: BrandIcon(type: BrandIconType.tiktok, size: 24),
    ReferralSource.facebook: BrandIcon(type: BrandIconType.facebook, size: 24),
    ReferralSource.youtube: BrandIcon(type: BrandIconType.youtube, size: 24),
    ReferralSource.search: BrandIcon(type: BrandIconType.google, size: 24),
  };

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      children: [
        for (final source in ReferralSource.values) ...[
          OnboardingOptionCard(
            icon: _icons[source],
            leading: _brandIcons[source],
            leadingBackgroundColor: _brandIcons[source] != null ? Colors.white : null,
            title: l10n.referralLabel(source),
            isSelected: selected == source,
            onTap: () => onSelect(source),
          ),
          const SizedBox(height: AppSpacing.md),
        ],
      ],
    );
  }
}

class _LevelStep extends StatelessWidget {
  const _LevelStep({required this.selected, required this.onSelect});

  final SkillLevel? selected;
  final ValueChanged<SkillLevel> onSelect;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      children: [
        OnboardingOptionCard(
          icon: Icons.rocket_launch_rounded,
          title: l10n.skillLevelLabel(SkillLevel.beginner),
          subtitle: l10n.skillLevelSubtitle(SkillLevel.beginner),
          isSelected: selected == SkillLevel.beginner,
          onTap: () => onSelect(SkillLevel.beginner),
        ),
        const SizedBox(height: AppSpacing.md),
        OnboardingOptionCard(
          icon: Icons.trending_up_rounded,
          title: l10n.skillLevelLabel(SkillLevel.intermediate),
          subtitle: l10n.skillLevelSubtitle(SkillLevel.intermediate),
          isSelected: selected == SkillLevel.intermediate,
          onTap: () => onSelect(SkillLevel.intermediate),
        ),
        const SizedBox(height: AppSpacing.md),
        OnboardingOptionCard(
          icon: Icons.auto_awesome_rounded,
          title: l10n.skillLevelLabel(SkillLevel.advanced),
          subtitle: l10n.skillLevelSubtitle(SkillLevel.advanced),
          isSelected: selected == SkillLevel.advanced,
          onTap: () => onSelect(SkillLevel.advanced),
        ),
      ],
    );
  }
}

class _ProfileStep extends StatelessWidget {
  const _ProfileStep({required this.selected, required this.onSelect});

  final UserProfile? selected;
  final ValueChanged<UserProfile> onSelect;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      children: [
        OnboardingOptionCard(
          icon: Icons.school_outlined,
          title: l10n.userProfileLabel(UserProfile.student),
          subtitle: l10n.userProfileSubtitle(UserProfile.student),
          isSelected: selected == UserProfile.student,
          onTap: () => onSelect(UserProfile.student),
        ),
        const SizedBox(height: AppSpacing.md),
        OnboardingOptionCard(
          icon: Icons.work_outline_rounded,
          title: l10n.userProfileLabel(UserProfile.officeWorker),
          subtitle: l10n.userProfileSubtitle(UserProfile.officeWorker),
          isSelected: selected == UserProfile.officeWorker,
          onTap: () => onSelect(UserProfile.officeWorker),
        ),
        const SizedBox(height: AppSpacing.md),
        OnboardingOptionCard(
          icon: Icons.laptop_mac_rounded,
          title: l10n.userProfileLabel(UserProfile.freelancer),
          subtitle: l10n.userProfileSubtitle(UserProfile.freelancer),
          isSelected: selected == UserProfile.freelancer,
          onTap: () => onSelect(UserProfile.freelancer),
        ),
        const SizedBox(height: AppSpacing.md),
        OnboardingOptionCard(
          icon: Icons.more_horiz_rounded,
          title: l10n.userProfileLabel(UserProfile.other),
          subtitle: l10n.userProfileSubtitle(UserProfile.other),
          isSelected: selected == UserProfile.other,
          onTap: () => onSelect(UserProfile.other),
        ),
      ],
    );
  }
}

class _MotivationStep extends StatelessWidget {
  const _MotivationStep({required this.selected, required this.onSelect});

  final Motivation? selected;
  final ValueChanged<Motivation> onSelect;

  static const _icons = {
    Motivation.career: Icons.stairs_rounded,
    Motivation.income: Icons.payments_outlined,
    Motivation.keepUp: Icons.speed_rounded,
    Motivation.curiosity: Icons.lightbulb_outline_rounded,
  };

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      children: [
        for (final m in Motivation.values) ...[
          OnboardingOptionCard(
            icon: _icons[m]!,
            title: l10n.motivationLabel(m),
            subtitle: l10n.motivationSubtitle(m),
            isSelected: selected == m,
            onTap: () => onSelect(m),
          ),
          const SizedBox(height: AppSpacing.md),
        ],
      ],
    );
  }
}

class _InterestsStep extends StatelessWidget {
  const _InterestsStep({required this.selected, required this.onToggle});

  final Set<AiInterest> selected;
  final ValueChanged<AiInterest> onToggle;

  static const _icons = {
    AiInterest.chatbot: Icons.chat_bubble_outline_rounded,
    AiInterest.contentWriting: Icons.edit_note_rounded,
    AiInterest.dataAnalysis: Icons.insights_rounded,
    AiInterest.imageGen: Icons.image_outlined,
    AiInterest.automation: Icons.settings_suggest_outlined,
    AiInterest.coding: Icons.code_rounded,
  };

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      child: Wrap(
        spacing: AppSpacing.md,
        runSpacing: AppSpacing.md,
        children: [
          for (final interest in AiInterest.values)
            _InterestChip(
              icon: _icons[interest]!,
              label: l10n.interestLabel(interest),
              isSelected: selected.contains(interest),
              onTap: () => onToggle(interest),
            ),
        ],
      ),
    );
  }
}

class _InterestChip extends StatelessWidget {
  const _InterestChip({
    required this.icon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          HapticFeedback.lightImpact();
          onTap();
        },
        borderRadius: BorderRadius.circular(AppRadius.lg),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.md),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primary.withValues(alpha: 0.08) : AppColors.surface,
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(
              color: isSelected ? AppColors.primary : AppColors.divider,
              width: isSelected ? 2 : 1,
            ),
            boxShadow: isSelected ? AppShadows.card : null,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                isSelected ? Icons.check_circle_rounded : icon,
                size: 20,
                color: isSelected ? AppColors.primary : AppColors.textSecondary,
              ),
              const SizedBox(width: AppSpacing.sm),
              Text(
                label,
                style: Theme.of(context).textTheme.labelLarge?.copyWith(
                      color: isSelected ? AppColors.primary : AppColors.textPrimary,
                      fontWeight: FontWeight.w600,
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _AgeStep extends StatelessWidget {
  const _AgeStep({required this.selected, required this.onSelect});

  final AgeRange? selected;
  final ValueChanged<AgeRange> onSelect;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      children: [
        OnboardingPillGrid<AgeRange>(
          options: AgeRange.values,
          selected: selected,
          onSelect: onSelect,
          label: l10n.ageRangeLabel,
        ),
      ],
    );
  }
}

class _DailyGoalStep extends StatelessWidget {
  const _DailyGoalStep({required this.selected, required this.onSelect});

  final DailyGoal? selected;
  final ValueChanged<DailyGoal> onSelect;

  static const _icons = {
    DailyGoal.casual: Icons.self_improvement_rounded,
    DailyGoal.regular: Icons.local_cafe_outlined,
    DailyGoal.serious: Icons.bolt_rounded,
    DailyGoal.intense: Icons.whatshot_rounded,
  };

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      children: [
        for (final goal in DailyGoal.values) ...[
          OnboardingOptionCard(
            icon: _icons[goal]!,
            title: l10n.dailyGoalLabel(goal),
            subtitle: l10n.dailyGoalCaption(goal),
            isSelected: selected == goal,
            onTap: () => onSelect(goal),
          ),
          const SizedBox(height: AppSpacing.md),
        ],
      ],
    );
  }
}

class _PurposeStep extends StatelessWidget {
  const _PurposeStep({required this.selected, required this.onSelect});

  final LearningPurpose? selected;
  final ValueChanged<LearningPurpose> onSelect;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return GridView.count(
      crossAxisCount: 2,
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      mainAxisSpacing: AppSpacing.md,
      crossAxisSpacing: AppSpacing.md,
      childAspectRatio: 0.85,
      children: [
        _PurposeCard(
          icon: Icons.work_outline_rounded,
          label: l10n.purposeLabel(LearningPurpose.officeWork),
          isSelected: selected == LearningPurpose.officeWork,
          onTap: () => onSelect(LearningPurpose.officeWork),
        ),
        _PurposeCard(
          icon: Icons.school_outlined,
          label: l10n.purposeLabel(LearningPurpose.skillUpgrade),
          isSelected: selected == LearningPurpose.skillUpgrade,
          onTap: () => onSelect(LearningPurpose.skillUpgrade),
        ),
        _PurposeCard(
          icon: Icons.swap_horiz_rounded,
          label: l10n.purposeLabel(LearningPurpose.careerChange),
          isSelected: selected == LearningPurpose.careerChange,
          onTap: () => onSelect(LearningPurpose.careerChange),
        ),
        _PurposeCard(
          icon: Icons.favorite_border_rounded,
          label: l10n.purposeLabel(LearningPurpose.personalInterest),
          isSelected: selected == LearningPurpose.personalInterest,
          onTap: () => onSelect(LearningPurpose.personalInterest),
        ),
      ],
    );
  }
}

class _PurposeCard extends StatelessWidget {
  const _PurposeCard({
    required this.icon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primary.withValues(alpha: 0.08) : AppColors.surface,
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(
              color: isSelected ? AppColors.primary : AppColors.divider,
              width: isSelected ? 2 : 1,
            ),
            boxShadow: isSelected ? AppShadows.card : null,
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: isSelected ? AppColors.primary : AppColors.textSecondary, size: 32),
              const SizedBox(height: AppSpacing.sm),
              Text(
                label,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.labelMedium?.copyWith(fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
