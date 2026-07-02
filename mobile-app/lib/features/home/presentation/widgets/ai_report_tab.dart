import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/section_card.dart';
import 'package:gats_academy/core/widgets/ui_components.dart';
import 'package:gats_academy/data/mock/mock_data.dart';
import 'package:gats_academy/features/home/presentation/widgets/nested_tab_scroll.dart';

class AiReportTab extends StatelessWidget {
  const AiReportTab({super.key, this.nestedScroll = false});

  final bool nestedScroll;

  Widget _content(BuildContext context) {
    final report = MockData.aiReport;

    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: StatTile(
                icon: Icons.timer_outlined,
                value: '${report.weeklyMinutes}',
                label: AppStrings.reportMinsPerWeek,
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: StatTile(
                icon: Icons.local_fire_department_outlined,
                value: '${MockData.streakDays}',
                label: AppStrings.reportStreakDays,
                color: AppColors.accent,
                backgroundColor: AppColors.accent.withValues(alpha: 0.1),
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: SectionCard(
                child: _ReportSection(
                  title: AppStrings.reportStrengths,
                  items: report.strengths,
                  color: AppColors.success,
                  icon: Icons.thumb_up_outlined,
                ),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: SectionCard(
                child: _ReportSection(
                  title: AppStrings.reportImprovement,
                  items: report.weaknesses,
                  color: AppColors.warning,
                  icon: Icons.trending_up,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        SectionCard(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.lightbulb_outline, color: AppColors.accent),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(AppStrings.reportReviewSuggestions, style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 6),
                    Text(report.suggestion, style: Theme.of(context).textTheme.bodyMedium),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    if (nestedScroll) {
      return NestedTabScrollView(
        storageKey: 'home_ai_report',
        slivers: [
          SliverPadding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            sliver: SliverToBoxAdapter(child: _content(context)),
          ),
        ],
      );
    }

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [_content(context)],
    );
  }
}

class _ReportSection extends StatelessWidget {
  const _ReportSection({
    required this.title,
    required this.items,
    required this.color,
    required this.icon,
  });

  final String title;
  final List<String> items;
  final Color color;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 18, color: color),
            const SizedBox(width: 6),
            Flexible(child: Text(title, style: Theme.of(context).textTheme.titleMedium)),
          ],
        ),
        const SizedBox(height: 8),
        ...items.map(
          (item) => Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: Row(
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                ),
                const SizedBox(width: 8),
                Expanded(child: Text(item, style: Theme.of(context).textTheme.bodySmall)),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
