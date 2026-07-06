import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/theme/app_spacing.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/section_card.dart';
import 'package:gats_academy/data/catalog/learning_activities_catalog.dart';
import 'package:gats_academy/data/mock/mock_data.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/features/home/presentation/widgets/nested_tab_scroll.dart';

class RoadmapTab extends StatefulWidget {
  const RoadmapTab({super.key, this.nestedScroll = false, this.userId});

  final bool nestedScroll;
  final String? userId;

  @override
  State<RoadmapTab> createState() => _RoadmapTabState();
}

class _RoadmapTabState extends State<RoadmapTab> {
  List<RoadmapModule> _modules = MockData.staticRoadmapModules;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final user = await AuthPrefs.currentUser();
    final userId = widget.userId ?? user?.id;
    final modules = await LearningActivitiesCatalog.instance.roadmapModules(
      userId: userId,
      role: user?.role ?? UserRole.user,
    );
    if (!mounted) return;
    setState(() => _modules = modules);
  }

  @override
  Widget build(BuildContext context) {
    if (widget.nestedScroll) {
      return NestedTabScrollView(
        storageKey: 'home_roadmap',
        slivers: [
          SliverPadding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            sliver: SliverList.separated(
              itemCount: _modules.length,
              separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.md),
              itemBuilder: (context, index) {
                final module = _modules[index];
                return _RoadmapCard(
                  module: module,
                  index: index,
                  isLast: index == _modules.length - 1,
                );
              },
            ),
          ),
        ],
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(AppSpacing.lg),
      itemCount: _modules.length,
      separatorBuilder: (context, index) => const SizedBox(height: AppSpacing.md),
      itemBuilder: (context, index) {
        final module = _modules[index];
        return _RoadmapCard(module: module, index: index, isLast: index == _modules.length - 1);
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
                color: gats.lavenderAccent.withValues(alpha: 0.12),
                shape: BoxShape.circle,
              ),
              child: Icon(module.icon, size: 18, color: gats.lavenderAccent),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 48,
                margin: const EdgeInsets.symmetric(vertical: 4),
                color: gats.divider,
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
                      child: Text(
                        module.title,
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800),
                      ),
                    ),
                    Text(statusLabel, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: statusColor)),
                  ],
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(module.description, style: TextStyle(color: gats.textSecondary, fontSize: 13)),
                if (module.status == RoadmapStatus.inProgress) ...[
                  const SizedBox(height: AppSpacing.sm),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: module.progress,
                      minHeight: 4,
                      backgroundColor: gats.divider,
                      color: gats.lavenderAccent,
                    ),
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
