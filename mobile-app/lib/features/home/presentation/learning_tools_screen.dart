import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/navigation/gats_main_navigator.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/lazy_indexed_stack.dart';
import 'package:gats_academy/core/widgets/starry_sky_background.dart';
import 'package:gats_academy/core/widgets/ui_components.dart';
import 'package:gats_academy/features/home/presentation/widgets/ai_report_tab.dart';
import 'package:gats_academy/features/home/presentation/widgets/quiz_tab.dart';
import 'package:gats_academy/features/home/presentation/widgets/roadmap_tab.dart';

/// Roadmap + Quiz + AI Report — gom trong một màn.
class LearningToolsScreen extends StatefulWidget {
  const LearningToolsScreen({
    super.key,
    this.initialTab = 0,
    this.userId,
  });

  final int initialTab;
  final String? userId;

  @override
  State<LearningToolsScreen> createState() => _LearningToolsScreenState();
}

class _LearningToolsScreenState extends State<LearningToolsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: 3,
      vsync: this,
      initialIndex: widget.initialTab.clamp(0, 2),
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;

    return GatsThemedScaffold(
      appBar: AppBar(
        backgroundColor: gats.isStarry ? Colors.transparent : gats.background,
        surfaceTintColor: Colors.transparent,
        title: Text(
          AppStrings.homeLearningTools,
          style: AppTypography.style(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: gats.textPrimary,
          ),
        ),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.sm, AppSpacing.lg, AppSpacing.md),
            child: PillTabBar(
              controller: _tabController,
              tabs: [AppStrings.tabRoadmap, AppStrings.tabQuiz, AppStrings.tabAiReport],
            ),
          ),
          Expanded(
            child: LazyTabBarView(
              controller: _tabController,
              itemCount: 3,
              itemBuilder: (context, index) {
                return switch (index) {
                  0 => RoadmapTab(userId: widget.userId),
                  1 => QuizTab(userId: widget.userId),
                  _ => const AiReportTab(),
                };
              },
            ),
          ),
        ],
      ),
    );
  }
}

void openLearningTools(
  BuildContext context, {
  int initialTab = 0,
  String? userId,
}) {
  GatsMainNavigator.push(
    context,
    LearningToolsScreen(initialTab: initialTab, userId: userId),
  );
}
