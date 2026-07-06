import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/features/home/presentation/learning_tools_screen.dart';

/// Cụm Roadmap / Quiz / AI Report trên Home.
class LearningToolsEntry extends StatelessWidget {
  const LearningToolsEntry({super.key, this.userId});

  final String? userId;

  static const _items = [
    (icon: Icons.map_outlined, tab: 0),
    (icon: Icons.quiz_outlined, tab: 1),
    (icon: Icons.insights_outlined, tab: 2),
  ];

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final labels = [AppStrings.tabRoadmap, AppStrings.tabQuiz, AppStrings.tabAiReport];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          AppStrings.homeLearningTools,
          style: AppTypography.style(
            fontSize: 16,
            fontWeight: FontWeight.w800,
            color: gats.textPrimary,
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        Container(
          padding: const EdgeInsets.symmetric(vertical: AppSpacing.md, horizontal: AppSpacing.sm),
          decoration: BoxDecoration(
            color: gats.surface.withValues(alpha: gats.isStarry ? 0.9 : 1),
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(color: gats.divider.withValues(alpha: 0.55)),
            boxShadow: gats.isStarry ? null : AppShadows.card,
          ),
          child: Row(
            children: List.generate(_items.length, (index) {
              final item = _items[index];
              return Expanded(
                child: _ToolTile(
                  icon: item.icon,
                  label: labels[index],
                  onTap: () => openLearningTools(context, initialTab: item.tab, userId: userId),
                ),
              );
            }),
          ),
        ),
      ],
    );
  }
}

class _ToolTile extends StatelessWidget {
  const _ToolTile({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm, horizontal: AppSpacing.xs),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: gats.lavenderAccent.withValues(alpha: 0.14),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: gats.lavenderAccent, size: 22),
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                label,
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: AppTypography.style(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: gats.textPrimary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
