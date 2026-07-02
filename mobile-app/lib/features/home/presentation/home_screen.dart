import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/services/cart_controller.dart';
import 'package:gats_academy/features/store/presentation/cart_screen.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/ted/ted.dart';
import 'package:gats_academy/core/widgets/ui_components.dart';
import 'package:gats_academy/data/mock/mock_course_store.dart';
import 'package:gats_academy/data/mock/mock_data.dart';
import 'package:gats_academy/features/auth/models/auth_user.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/features/course/presentation/course_detail_screen.dart';
import 'package:gats_academy/features/home/presentation/course_search_screen.dart';
import 'package:gats_academy/features/home/presentation/widgets/ai_report_tab.dart';
import 'package:gats_academy/features/home/presentation/widgets/continue_learning_card.dart';
import 'package:gats_academy/features/home/presentation/widgets/daily_reward_sheet.dart';
import 'package:gats_academy/features/home/presentation/widgets/nested_tab_scroll.dart';
import 'package:gats_academy/features/home/presentation/widgets/quiz_tab.dart';
import 'package:gats_academy/features/home/presentation/widgets/roadmap_tab.dart';
import 'package:gats_academy/features/settings/presentation/settings_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  AuthUser? _user;
  String _userName = 'Học viên GATS';
  List<CourseItem> _courses = MockData.courses;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadSession();
    MockCourseStore.instance.addListener(_onStoreChanged);
  }

  Future<void> _loadSession() async {
    final user = await AuthPrefs.currentUser();
    final name = await MockData.userName();
    if (!mounted) return;
    setState(() {
      _user = user;
      _userName = name;
      _refreshCourses();
    });
    if (mounted) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) DailyRewardSheet.showIfNeeded(context);
      });
    }
  }

  void _onStoreChanged() {
    if (!mounted) return;
    setState(_refreshCourses);
  }

  void _refreshCourses() {
    final role = _user?.role ?? UserRole.guest;
    _courses = MockCourseStore.instance.courseItemsFor(_user?.id, role: role);
  }

  CourseItem? get _continueCourse {
    final enrolled = _courses.where((c) => c.isEnrolled && c.progress > 0 && c.progress < 1);
    return enrolled.isNotEmpty ? enrolled.first : null;
  }

  void _openCourse(CourseItem course) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => CourseDetailScreen(courseId: course.id)),
    );
  }

  @override
  void dispose() {
    MockCourseStore.instance.removeListener(_onStoreChanged);
    _tabController.dispose();
    super.dispose();
  }

  Widget _buildTopActionBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.sm, AppSpacing.lg, 0),
      child: Row(
        children: [
          const Spacer(),
          AnimatedBuilder(
            animation: CartController.instance,
            builder: (context, _) {
              final qty = CartController.instance.totalQuantity;
              return Stack(
                clipBehavior: Clip.none,
                children: [
                  _HomeHeaderIconButton(
                    icon: Icons.shopping_cart_outlined,
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute<void>(builder: (_) => const CartScreen()),
                      );
                    },
                  ),
                  if (qty > 0)
                    Positioned(
                      top: -4,
                      right: -4,
                      child: Badge(
                        label: Text('$qty'),
                      ),
                    ),
                ],
              );
            },
          ),
          const SizedBox(width: AppSpacing.sm),
          _HomeHeaderIconButton(
            icon: Icons.notifications_none_rounded,
            showDot: true,
            onTap: () {},
          ),
          const SizedBox(width: AppSpacing.sm),
          _HomeHeaderIconButton(
            icon: Icons.settings_outlined,
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute<void>(builder: (_) => const SettingsScreen()),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildGreetingBar() {
    final gats = context.gatsColors;
    return Container(
      margin: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.md, AppSpacing.lg, 0),
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
      decoration: BoxDecoration(
        color: gats.surface.withValues(alpha: gats.isStarry ? 0.9 : 1),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: gats.isStarry ? Border.all(color: gats.divider.withValues(alpha: 0.5)) : null,
        boxShadow: gats.isStarry ? null : AppShadows.card,
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: const BoxDecoration(
              gradient: AppGradients.primary,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                _userName.characters.first.toUpperCase(),
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                  fontSize: 17,
                ),
              ),
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Text(
              AppStrings.homeGreeting.replaceFirst('%s', _userName),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
            decoration: BoxDecoration(
              color: AppColors.accent.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(AppRadius.pill),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.local_fire_department_rounded, size: 14, color: AppColors.accent),
                const SizedBox(width: 2),
                Text(
                  '${MockData.streakDays}',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: AppColors.accent,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(List<CourseItem> previewCourses) {
    final continueCourse = _continueCourse;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildTopActionBar(),
        _buildGreetingBar(),
        Padding(
          padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.lg, AppSpacing.lg, AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (continueCourse != null) ...[
                ContinueLearningCard(
                  courseTitle: continueCourse.title,
                  progress: continueCourse.progress,
                  lessonCount: continueCourse.lessonCount,
                  onTap: () => _openCourse(continueCourse),
                ),
                const SizedBox(height: AppSpacing.lg),
              ],
              TedSectionHeader(
                title: AppStrings.homePopularCourses,
                actionLabel: AppStrings.seeAll,
                onAction: () => openCourseSearch(context),
              ),
              if (previewCourses.isNotEmpty) ...[
                const SizedBox(height: AppSpacing.md),
                SizedBox(
                  height: 92,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: previewCourses.length,
                    separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.md),
                    itemBuilder: (context, index) {
                      final course = previewCourses[index];
                      return SizedBox(
                        width: 300,
                        child: TedCourseCard(
                          course: course,
                          compact: true,
                          bookmarked: course.isEnrolled,
                          onTap: () => _openCourse(course),
                        ),
                      );
                    },
                  ),
                ),
              ],
              const SizedBox(height: AppSpacing.lg),
            ],
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final previewCourses = _courses.take(5).toList();

    return SafeArea(
      bottom: false,
      child: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) {
          return [
            SliverOverlapAbsorber(
              handle: NestedScrollView.sliverOverlapAbsorberHandleFor(context),
              sliver: SliverToBoxAdapter(child: _buildHeader(previewCourses)),
            ),
            SliverPersistentHeader(
              pinned: true,
              delegate: HomeTabBarDelegate(
                child: PillTabBar(
                  controller: _tabController,
                  tabs: [AppStrings.tabRoadmap, AppStrings.tabQuiz, AppStrings.tabAiReport],
                ),
              ),
            ),
          ];
        },
        body: TabBarView(
          controller: _tabController,
          children: [
            const RoadmapTab(nestedScroll: true),
            QuizTab(userId: _user?.id, nestedScroll: true),
            const AiReportTab(nestedScroll: true),
          ],
        ),
      ),
    );
  }
}

class _HomeHeaderIconButton extends StatelessWidget {
  const _HomeHeaderIconButton({
    required this.icon,
    required this.onTap,
    this.showDot = false,
  });

  final IconData icon;
  final VoidCallback onTap;
  final bool showDot;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return Material(
      color: gats.surface.withValues(alpha: gats.isStarry ? 0.85 : 1),
      shape: const CircleBorder(),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onTap,
        child: SizedBox(
          width: 40,
          height: 40,
          child: Stack(
            alignment: Alignment.center,
            children: [
              Icon(icon, color: gats.textPrimary, size: 22),
              if (showDot)
                const Positioned(
                  top: 10,
                  right: 10,
                  child: SizedBox(
                    width: 7,
                    height: 7,
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        color: AppColors.accent,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
