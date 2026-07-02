import 'package:flutter/material.dart';
import 'package:gats_academy/core/services/cart_controller.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/starry_sky_background.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/data/mock/mock_course_store.dart';
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
  bool _syllabusExpanded = false;
  bool _reviewsExpanded = false;

  @override
  void initState() {
    super.initState();
    CartController.instance.addListener(_onCartChanged);
  }

  @override
  void dispose() {
    CartController.instance.removeListener(_onCartChanged);
    super.dispose();
  }

  void _onCartChanged() => setState(() {});

  String _formatPrice(double price) {
    if (price <= 0) return AppStrings.storeFree;
    final buffer = StringBuffer();
    final str = price.toInt().toString();
    int len = str.length;
    for (int i = 0; i < len; i++) {
      if (i > 0 && (len - i) % 3 == 0) {
        buffer.write('.');
      }
      buffer.write(str[i]);
    }
    buffer.write(' đ');
    return buffer.toString();
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final course = MockCourseStore.instance.courseById(widget.courseId);

    if (course == null) {
      return Scaffold(
        appBar: AppBar(),
        body: Center(child: Text(AppStrings.storeCourseNotFound)),
      );
    }

    final isWishlist = CartController.instance.isInWishlist(course.id);
    final singlePrice = course.price;
    final totalPriceVal = singlePrice * _seats;

    return GatsThemedScaffold(
      body: Stack(
        children: [
          // Scrollable content
          Positioned.fill(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                // 1. Header Cover Image Container
                Stack(
                  children: [
                    Container(
                      height: 280,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: gats.isStarry
                              ? [const Color(0xFF1E293B), const Color(0xFF0F172A)]
                              : [const Color(0xFFE2E8F0), const Color(0xFFCBD5E1)],
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                        ),
                      ),
                      child: Center(
                        child: Icon(
                          course.isFree ? Icons.lightbulb_outline : Icons.workspace_premium_outlined,
                          size: 96,
                          color: course.isFree ? gats.lavenderAccent : AppColors.accent,
                        ),
                      ),
                    ),
                    SafeArea(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            IconButton(
                              icon: Icon(Icons.arrow_back, color: gats.isStarry ? Colors.white : Colors.black87),
                              onPressed: () => Navigator.pop(context),
                            ),
                            IconButton(
                              icon: Icon(Icons.share_outlined, color: gats.isStarry ? Colors.white : Colors.black87),
                              onPressed: () {},
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),

                // 2. Details Pane (White background, rounded top corners)
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
                        // Title & Wishlist Button
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    course.tag.toUpperCase(),
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w800,
                                      color: AppColors.accent,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    course.title,
                                    style: AppTypography.style(
                                      fontSize: 22,
                                      fontWeight: FontWeight.w800,
                                      color: gats.textPrimary,
                                      height: 1.25,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 12),
                            IconButton(
                              icon: Icon(
                                isWishlist ? Icons.favorite : Icons.favorite_border,
                                color: isWishlist ? Colors.red : Colors.grey,
                                size: 28,
                              ),
                              onPressed: () => CartController.instance.toggleWishlist(course.id),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),

                        // Stats & Duration
                        Row(
                          children: [
                            const Icon(Icons.star_rounded, color: Colors.amber, size: 16),
                            const SizedBox(width: 4),
                            Text(
                              '4.8 ${AppStrings.storeReviewsCount.replaceFirst('%d', '120')}',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: gats.textPrimary,
                              ),
                            ),
                            const SizedBox(width: 16),
                            const Icon(Icons.access_time_rounded, color: Colors.grey, size: 14),
                            const SizedBox(width: 4),
                            Text(
                              AppStrings.storeHoursOfLearning.replaceFirst('%d', '${course.durationMinutes ~/ 60}'),
                              style: TextStyle(fontSize: 13, color: gats.textSecondary),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),

                        // Seats licensing quantity selector & Price side-by-side
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            // Seats selector (- 1 +)
                            Row(
                              children: [
                                GestureDetector(
                                  onTap: () {
                                    if (_seats > 1) {
                                      setState(() => _seats--);
                                    }
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      border: Border.all(color: gats.divider),
                                      borderRadius: BorderRadius.circular(10),
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
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      border: Border.all(color: gats.divider),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: const Icon(Icons.add, size: 18),
                                  ),
                                ),
                              ],
                            ),
                            // Price
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  _formatPrice(totalPriceVal),
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.w800,
                                    color: gats.lavenderAccent,
                                  ),
                                ),
                                if (_seats > 1)
                                  Text(
                                    '(${_formatPrice(singlePrice)} / slot)',
                                    style: TextStyle(fontSize: 11, color: gats.textSecondary),
                                  ),
                              ],
                            ),
                          ],
                        ),
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
                            children: course.lectures.map((l) {
                              return Padding(
                                padding: const EdgeInsets.symmetric(vertical: 8),
                                child: Row(
                                  children: [
                                    Icon(Icons.play_circle_outline, color: gats.lavenderAccent, size: 18),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Text(
                                        l.title,
                                        style: TextStyle(fontSize: 13, color: gats.textPrimary, fontWeight: FontWeight.w600),
                                      ),
                                    ),
                                    Text(
                                      '${l.durationMinutes}m',
                                      style: TextStyle(fontSize: 12, color: gats.textSecondary),
                                    ),
                                  ],
                                ),
                              );
                            }).toList(),
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

          // Sticky Bottom Checkout Button
          Positioned(
            left: 24,
            right: 24,
            bottom: 24,
            child: FilledButton(
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.accent,
                foregroundColor: Colors.white,
                minimumSize: const Size.fromHeight(54),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(27)),
                elevation: 4,
              ),
              onPressed: () {
                CartController.instance.addToCart(course.id, quantity: _seats);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      AppStrings.storeAddedSeatsToCart
                          .replaceFirst('%d', '$_seats')
                          .replaceFirst('%s', course.title),
                    ),
                    action: SnackBarAction(
                      label: AppStrings.storeViewCart,
                      textColor: AppColors.accent,
                      onPressed: () => Navigator.of(context).push(
                        MaterialPageRoute<void>(builder: (_) => const CartScreen()),
                      ),
                    ),
                  ),
                );
              },
              child: Text(
                AppStrings.storeAddToCart,
                style: AppTypography.style(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                ),
              ),
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
