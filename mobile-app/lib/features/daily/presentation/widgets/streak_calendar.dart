import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/theme/gats_surface.dart';

class StreakCalendar extends StatelessWidget {
  const StreakCalendar({
    super.key,
    required this.streakDays,
    required this.todayCompleted,
  });

  final int streakDays;
  final bool todayCompleted;

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final weekday = now.weekday; // 1 = Monday

    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: GatsSurfaceDecoration.card(
        context,
        borderRadius: BorderRadius.circular(AppRadius.xl),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.local_fire_department_rounded,
                color: Color(0xFFEF4444),
                size: 20,
              ),
              const SizedBox(width: AppSpacing.sm),
              Text(
                AppStrings.streakCalendarTitle,
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFEF4444).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '$streakDays ngày streak',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFFEF4444),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: List.generate(7, (index) {
              final dayIndex = index + 1; // 1-7 for Mon-Sun
              final isToday = dayIndex == weekday;
              final isPast = dayIndex < weekday;
              final isStreakDay = isPast && (weekday - dayIndex) < streakDays;
              final isCompleted = isStreakDay || (isToday && todayCompleted);

              return _CalendarDay(
                label: _dayLabel(dayIndex),
                isToday: isToday,
                isCompleted: isCompleted,
                isFuture: dayIndex > weekday,
              );
            }),
          ),
          const SizedBox(height: AppSpacing.lg),
          // Motivation text
          Center(
            child: Text(
              streakDays >= 5
                  ? AppStrings.streakMotivation1
                  : streakDays >= 3
                      ? AppStrings.streakMotivation2
                      : AppStrings.streakMotivation3,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
            ),
          ),
        ],
      ),
    );
  }

  String _dayLabel(int weekday) {
    return switch (weekday) {
      1 => 'T2',
      2 => 'T3',
      3 => 'T4',
      4 => 'T5',
      5 => 'T6',
      6 => 'T7',
      7 => 'CN',
      _ => '',
    };
  }
}

class _CalendarDay extends StatelessWidget {
  const _CalendarDay({
    required this.label,
    required this.isToday,
    required this.isCompleted,
    required this.isFuture,
  });

  final String label;
  final bool isToday;
  final bool isCompleted;
  final bool isFuture;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return Column(
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          width: 38,
          height: 38,
          decoration: BoxDecoration(
            color: isCompleted
                ? gats.lavenderAccent
                : isToday
                    ? AppColors.accent.withValues(alpha: 0.15)
                    : isFuture
                        ? gats.lavenderAccent.withValues(alpha: 0.08)
                        : gats.divider.withValues(alpha: 0.5),
            shape: BoxShape.circle,
            border: isToday && !isCompleted
                ? Border.all(color: AppColors.accent, width: 2)
                : null,
            boxShadow: isCompleted
                ? [
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.3),
                      blurRadius: 6,
                      spreadRadius: 1,
                    ),
                  ]
                : null,
          ),
          child: Center(
            child: isCompleted
                ? const Icon(Icons.check, color: Colors.white, size: 18)
                : isToday
                    ? Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: AppColors.accent,
                          shape: BoxShape.circle,
                        ),
                      )
                    : null,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: isToday
                ? AppColors.accent
                : isCompleted
                    ? gats.lavenderAccent
                    : gats.textSecondary,
            fontWeight: isToday || isCompleted
                ? FontWeight.w700
                : FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
