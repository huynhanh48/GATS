import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/theme/gats_surface.dart';
import 'package:gats_academy/core/widgets/app_header.dart';
import 'package:gats_academy/core/widgets/floating_nav_bar.dart';
import 'package:gats_academy/core/widgets/starry_sky_background.dart';
import 'package:gats_academy/features/ai_coach/presentation/ai_coach_screen.dart';
import 'package:gats_academy/features/daily/presentation/daily_screen.dart';
import 'package:gats_academy/features/home/presentation/course_search_screen.dart';
import 'package:gats_academy/features/home/presentation/home_screen.dart';
import 'package:gats_academy/features/hub/presentation/hub_screen.dart';
import 'package:gats_academy/features/library/presentation/library_screen.dart';
import 'package:gats_academy/features/post/presentation/posts_feed_screen.dart';
import 'package:gats_academy/features/store/presentation/course_store_screen.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  static const _screens = [
    HomeScreen(),
    DailyScreen(),
    LibraryScreen(),
    AiCoachScreen(),
    CourseStoreScreen(embeddedInShell: true),
  ];

  /// Map screen index → nav bar index (4 tabs, không gồm Thư viện).
  int _navSelectedIndex(int screenIndex) {
    return switch (screenIndex) {
      0 => 0,
      1 => 1,
      3 => 2,
      4 => 3,
      _ => 0,
    };
  }

  void _onNavDestinationSelected(int navIndex) {
    final screenIndex = switch (navIndex) {
      0 => 0,
      1 => 1,
      2 => 3,
      3 => 4,
      _ => 0,
    };
    setState(() => _currentIndex = screenIndex);
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
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.of(this.context).push(
                      MaterialPageRoute<void>(builder: (_) => const PostsFeedScreen()),
                    );
                  },
                ),
                _QuickActionButton(
                  icon: Icons.search_rounded,
                  label: AppStrings.quickActionSearchCourses,
                  color: const Color(0xFF0EA5E9),
                  onTap: () {
                    Navigator.pop(context);
                    openCourseSearch(this.context);
                  },
                ),
                _QuickActionButton(
                  icon: Icons.emoji_events_outlined,
                  label: AppStrings.quickActionHub,
                  color: AppColors.accent,
                  onTap: () {
                    Navigator.pop(context);
                    Navigator.of(this.context).push(
                      MaterialPageRoute<void>(builder: (_) => const HubScreen()),
                    );
                  },
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
    final isHome = _currentIndex == 0;

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

    return GatsThemedScaffold(
      extendBody: true,
      appBar: isHome
          ? null
          : AppHeader(title: titles[_currentIndex], subtitle: subtitles[_currentIndex]),
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 300),
        switchInCurve: Curves.easeOut,
        switchOutCurve: Curves.easeIn,
        child: KeyedSubtree(
          key: ValueKey(_currentIndex),
          child: _screens[_currentIndex],
        ),
      ),
      floatingActionButton: null,
      bottomNavigationBar: FloatingNavBar(
        selectedIndex: _navSelectedIndex(_currentIndex),
        onDestinationSelected: _onNavDestinationSelected,
        centerAction: FloatingNavCenterButton(onPressed: _showQuickActions),
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
            badgeLabel: '3',
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
