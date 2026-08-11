import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/navigation/gats_main_navigator.dart';
import 'package:gats_academy/core/navigation/main_shell_tab_controller.dart';
import 'package:gats_academy/core/navigation/shell_tab_scope.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/app_header.dart';
import 'package:gats_academy/core/widgets/floating_nav_bar.dart';
import 'package:gats_academy/core/widgets/lazy_indexed_stack.dart';
import 'package:gats_academy/core/widgets/starry_sky_background.dart';
import 'package:gats_academy/features/ai_coach/presentation/ai_coach_screen.dart';
import 'package:gats_academy/features/daily/data/daily_tasks_controller.dart';
import 'package:gats_academy/features/daily/presentation/daily_screen.dart';
import 'package:gats_academy/features/home/presentation/course_search_screen.dart';
import 'package:gats_academy/features/home/presentation/home_screen.dart';
import 'package:gats_academy/features/hub/presentation/hub_screen.dart';
import 'package:gats_academy/features/library/presentation/library_screen.dart';
import 'package:gats_academy/features/post/presentation/posts_feed_screen.dart';
import 'package:gats_academy/features/store/presentation/course_store_screen.dart';

/// Tab indices trong [LazyIndexedStack].
abstract final class MainShellTabs {
  static const home = 0;
  static const daily = 1;
  static const library = 2;
  static const coach = 3;
  static const store = 4;
  static const count = 5;
}

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = MainShellTabs.home;

  @override
  void initState() {
    super.initState();
    DailyTasksController.instance.ensureLoaded();
    MainShellTabController.instance.addListener(_onTabRequest);
  }

  @override
  void dispose() {
    MainShellTabController.instance.removeListener(_onTabRequest);
    super.dispose();
  }

  void _onTabRequest() {
    final index = MainShellTabController.instance.takePending();
    if (index == null || index < 0 || index >= MainShellTabs.count) return;
    if (!mounted) return;
    setState(() => _currentIndex = index);
  }

  int _navSelectedIndex(int screenIndex) {
    return switch (screenIndex) {
      MainShellTabs.home => 0,
      MainShellTabs.daily => 1,
      MainShellTabs.coach => 2,
      MainShellTabs.store => 3,
      _ => 0,
    };
  }

  void _onNavDestinationSelected(int navIndex) {
    final screenIndex = switch (navIndex) {
      0 => MainShellTabs.home,
      1 => MainShellTabs.daily,
      2 => MainShellTabs.coach,
      3 => MainShellTabs.store,
      _ => MainShellTabs.home,
    };
    setState(() => _currentIndex = screenIndex);
  }

  Widget _screenAt(BuildContext context, int index) {
    return switch (index) {
      MainShellTabs.home => const HomeScreen(),
      MainShellTabs.daily => const DailyScreen(),
      MainShellTabs.library => const LibraryScreen(),
      MainShellTabs.coach => const AiCoachScreen(),
      MainShellTabs.store => const CourseStoreScreen(embeddedInShell: true),
      _ => const SizedBox.shrink(),
    };
  }

  void _openQuickAction(Widget page) {
    Navigator.of(context).pop();
    GatsMainNavigator.push(context, page);
  }

  void _showQuickActions() {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) {
        final gats = context.gatsColors;
        return Container(
          margin: const EdgeInsets.all(AppSpacing.lg),
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
              const SizedBox(height: AppSpacing.lg),
              Text(
                AppStrings.quickActionTitle,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
              ),
              const SizedBox(height: AppSpacing.lg),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _QuickActionButton(
                    icon: Icons.article_outlined,
                    label: AppStrings.quickActionPosts,
                    color: AppColors.primary,
                    onTap: () => _openQuickAction(const PostsFeedScreen()),
                  ),
                  _QuickActionButton(
                    icon: Icons.search_rounded,
                    label: AppStrings.quickActionSearchCourses,
                    color: const Color(0xFF0EA5E9),
                    onTap: () => _openQuickAction(const CourseSearchScreen()),
                  ),
                  _QuickActionButton(
                    icon: Icons.emoji_events_outlined,
                    label: AppStrings.quickActionHub,
                    color: AppColors.accent,
                    onTap: () => _openQuickAction(const HubScreen()),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isHome = _currentIndex == MainShellTabs.home;

    final titles = [
      AppStrings.navHome,
      AppStrings.navDaily,
      AppStrings.navLibrary,
      AppStrings.navCoach,
      AppStrings.navStore,
    ];

    final subtitles = [
      AppHeaderSubtitles.home,
      AppHeaderSubtitles.daily,
      AppHeaderSubtitles.library,
      AppHeaderSubtitles.aiCoach,
      AppHeaderSubtitles.store,
    ];

    return ShellTabScope(
      activeIndex: _currentIndex,
      child: GatsThemedScaffold(
        extendBody: true,
        appBar: isHome
            ? null
            : AppHeader(
                title: titles[_currentIndex],
                subtitle: subtitles[_currentIndex],
              ),
        body: LazyIndexedStack(
          index: _currentIndex,
          itemCount: MainShellTabs.count,
          itemBuilder: _screenAt,
        ),
        floatingActionButton: null,
        bottomNavigationBar: RepaintBoundary(
          child: ListenableBuilder(
            listenable: DailyTasksController.instance,
            builder: (context, _) {
              return FloatingNavBar(
                selectedIndex: _navSelectedIndex(_currentIndex),
                onDestinationSelected: _onNavDestinationSelected,
                centerAction:
                    FloatingNavCenterButton(onPressed: _showQuickActions),
                destinations: [
                  FloatingNavDestination(
                    icon: Icons.home_outlined,
                    selectedIcon: Icons.home_rounded,
                    label: AppStrings.navHome,
                  ),
                  FloatingNavDestination(
                    icon: Icons.today_outlined,
                    selectedIcon: Icons.today_rounded,
                    label: AppStrings.navDaily,
                    badgeLabel: DailyTasksController.instance.badgeLabel,
                    badgeTooltip: DailyTasksController.instance.pendingCount > 0
                        ? AppStrings.navDailyBadgeTooltip(
                            DailyTasksController.instance.pendingCount,
                          )
                        : null,
                  ),
                  FloatingNavDestination(
                    icon: Icons.psychology_outlined,
                    selectedIcon: Icons.psychology_rounded,
                    label: AppStrings.navCoach,
                  ),
                  FloatingNavDestination(
                    icon: Icons.storefront_outlined,
                    selectedIcon: Icons.storefront_rounded,
                    label: AppStrings.navStore,
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class _QuickActionButton extends StatelessWidget {
  const _QuickActionButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 26),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
