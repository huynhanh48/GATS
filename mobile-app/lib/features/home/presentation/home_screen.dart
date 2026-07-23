import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/navigation/root_navigator.dart';
import 'package:gats_academy/core/services/cart_controller.dart';
import 'package:gats_academy/core/services/gats_notification_service.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/shimmer_loading.dart';
import 'package:gats_academy/core/widgets/floating_nav_bar.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';
import 'package:gats_academy/features/auth/models/auth_user.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/features/course/course_module.dart';
import 'package:gats_academy/features/course/navigation/course_navigator.dart';
import 'package:gats_academy/features/home/data/streak_controller.dart';
import 'package:gats_academy/features/home/presentation/course_search_screen.dart';
import 'package:gats_academy/features/home/presentation/widgets/home_course_carousel_section.dart';
import 'package:gats_academy/features/home/presentation/widgets/your_courses_section.dart';
import 'package:gats_academy/features/home/presentation/widgets/continue_learning_card.dart';
import 'package:gats_academy/features/post/presentation/widgets/home_posts_section.dart';
import 'package:gats_academy/data/post_store.dart';
import 'package:gats_academy/features/settings/presentation/settings_screen.dart';
import 'package:gats_academy/features/store/presentation/cart_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  AuthUser? _user;
  String _userName = 'Học viên GATS';
  List<CourseItem> _courses = const [];

  List<CourseItem> _yourCourses = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadSession();
    CourseModule.repository.addListener(_onCoursesChanged);
    CartController.instance.addListener(_onCartChanged);
    PostStore.instance.addListener(_onCartChanged);
    PostStore.instance.syncFromApi();
    StreakController.instance.ensureLoaded();
  }

  void _onCartChanged() {
    if (!mounted) return;
    setState(() {});
  }

  Future<void> _addToCart(CourseItem course) async {
    try {
      await CartController.instance.addToCart(course.id);
      GatsNotificationService.showInApp(
        message: AppStrings.storeAddedToCart.replaceFirst('%s', course.title),
        actionLabel: AppStrings.storeViewCart,
        onAction: () {
          final ctx = rootNavigatorKey.currentContext;
          if (ctx != null) openCart(ctx);
        },
      );
    } catch (e) {
      if (!mounted) return;
      final msg = CartController.instance.lastError ?? e.toString();
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
    }
  }

  Future<void> _loadSession() async {
    final user = await AuthPrefs.currentUser();
    await StreakController.instance.refresh();
    if (!mounted) return;
    setState(() {
      _user = user;
      _userName = user?.displayName.trim().isNotEmpty == true
          ? user!.displayName.trim()
          : 'Học viên GATS';
      _refreshCourses();
      _isLoading = false;
    });
  }

  void _onCoursesChanged() {
    if (!mounted) return;
    setState(_refreshCourses);
  }

  void _refreshCourses() {
    final role = _user?.role ?? UserRole.user;
    _courses = CourseModule.repository.listPublished(userId: _user?.id, role: role);
    _yourCourses = CourseModule.repository.listOwned(userId: _user?.id, role: role);
  }

  CourseItem? get _continueCourse {
    final enrolled = _yourCourses.where((c) => c.progress > 0 && c.progress < 1);
    return enrolled.isNotEmpty ? enrolled.first : null;
  }

  void _openCourse(CourseItem course, {bool learn = false}) {
    CourseNavigator.open(
      context,
      courseId: course.id,
      mode: learn ? CourseOpenMode.learn : CourseOpenMode.browse,
    );
  }

  @override
  void dispose() {
    CourseModule.repository.removeListener(_onCoursesChanged);
    CartController.instance.removeListener(_onCartChanged);
    PostStore.instance.removeListener(_onCartChanged);
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
                    onTap: () => openCart(context),
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
            icon: Icons.settings_outlined,
            onTap: () => openSettings(context),
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
          ListenableBuilder(
            listenable: StreakController.instance,
            builder: (context, _) {
              final streak = StreakController.instance.streakDays;
              return Container(
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
                      '$streak',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: AppColors.accent,
                      ),
                    ),
                  ],
                ),
              );
            },
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
                  onTap: () => _openCourse(continueCourse, learn: true),
                ),
                const SizedBox(height: AppSpacing.lg),
              ],
              YourCoursesSection(
                courses: _yourCourses,
                onCourseTap: (course) => _openCourse(course, learn: true),
              ),
              const SizedBox(height: AppSpacing.lg),
              HomeCourseCarouselSection(
                title: AppStrings.homePopularCourses,
                courses: previewCourses,
                actionLabel: AppStrings.seeAll,
                onAction: () => openCourseSearch(context),
                onCourseTap: (course) => _openCourse(course),
                showAddToCart: true,
                onAddToCart: _addToCart,
              ),
              const SizedBox(height: AppSpacing.lg),
              HomePostsSection(
                userId: _user?.id,
                role: _user?.role ?? UserRole.user,
              ),
              const SizedBox(height: AppSpacing.xl),
            ],
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final previewCourses = _courses.take(5).toList();

    if (_isLoading) {
      return const SafeArea(
        bottom: false,
        child: HomeScreenSkeleton(),
      );
    }

    return SafeArea(
      bottom: false,
      child: RefreshIndicator(
        onRefresh: _loadSession,
        color: AppColors.primary,
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(child: _buildHeader(previewCourses)),
            SliverPadding(
              padding: EdgeInsets.only(bottom: FloatingNavBar.scrollBottomPadding(context)),
            ),
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
  });

  final IconData icon;
  final VoidCallback onTap;

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
          child: Icon(icon, color: gats.textPrimary, size: 22),
        ),
      ),
    );
  }
}
