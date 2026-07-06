import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/starry_sky_background.dart';
import 'package:gats_academy/core/widgets/ui_components.dart';

class CourseTabShell extends StatelessWidget {
  const CourseTabShell({
    super.key,
    required this.tabController,
    required this.tabLabels,
    required this.tabBodies,
    this.hero,
    this.bottomBar,
    this.title,
  });

  final TabController tabController;
  final List<String> tabLabels;
  final List<Widget> tabBodies;
  final Widget? hero;
  final Widget? bottomBar;
  final String? title;

  @override
  Widget build(BuildContext context) {
    assert(tabLabels.length == tabBodies.length);

    return GatsThemedScaffold(
      body: Stack(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (hero != null) hero!,
              if (title != null)
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                  child: Text(
                    title!,
                    style: AppTypography.style(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: context.gatsColors.textPrimary,
                    ),
                  ),
                ),
              PillTabBar(tabs: tabLabels, controller: tabController),
              Expanded(
                child: TabBarView(
                  controller: tabController,
                  children: tabBodies,
                ),
              ),
            ],
          ),
          if (bottomBar != null)
            Positioned(left: 0, right: 0, bottom: 0, child: bottomBar!),
        ],
      ),
    );
  }
}
