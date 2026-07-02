import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/theme/gats_surface.dart';
import 'package:gats_academy/data/mock/mock_data.dart';

class AchievementTimeline extends StatelessWidget {
  const AchievementTimeline({super.key});

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final achievements = MockData.achievements;

    return Column(
      children: List.generate(achievements.length, (index) {
        final achievement = achievements[index];
        final isLast = index == achievements.length - 1;

        return IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Timeline connector
              SizedBox(
                width: 40,
                child: Column(
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: _typeColor(achievement.type).withValues(alpha: 0.15),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: _typeColor(achievement.type),
                          width: 2,
                        ),
                      ),
                      child: Icon(
                        achievement.icon,
                        color: _typeColor(achievement.type),
                        size: 14,
                      ),
                    ),
                    if (!isLast)
                      Expanded(
                        child: Container(
                          width: 2,
                          color: gats.divider,
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              // Content
              Expanded(
                child: Container(
                  margin: EdgeInsets.only(
                    bottom: isLast ? 0 : AppSpacing.lg,
                  ),
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  decoration: GatsSurfaceDecoration.card(
                    context,
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              achievement.title,
                              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                    fontWeight: FontWeight.w700,
                                  ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: _typeColor(achievement.type).withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              _typeLabel(achievement.type),
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: _typeColor(achievement.type),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        achievement.description,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      const SizedBox(height: 6),
                      Text(
                        achievement.date,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              fontSize: 11,
                              color: gats.textSecondary,
                            ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      }),
    );
  }

  Color _typeColor(String type) {
    return switch (type) {
      'milestone' => AppColors.primary,
      'streak' => const Color(0xFFEF4444),
      'quiz' => AppColors.accent,
      _ => AppColors.textSecondary,
    };
  }

  String _typeLabel(String type) {
    return switch (type) {
      'milestone' => 'Cột mốc',
      'streak' => 'Streak',
      'quiz' => 'Quiz',
      _ => 'Khác',
    };
  }
}
