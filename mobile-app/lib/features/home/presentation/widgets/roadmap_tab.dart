import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_spacing.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/section_card.dart';
import 'package:gats_academy/data/mock/mock_data.dart';
import 'package:gats_academy/features/home/presentation/widgets/nested_tab_scroll.dart';

class RoadmapTab extends StatelessWidget {
  const RoadmapTab({super.key, this.nestedScroll = false});

  final bool nestedScroll;

  @override
  Widget build(BuildContext context) {
    if (nestedScroll) {
      return NestedTabScrollView(
        storageKey: 'home_roadmap',
        slivers: [
          SliverPadding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            sliver: SliverList.separated(
              itemCount: MockData.roadmapModules.length,
              separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.md),
              itemBuilder: (context, index) {
                final module = MockData.roadmapModules[index];
                return _RoadmapCard(
                  module: module,
                  index: index,
                  isLast: index == MockData.roadmapModules.length - 1,
                );
              },
            ),
          ),
        ],
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(AppSpacing.lg),
      itemCount: MockData.roadmapModules.length,
      separatorBuilder: (context, index) => const SizedBox(height: AppSpacing.md),
      itemBuilder: (context, index) {
        final module = MockData.roadmapModules[index];
        return _RoadmapCard(module: module, index: index, isLast: index == MockData.roadmapModules.length - 1);
      },
    );
  }
}

class _RoadmapCard extends StatelessWidget {
  const _RoadmapCard({
    required this.module,
    required this.index,
    required this.isLast,
  });

  final RoadmapModule module;
  final int index;
  final bool isLast;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final (statusLabel, statusColor) = switch (module.status) {
      RoadmapStatus.completed => (AppStrings.statusCompleted, AppColors.success),
      RoadmapStatus.inProgress => (AppStrings.statusInProgress, gats.lavenderAccent),
      RoadmapStatus.notStarted => (AppStrings.statusNotStarted, gats.textSecondary),
    };

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: statusColor.withValues(alpha: 0.15),
                shape: BoxShape.circle,
                border: Border.all(color: statusColor, width: 2),
              ),
              child: Icon(
                module.status == RoadmapStatus.completed ? Icons.check : module.icon,
                size: 18,
                color: statusColor,
              ),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 56,
                margin: const EdgeInsets.symmetric(vertical: 4),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [statusColor.withValues(alpha: 0.5), gats.divider],
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: SectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(module.title, style: Theme.of(context).textTheme.titleMedium),
                    ),
                    StatusChip(label: statusLabel, color: statusColor),
                  ],
                ),
                const SizedBox(height: 6),
                Text(module.description, style: Theme.of(context).textTheme.bodySmall),
                if (module.status == RoadmapStatus.inProgress) ...[
                  const SizedBox(height: 10),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: module.progress,
                      minHeight: 6,
                      backgroundColor: gats.divider,
                      color: gats.lavenderAccent,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    AppStrings.coursePercentCompleted.replaceFirst('%d', '${(module.progress * 100).round()}'),
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ],
            ),
          ),
        ),
      ],
    );
  }
}
