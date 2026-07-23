import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/navigation/gats_main_navigator.dart';
import 'package:gats_academy/core/navigation/shell_tab_scope.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/app_header.dart';
import 'package:gats_academy/core/widgets/floating_nav_bar.dart';
import 'package:gats_academy/core/widgets/lazy_indexed_stack.dart';
import 'package:gats_academy/core/widgets/starry_sky_background.dart';
import 'package:gats_academy/features/home/presentation/course_search_screen.dart';
import 'package:gats_academy/features/home/presentation/home_screen.dart';
import 'package:gats_academy/features/post/presentation/posts_feed_screen.dart';
import 'package:gats_academy/features/store/presentation/course_store_screen.dart';

/// Tab indices trong [LazyIndexedStack].
abstract final class MainShellTabs {
  static const home = 0;
  static const store = 1;
  static const count = 2;
}

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = MainShellTabs.home;

  void _onNavDestinationSelected(int navIndex) {
    final screenIndex = switch (navIndex) {
      0 => MainShellTabs.home,
      1 => MainShellTabs.store,
      _ => MainShellTabs.home,
    };
    setState(() => _currentIndex = screenIndex);
  }

  Widget _screenAt(BuildContext context, int index) {
    return switch (index) {
      MainShellTabs.home => const HomeScreen(),
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
      AppStrings.navStore,
    ];

    final subtitles = [
      AppHeaderSubtitles.home,
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
          child: FloatingNavBar(
            selectedIndex: _currentIndex,
            onDestinationSelected: _onNavDestinationSelected,
            centerAction: FloatingNavCenterButton(onPressed: _showQuickActions),
            destinations: [
              FloatingNavDestination(
                icon: Icons.home_outlined,
                selectedIcon: Icons.home_rounded,
                label: AppStrings.navHome,
              ),
              FloatingNavDestination(
                icon: Icons.storefront_outlined,
                selectedIcon: Icons.storefront_rounded,
                label: AppStrings.navStore,
              ),
            ],
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
