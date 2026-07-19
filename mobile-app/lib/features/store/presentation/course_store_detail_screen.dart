import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gats_academy/core/navigation/gats_main_navigator.dart';
import 'package:gats_academy/core/navigation/root_navigator.dart';
import 'package:gats_academy/core/services/gats_notification_service.dart';
import 'package:gats_academy/core/services/cart_controller.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/utils/price_formatter.dart';
import 'package:gats_academy/core/widgets/starry_sky_background.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/data/api/course_api_service.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/features/course/course_module.dart';
import 'package:gats_academy/features/course/presentation/course_detail_screen.dart';
import 'package:gats_academy/features/course/presentation/widgets/course_action_bar.dart';
import 'package:gats_academy/features/course/presentation/widgets/course_hero_header.dart';
import 'package:gats_academy/features/course/presentation/widgets/course_meta_row.dart';
import 'package:gats_academy/features/store/presentation/cart_screen.dart';

class CourseStoreDetailScreen extends StatefulWidget {
  const CourseStoreDetailScreen({super.key, required this.courseId});

  final String courseId;

  @override
  State<CourseStoreDetailScreen> createState() => _CourseStoreDetailScreenState();
}

class _CourseStoreDetailScreenState extends State<CourseStoreDetailScreen> {
  int _seats = 1;
  bool _descExpanded = true;
  bool _syllabusExpanded = true;
  bool _reviewsExpanded = false;
  String? _userId;
  UserRole _role = UserRole.user;
  bool _owned = false;

  @override
  void initState() {
    super.initState();
    _loadUser();
    CartController.instance.addListener(_onCartChanged);
    CourseModule.repository.addListener(_onCartChanged);
  }

  Future<void> _loadUser() async {
    final user = await AuthPrefs.currentUser();
    if (!mounted) return;
    setState(() {
      _userId = user?.id;
      _role = user?.role ?? UserRole.user;
      _owned = CourseModule.repository.isOwned(widget.courseId, _userId, role: _role);
    });
  }

  @override
  void dispose() {
    CartController.instance.removeListener(_onCartChanged);
    CourseModule.repository.removeListener(_onCartChanged);
    super.dispose();
  }

  void _onCartChanged() {
    if (!mounted) return;
    setState(() {
      _owned = CourseModule.repository.isOwned(widget.courseId, _userId, role: _role);
    });
  }

  Future<void> _enrollFree(AppCourse course) async {
    final userId = _userId;
    if (userId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(AppStrings.courseLoginToEnroll)),
      );
      return;
    }

    // 1. Cập nhật local cache ngay để UI phản hồi nhanh
    CourseModule.repository.enroll(course.id, userId);

    // 2. Gọi API BE
    try {
      final token = await AuthPrefs.accessToken();
      if (token != null) {
        await CourseApiService.enrollFree(
          courseId: course.id,
          token: token,
        );
      }
    } catch (e) {
      // Đã enroll rồi hoặc lỗi khác — giữ local update vừa thực hiện
      debugPrint('enrollFree API error (ignored): $e');
    }

    if (!mounted) return;
    GatsMainNavigator.pushReplacement<void, void>(
      context,
      CourseDetailScreen(courseId: course.id),
    );
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final course = CourseModule.repository.getCourse(widget.courseId);

    if (course == null) {
      return GatsThemedScaffold(
        appBar: AppBar(),
        body: Center(child: Text(AppStrings.storeCourseNotFound)),
      );
    }

    final isWishlist = CartController.instance.isInWishlist(course.id);
    final singlePrice = course.effectivePrice;
    final totalPriceVal = singlePrice * _seats;

    return GatsThemedScaffold(
      body: Stack(
        children: [
          // Scrollable content
          Positioned.fill(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                CourseHeroHeader(
                  course: course,
                  onBack: () => Navigator.pop(context),
                  isWishlisted: isWishlist,
                  onToggleWishlist: () => CartController.instance.toggleWishlist(course.id),
                ),

                Transform.translate(
                  offset: const Offset(0, -20),
                  child: Container(
                    decoration: BoxDecoration(
                      color: gats.surface,
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                    ),
                    padding: const EdgeInsets.fromLTRB(24, 28, 24, 100),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          course.title,
                          style: AppTypography.style(
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                            color: gats.textPrimary,
                            height: 1.25,
                          ),
                        ),
                        const SizedBox(height: 12),
                        CourseMetaRow(course: course, reviewCount: 120),
                        if (!_owned && !course.isFree) ...[
                          const SizedBox(height: 24),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  GestureDetector(
                                    onTap: () {
                                      if (_seats > 1) {
                                        setState(() => _seats--);
                                        HapticFeedback.selectionClick();
                                      }
                                    },
                                    child: Container(
                                      width: 44,
                                      height: 44,
                                      decoration: BoxDecoration(
                                        border: Border.all(color: gats.divider),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: const Icon(Icons.remove, size: 18),
                                    ),
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.symmetric(horizontal: 16),
                                    child: Text(
                                      '$_seats',
                                      style: AppTypography.style(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w800,
                                        color: gats.textPrimary,
                                      ),
                                    ),
                                  ),
                                  GestureDetector(
                                    onTap: () {
                                      setState(() => _seats++);
                                      HapticFeedback.selectionClick();
                                    },
                                    child: Container(
                                      width: 44,
                                      height: 44,
                                      decoration: BoxDecoration(
                                        border: Border.all(color: gats.divider),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: const Icon(Icons.add, size: 18),
                                    ),
                                  ),
                                ],
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    formatVndPrice(totalPriceVal),
                                    style: TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.w800,
                                      color: gats.lavenderAccent,
                                    ),
                                  ),
                                  if (_seats > 1)
                                    Text(
                                      '(${formatVndPrice(singlePrice)} / slot)',
                                      style: TextStyle(fontSize: 11, color: gats.textSecondary),
                                    ),
                                ],
                              ),
                            ],
                          ),
                        ],
                        const Divider(height: 40),

                        // 3. Expandable Panels (Accordions)
                        // Course Description Panel
                        _buildAccordion(
                          title: AppStrings.storeCourseDetailTitle,
                          isExpanded: _descExpanded,
                          onTap: () => setState(() => _descExpanded = !_descExpanded),
                          content: Text(
                            course.description,
                            style: AppTypography.style(
                              fontSize: 14,
                              color: gats.textSecondary,
                              height: 1.5,
                            ),
                          ),
                        ),
                        const Divider(height: 1),

                        // Syllabus / Curriculum Panel
                        _buildAccordion(
                          title: AppStrings.storeSyllabusTitle.replaceFirst('%d', '${course.lectures.length}'),
                          isExpanded: _syllabusExpanded,
                          onTap: () => setState(() => _syllabusExpanded = !_syllabusExpanded),
                          content: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              if (!_owned)
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 12),
                                  child: Text(
                                    AppStrings.storeSyllabusPreviewNote,
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: gats.textSecondary,
                                      height: 1.4,
                                    ),
                                  ),
                                ),
                              ...course.lectures.asMap().entries.map((entry) {
                                final index = entry.key;
                                final l = entry.value;
                                final isPreview = !_owned && index == 0;
                                final isLocked = !_owned && index > 0;
                                return Padding(
                                  padding: const EdgeInsets.symmetric(vertical: 8),
                                  child: Row(
                                    children: [
                                      Icon(
                                        isLocked
                                            ? Icons.lock_outline
                                            : Icons.play_circle_outline,
                                        color: isLocked
                                            ? gats.textSecondary
                                            : gats.lavenderAccent,
                                        size: 18,
                                      ),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: Text(
                                          l.title,
                                          style: TextStyle(
                                            fontSize: 13,
                                            color: isLocked ? gats.textSecondary : gats.textPrimary,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                      ),
                                      if (isPreview)
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: gats.lavenderAccent.withValues(alpha: 0.12),
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          child: Text(
                                            AppStrings.storeLecturePreview,
                                            style: TextStyle(
                                              fontSize: 10,
                                              fontWeight: FontWeight.w700,
                                              color: gats.lavenderAccent,
                                            ),
                                          ),
                                        ),
                                      if (!isPreview) ...[
                                        const SizedBox(width: 8),
                                        Text(
                                          '${l.durationMinutes}m',
                                          style: TextStyle(fontSize: 12, color: gats.textSecondary),
                                        ),
                                      ],
                                    ],
                                  ),
                                );
                              }),
                            ],
                          ),
                        ),
                        const Divider(height: 1),

                        // Student Reviews Panel
                        _buildAccordion(
                          title: AppStrings.storeReviewsTitle,
                          isExpanded: _reviewsExpanded,
                          onTap: () => setState(() => _reviewsExpanded = !_reviewsExpanded),
                          content: Column(
                            children: [
                              _buildMockReview(name: 'Nguyễn Văn A', rating: 5, comment: 'Khóa học cực kì hữu ích và thực tế!'),
                              _buildMockReview(name: 'Trần Thị B', rating: 4, comment: 'Rất đáng tiền, giảng viên giải thích chi tiết.'),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: CourseActionBar(
              course: course,
              isEnrolled: _owned,
              priceLabel: formatVndPrice(totalPriceVal),
              onContinue: () => GatsMainNavigator.pushReplacement<void, void>(
                context,
                CourseDetailScreen(courseId: course.id),
              ),
              onEnrollFree: () => _enrollFree(course),
              onAddToCart: () {
                CartController.instance.addToCart(course.id, quantity: _seats);
                GatsNotificationService.showInApp(
                  message: AppStrings.storeAddedSeatsToCart
                      .replaceFirst('%d', '$_seats')
                      .replaceFirst('%s', course.title),
                  actionLabel: AppStrings.storeViewCart,
                  onAction: () {
                    final ctx = rootNavigatorKey.currentContext;
                    if (ctx != null) openCart(ctx);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAccordion({
    required String title,
    required bool isExpanded,
    required VoidCallback onTap,
    required Widget content,
  }) {
    final gats = context.gatsColors;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        InkWell(
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  title,
                  style: AppTypography.style(
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    color: gats.textPrimary,
                  ),
                ),
                Icon(
                  isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                  color: gats.textSecondary,
                ),
              ],
            ),
          ),
        ),
        if (isExpanded)
          Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: content,
          ),
      ],
    );
  }

  Widget _buildMockReview({
    required String name,
    required int rating,
    required String comment,
  }) {
    final gats = context.gatsColors;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                name,
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: gats.textPrimary),
              ),
              const Spacer(),
              Row(
                children: List.generate(5, (idx) {
                  return Icon(
                    Icons.star_rounded,
                    color: idx < rating ? Colors.amber : (gats.isStarry ? Colors.white24 : Colors.grey[300]),
                    size: 12,
                  );
                }),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            comment,
            style: TextStyle(fontSize: 12, color: gats.textSecondary),
          ),
        ],
      ),
    );
  }
}
