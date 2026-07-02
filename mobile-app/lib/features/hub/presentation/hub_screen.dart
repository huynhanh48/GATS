import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/theme/gats_surface.dart';
import 'package:gats_academy/core/widgets/section_card.dart';
import 'package:gats_academy/core/widgets/ui_components.dart';
import 'package:gats_academy/data/mock/mock_data.dart';
import 'package:gats_academy/features/hub/presentation/widgets/achievement_timeline.dart';
import 'package:gats_academy/features/hub/presentation/widgets/leaderboard_section.dart';

class HubScreen extends StatelessWidget {
  const HubScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final progress = MockData.hubProgress;
    final xpRemaining = progress.certXpRequired - progress.currentXp;
    final canTakeCert = xpRemaining <= 0;
    final rankTitle = MockData.rankTitle(progress.level);

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        // XP Level Card — Enhanced
        _XpLevelCard(progress: progress, rankTitle: rankTitle),

        const SizedBox(height: AppSpacing.xl),

        // Badges — Enhanced
        Text(AppStrings.hubBadgesTitle, style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: AppSpacing.md),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.3,
          ),
          itemCount: MockData.badges.length,
          itemBuilder: (context, index) {
            final badge = MockData.badges[index];
            return _BadgeCard(badge: badge);
          },
        ),

        const SizedBox(height: AppSpacing.xl),

        // Leaderboard
        Text(AppStrings.homeLeaderboard, style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: AppSpacing.md),
        const LeaderboardSection(),

        const SizedBox(height: AppSpacing.xl),

        // Achievements Timeline
        Text(AppStrings.hubAchievements, style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: AppSpacing.md),
        const AchievementTimeline(),

        const SizedBox(height: AppSpacing.xl),

        // Certificate Card — Enhanced
        _CertificateCard(
          progress: progress,
          canTakeCert: canTakeCert,
          xpRemaining: xpRemaining,
        ),
      ],
    );
  }
}

class _XpLevelCard extends StatefulWidget {
  const _XpLevelCard({
    required this.progress,
    required this.rankTitle,
  });

  final HubProgress progress;
  final String rankTitle;

  @override
  State<_XpLevelCard> createState() => _XpLevelCardState();
}

class _XpLevelCardState extends State<_XpLevelCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _progressAnim;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );
    _progressAnim = Tween<double>(
      begin: 0,
      end: widget.progress.currentXp / widget.progress.xpToNextLevel,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOutCubic,
    ));
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GradientCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                AppStrings.hubXpTitle,
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.85),
                  fontSize: 13,
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  widget.rankTitle,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 11,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  'Level ${widget.progress.level}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Text(
                '${widget.progress.currentXp} / ${widget.progress.xpToNextLevel} XP',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          AnimatedBuilder(
            animation: _progressAnim,
            builder: (context, child) {
              return ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: LinearProgressIndicator(
                  value: _progressAnim.value,
                  minHeight: 10,
                  backgroundColor: Colors.white24,
                  color: AppColors.accent,
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _BadgeCard extends StatelessWidget {
  const _BadgeCard({required this.badge});

  final BadgeItem badge;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        onTap: () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                badge.isUnlocked
                    ? '✅ "${badge.name}" — Đã mở khóa!'
                    : '🔒 "${badge.name}" — Hoàn thành thêm bài tập để mở khóa.',
              ),
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
            ),
          );
        },
        child: Container(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: GatsSurfaceDecoration.card(
            context,
            borderRadius: BorderRadius.circular(AppRadius.lg),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: badge.isUnlocked
                      ? AppColors.accent.withValues(alpha: 0.15)
                      : gats.divider.withValues(alpha: 0.5),
                  shape: BoxShape.circle,
                  border: badge.isUnlocked
                      ? Border.all(color: AppColors.accent, width: 2)
                      : null,
                  boxShadow: badge.isUnlocked
                      ? [
                          BoxShadow(
                            color: AppColors.accent.withValues(alpha: 0.25),
                            blurRadius: 10,
                            spreadRadius: 2,
                          ),
                        ]
                      : null,
                ),
                child: Icon(
                  badge.icon,
                  color: badge.isUnlocked
                      ? AppColors.accent
                      : gats.textSecondary,
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                badge.name,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      fontWeight: badge.isUnlocked
                          ? FontWeight.w600
                          : FontWeight.normal,
                    ),
                textAlign: TextAlign.center,
              ),
              if (!badge.isUnlocked)
                Icon(Icons.lock_outline, size: 14, color: gats.textSecondary),
            ],
          ),
        ),
      ),
    );
  }
}

class _CertificateCard extends StatelessWidget {
  const _CertificateCard({
    required this.progress,
    required this.canTakeCert,
    required this.xpRemaining,
  });

  final HubProgress progress;
  final bool canTakeCert;
  final int xpRemaining;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return SectionCard(
      child: Column(
        children: [
          Text(
            AppStrings.hubCertTitle,
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: AppSpacing.lg),
          // Certificate preview
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppSpacing.xl),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  AppColors.primary.withValues(alpha: 0.06),
                  AppColors.accent.withValues(alpha: 0.06),
                ],
              ),
              borderRadius: BorderRadius.circular(AppRadius.lg),
              border: Border.all(
                color: canTakeCert
                    ? gats.lavenderAccent.withValues(alpha: 0.3)
                    : gats.divider,
                width: 1.5,
              ),
            ),
            child: Column(
              children: [
                Icon(
                  Icons.workspace_premium,
                  size: 48,
                  color: canTakeCert ? gats.lavenderAccent : gats.textSecondary,
                ),
                const SizedBox(height: AppSpacing.md),
                Text(
                  'CHỨNG CHỈ',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 3,
                    color: canTakeCert ? gats.lavenderAccent : gats.textSecondary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'GATS Academy — AI cho Công sở',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: canTakeCert ? gats.textPrimary : gats.textSecondary,
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                ProgressRing(
                  progress: progress.currentXp / progress.certXpRequired,
                  size: 60,
                  strokeWidth: 5,
                  color: canTakeCert ? gats.lavenderAccent : gats.textSecondary,
                  child: Text(
                    '${(progress.currentXp / progress.certXpRequired * 100).round()}%',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: canTakeCert ? gats.lavenderAccent : gats.textSecondary,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            canTakeCert
                ? AppStrings.hubCertReady
                : AppStrings.hubCertLocked.replaceFirst('%d', '$xpRemaining'),
            style: Theme.of(context).textTheme.bodySmall,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.lg),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: canTakeCert ? () {} : null,
              child: Text(AppStrings.hubCertButton),
            ),
          ),
        ],
      ),
    );
  }
}
