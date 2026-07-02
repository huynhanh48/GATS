import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/theme/gats_surface.dart';
import 'package:gats_academy/data/mock/mock_data.dart';
import 'package:shared_preferences/shared_preferences.dart';

class DailyRewardSheet extends StatefulWidget {
  const DailyRewardSheet({super.key});

  static Future<void> showIfNeeded(BuildContext context) async {
    final prefs = await SharedPreferences.getInstance();
    final today = DateTime.now().toIso8601String().substring(0, 10);
    final lastClaimed = prefs.getString('daily_reward_last_claimed');
    if (lastClaimed == today) return;
    if (!context.mounted) return;
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const DailyRewardSheet(),
    );
  }

  @override
  State<DailyRewardSheet> createState() => _DailyRewardSheetState();
}

class _DailyRewardSheetState extends State<DailyRewardSheet>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  bool _claimed = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _claim() async {
    final prefs = await SharedPreferences.getInstance();
    final today = DateTime.now().toIso8601String().substring(0, 10);
    await prefs.setString('daily_reward_last_claimed', today);
    setState(() => _claimed = true);
    await Future<void>.delayed(const Duration(milliseconds: 800));
    if (mounted) Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final rewards = MockData.weeklyRewards;
    final todayIndex = rewards.indexWhere((r) => !r.claimed);
    final todayReward = todayIndex >= 0 ? rewards[todayIndex] : rewards.last;

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return SlideTransition(
          position: Tween<Offset>(
            begin: const Offset(0, 0.3),
            end: Offset.zero,
          ).animate(CurvedAnimation(
            parent: _controller,
            curve: Curves.easeOutCubic,
          )),
          child: FadeTransition(opacity: _controller, child: child),
        );
      },
      child: Container(
        margin: const EdgeInsets.fromLTRB(
          AppSpacing.lg,
          0,
          AppSpacing.lg,
          AppSpacing.xl,
        ),
        padding: const EdgeInsets.all(AppSpacing.xl),
        decoration: GatsSurfaceDecoration.card(
          context,
          borderRadius: BorderRadius.circular(AppRadius.xl),
          lightShadow: AppShadows.elevated,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Handle
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: gats.divider,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
            // Title
            const Icon(
              Icons.card_giftcard_rounded,
              color: AppColors.accent,
              size: 40,
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              AppStrings.dailyRewardTitle,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                    fontSize: 20,
                  ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              AppStrings.dailyRewardSubtitle,
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const SizedBox(height: AppSpacing.xl),
            // Week calendar
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: List.generate(rewards.length, (index) {
                final reward = rewards[index];
                final isToday = index == todayIndex;
                final isClaimed = reward.claimed || (_claimed && isToday);

                return Column(
                  children: [
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: isClaimed
                            ? gats.lavenderAccent
                            : isToday
                                ? AppColors.accent.withValues(alpha: 0.15)
                                : gats.lavenderAccent.withValues(alpha: 0.08),
                        shape: BoxShape.circle,
                        border: isToday && !isClaimed
                            ? Border.all(color: AppColors.accent, width: 2)
                            : null,
                        boxShadow: isToday
                            ? [
                                BoxShadow(
                                  color: AppColors.accent.withValues(alpha: 0.3),
                                  blurRadius: 8,
                                  spreadRadius: 1,
                                ),
                              ]
                            : null,
                      ),
                      child: Center(
                        child: isClaimed
                            ? const Icon(Icons.check, color: Colors.white, size: 18)
                            : Text(
                                '+${reward.xp}',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: isToday
                                      ? AppColors.accent
                                      : gats.textSecondary,
                                ),
                              ),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'T${index + 2 > 7 ? 'CN' : '${index + 2}'}',
                      style: TextStyle(
                        fontSize: 10,
                        color: isToday
                            ? AppColors.accent
                            : gats.textSecondary,
                        fontWeight:
                            isToday ? FontWeight.w700 : FontWeight.w500,
                      ),
                    ),
                  ],
                );
              }),
            ),
            const SizedBox(height: AppSpacing.xl),
            // XP reward
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              child: _claimed
                  ? Container(
                      key: const ValueKey('claimed'),
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.xl,
                        vertical: AppSpacing.lg,
                      ),
                      decoration: BoxDecoration(
                        color: gats.lavenderAccent.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(AppRadius.lg),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.check_circle, color: gats.lavenderAccent),
                          const SizedBox(width: AppSpacing.sm),
                          Text(
                            '${AppStrings.dailyRewardClaimed} +${todayReward.xp} XP',
                            style: TextStyle(
                              color: gats.lavenderAccent,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    )
                  : SizedBox(
                      key: const ValueKey('claim'),
                      width: double.infinity,
                      child: FilledButton.icon(
                        onPressed: _claim,
                        icon: const Icon(Icons.card_giftcard_rounded),
                        label: Text(
                          '${AppStrings.dailyRewardClaim} +${todayReward.xp} XP',
                        ),
                        style: FilledButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
