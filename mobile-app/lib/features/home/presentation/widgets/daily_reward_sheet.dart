import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/navigation/root_navigator.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/features/home/data/daily_check_in_store.dart';
import 'package:gats_academy/features/home/data/streak_controller.dart';

class DailyRewardSheet extends StatefulWidget {
  const DailyRewardSheet({
    super.key,
    required this.week,
    this.onClaimed,
  });

  final List<DailyCheckInDay> week;
  final ValueChanged<int>? onClaimed;

  /// Hiện dialog điểm danh nếu hôm nay chưa nhận. Trả về XP nhận được.
  static Future<int?> showIfNeeded(BuildContext context) async {
    if (await DailyCheckInStore.hasClaimedToday()) return null;

    final week = await DailyCheckInStore.loadCurrentWeek();
    final today = DailyCheckInStore.todaySlot(week);
    if (today == null || today.claimed) return null;

    final hostContext = rootNavigatorKey.currentContext ?? context;
    if (!hostContext.mounted) return null;

    return showDialog<int>(
      context: hostContext,
      barrierDismissible: true,
      barrierColor: Colors.black54,
      builder: (dialogContext) {
        return Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
          child: DailyRewardSheet(
            week: week,
            onClaimed: (xp) {
              if (dialogContext.mounted) {
                Navigator.of(dialogContext).pop(xp);
              }
            },
          ),
        );
      },
    );
  }

  @override
  State<DailyRewardSheet> createState() => _DailyRewardSheetState();
}

class _DailyRewardSheetState extends State<DailyRewardSheet>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late List<DailyCheckInDay> _week;
  bool _claimed = false;
  bool _claiming = false;

  @override
  void initState() {
    super.initState();
    _week = List.of(widget.week);
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    )..forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  DailyCheckInDay? get _today {
    for (final d in _week) {
      if (d.isToday) return d;
    }
    return null;
  }

  Future<void> _claim() async {
    if (_claimed || _claiming) return;
    setState(() => _claiming = true);
    try {
      final xp = await DailyCheckInStore.claimToday();
      await StreakController.instance.refresh();
      if (!mounted) return;
      setState(() {
        _claimed = true;
        _week = _week
            .map(
              (d) => d.isToday
                  ? DailyCheckInDay(
                      date: d.date,
                      weekdayLabel: d.weekdayLabel,
                      xp: xp,
                      isToday: d.isToday,
                      isPast: d.isPast,
                      isFuture: d.isFuture,
                      claimed: true,
                    )
                  : d,
            )
            .toList();
      });
      await Future<void>.delayed(const Duration(milliseconds: 450));
      if (!mounted) return;
      if (widget.onClaimed != null) {
        widget.onClaimed!(xp);
      } else {
        Navigator.of(context).pop(xp);
      }
    } finally {
      if (mounted) setState(() => _claiming = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final today = _today;
    final todayXp = today?.xp ?? 0;

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return FadeTransition(
          opacity: CurvedAnimation(parent: _controller, curve: Curves.easeOut),
          child: ScaleTransition(
            scale: Tween<double>(begin: 0.92, end: 1).animate(
              CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic),
            ),
            child: child,
          ),
        );
      },
      child: Material(
        color: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.all(AppSpacing.xl),
          decoration: GatsSurfaceDecoration.card(
            context,
            borderRadius: BorderRadius.circular(AppRadius.xl),
            lightShadow: AppShadows.elevated,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: gats.divider,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: AppSpacing.xl),
              const Icon(
                Icons.card_giftcard_rounded,
                color: AppColors.accent,
                size: 40,
              ),
              const SizedBox(height: AppSpacing.md),
              Text(
                AppStrings.dailyRewardTitle,
                style: AppTypography.style(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: gats.textPrimary,
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                AppStrings.dailyRewardSubtitle,
                style: AppTypography.style(
                  fontSize: 13,
                  color: gats.textSecondary,
                ),
              ),
              const SizedBox(height: AppSpacing.xl),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: _week.map((day) {
                  final isClaimed = day.claimed || (_claimed && day.isToday);

                  return Column(
                    children: [
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        width: 38,
                        height: 38,
                        decoration: BoxDecoration(
                          color: isClaimed
                              ? gats.lavenderAccent
                              : day.isToday
                                  ? AppColors.accent.withValues(alpha: 0.15)
                                  : gats.lavenderAccent.withValues(alpha: 0.08),
                          shape: BoxShape.circle,
                          border: day.isToday && !isClaimed
                              ? Border.all(color: AppColors.accent, width: 2)
                              : null,
                          boxShadow: day.isToday
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
                                  '+${day.xp}',
                              style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: day.isToday
                                        ? AppColors.accent
                                        : gats.textSecondary,
                                    decoration: TextDecoration.none,
                                  ),
                                ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        day.weekdayLabel,
                        style: TextStyle(
                          fontSize: 10,
                          color: day.isToday
                              ? AppColors.accent
                              : gats.textSecondary,
                          fontWeight:
                              day.isToday ? FontWeight.w700 : FontWeight.w500,
                          decoration: TextDecoration.none,
                        ),
                      ),
                    ],
                  );
                }).toList(),
              ),
              const SizedBox(height: AppSpacing.xl),
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
                              '${AppStrings.dailyRewardClaimed} +$todayXp XP',
                              style: TextStyle(
                                color: gats.lavenderAccent,
                                fontWeight: FontWeight.w700,
                                decoration: TextDecoration.none,
                              ),
                            ),
                          ],
                        ),
                      )
                    : SizedBox(
                        key: const ValueKey('claim'),
                        width: double.infinity,
                        child: FilledButton.icon(
                          onPressed: _claiming ? null : _claim,
                          icon: _claiming
                              ? SizedBox(
                                  width: 18,
                                  height: 18,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Theme.of(context).colorScheme.onPrimary,
                                  ),
                                )
                              : const Icon(Icons.card_giftcard_rounded),
                          label: Text(
                            '${AppStrings.dailyRewardClaim} +$todayXp XP',
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
      ),
    );
  }
}
