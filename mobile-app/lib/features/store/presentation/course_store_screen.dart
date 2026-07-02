import 'dart:async';
import 'package:flutter/material.dart';
import 'package:gats_academy/core/services/cart_controller.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/starry_sky_background.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/data/mock/mock_course_store.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';
import 'package:gats_academy/features/store/presentation/cart_screen.dart';
import 'package:gats_academy/features/store/presentation/course_store_detail_screen.dart';
import 'package:gats_academy/features/store/presentation/wishlist_screen.dart';

class CourseStoreScreen extends StatefulWidget {
  const CourseStoreScreen({super.key, this.embeddedInShell = false});

  /// Khi true: dùng trong MainShell (không bọc Scaffold riêng).
  final bool embeddedInShell;

  @override
  State<CourseStoreScreen> createState() => _CourseStoreScreenState();
}

class _CourseStoreScreenState extends State<CourseStoreScreen> {
  final PageController _promoController = PageController();
  int _currentPromoIndex = 0;
  Timer? _promoTimer;
  String _searchQuery = '';
  String _selectedCategory = 'Tất cả';
  String _selectedLevel = 'Tất cả';

  final List<Map<String, dynamic>> _promos = [
    {
      'title': 'Ưu Đãi Lớn: Giảm 40%!',
      'subtitle': 'Trang bị kỹ năng AI công sở tốt nhất',
      'tag': 'AI Special',
      'colors': [const Color(0xFFFF7622), const Color(0xFFFF4500)],
    },
    {
      'title': 'Flutter Mastery',
      'subtitle': 'Lập trình đa nền tảng từ Zero',
      'colors': [const Color(0xFF0070EB), const Color(0xFF0052B4)],
      'tag': 'Lập trình',
    },
    {
      'title': 'Automation & Workflows',
      'subtitle': 'Tối ưu hóa quy trình làm việc doanh nghiệp',
      'colors': [const Color(0xFF7C3AED), const Color(0xFF5B21B6)],
      'tag': 'Automation',
    },
  ];

  @override
  void initState() {
    super.initState();
    _startPromoTimer();
    MockCourseStore.instance.addListener(_onStoreChanged);
    CartController.instance.addListener(_onCartChanged);
  }

  @override
  void dispose() {
    _promoTimer?.cancel();
    _promoController.dispose();
    MockCourseStore.instance.removeListener(_onStoreChanged);
    CartController.instance.removeListener(_onCartChanged);
    super.dispose();
  }

  void _onStoreChanged() => setState(() {});
  void _onCartChanged() => setState(() {});

  void _startPromoTimer() {
    _promoTimer = Timer.periodic(const Duration(seconds: 4), (timer) {
      if (!mounted) return;
      final nextIndex = (_currentPromoIndex + 1) % _promos.length;
      _promoController.animateToPage(
        nextIndex,
        duration: const Duration(milliseconds: 600),
        curve: Curves.easeInOut,
      );
    });
  }

  List<AppCourse> get _filteredCourses {
    var list = MockCourseStore.instance.publishedCourses();
    
    // Category filter
    if (_selectedCategory != 'Tất cả') {
      list = list.where((c) => c.tag == _selectedCategory).toList();
    }

    // Search query filter
    if (_searchQuery.isNotEmpty) {
      final query = _searchQuery.toLowerCase();
      list = list.where((c) =>
          c.title.toLowerCase().contains(query) ||
          c.description.toLowerCase().contains(query) ||
          c.tag.toLowerCase().contains(query)).toList();
    }

    return list;
  }

  void _openFilterDialog() {
    final gats = context.gatsColors;
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: gats.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        String tempCategory = _selectedCategory;
        String tempLevel = _selectedLevel;

        return StatefulBuilder(
          builder: (context, setModalState) {
            return SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      children: [
                        Text(
                          AppStrings.storeFilterTitle,
                          style: AppTypography.style(
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                            color: gats.textPrimary,
                          ),
                        ),
                        const Spacer(),
                        IconButton(
                          icon: const Icon(Icons.close),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      AppStrings.storeFilterCategory,
                      style: AppTypography.style(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: gats.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        'Tất cả',
                        'AI cho công sở',
                        'Lập trình',
                        'Marketing',
                        'Ngoại ngữ',
                        'Kỹ năng mềm',
                        'Automation',
                      ].map((cat) {
                        final isSelected = tempCategory == cat;
                        return ChoiceChip(
                          label: Text(cat),
                          selected: isSelected,
                          onSelected: (selected) {
                            if (selected) {
                              setModalState(() => tempCategory = cat);
                            }
                          },
                          selectedColor: gats.lavenderAccent.withValues(alpha: 0.12),
                          backgroundColor: gats.background,
                          checkmarkColor: gats.lavenderAccent,
                          labelStyle: AppTypography.style(
                            fontSize: 13,
                            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                            color: isSelected ? gats.lavenderAccent : gats.textSecondary,
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 24),
                    FilledButton(
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.accent,
                        foregroundColor: Colors.white,
                        minimumSize: const Size.fromHeight(50),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
                      ),
                      onPressed: () {
                        setState(() {
                          _selectedCategory = tempCategory;
                          _selectedLevel = tempLevel;
                        });
                        Navigator.pop(context);
                      },
                      child: Text(
                        AppStrings.storeFilterApply,
                        style: AppTypography.style(fontWeight: FontWeight.w700, fontSize: 16),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final courses = _filteredCourses;
    final exclusiveOffers = courses.where((c) => !c.isFree).toList();
    final bestSellers = courses.toList();
    final body = _buildStoreBody(context, gats, exclusiveOffers, bestSellers);

    if (widget.embeddedInShell) return body;

    return GatsThemedScaffold(
      appBar: AppBar(
        backgroundColor: gats.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          AppStrings.storeTitle,
          style: AppTypography.style(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: gats.textPrimary,
          ),
        ),
        actions: [
          AnimatedBuilder(
            animation: CartController.instance,
            builder: (context, _) {
              final wishlistCount = CartController.instance.wishlist.length;
              return Stack(
                clipBehavior: Clip.none,
                children: [
                  IconButton(
                    icon: const Icon(Icons.favorite_border),
                    tooltip: AppStrings.storeWishlistTooltip,
                    onPressed: () => Navigator.of(context).push(
                      MaterialPageRoute<void>(builder: (_) => const WishlistScreen()),
                    ),
                  ),
                  if (wishlistCount > 0)
                    Positioned(
                      top: 4,
                      right: 4,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                        child: Text(
                          '$wishlistCount',
                          style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                ],
              );
            },
          ),
          AnimatedBuilder(
            animation: CartController.instance,
            builder: (context, _) {
              final qty = CartController.instance.totalQuantity;
              return Stack(
                clipBehavior: Clip.none,
                children: [
                  IconButton(
                    icon: const Icon(Icons.shopping_cart_outlined),
                    tooltip: AppStrings.storeCartTooltip,
                    onPressed: () => Navigator.of(context).push(
                      MaterialPageRoute<void>(builder: (_) => const CartScreen()),
                    ),
                  ),
                  if (qty > 0)
                    Positioned(
                      top: 4,
                      right: 4,
                      child: Badge(
                        label: Text('$qty'),
                      ),
                    ),
                ],
              );
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: body,
    );
  }

  Widget _buildStoreBody(
    BuildContext context,
    GatsThemeExtension gats,
    List<AppCourse> exclusiveOffers,
    List<AppCourse> bestSellers,
  ) {
    return ListView(
      padding: const EdgeInsets.symmetric(vertical: 8),
      children: [
        if (widget.embeddedInShell)
          Padding(
            padding: const EdgeInsets.fromLTRB(AppSpacing.lg, 0, AppSpacing.lg, 8),
            child: Align(
              alignment: Alignment.centerRight,
              child: AnimatedBuilder(
                animation: CartController.instance,
                builder: (context, _) {
                  final wishlistCount = CartController.instance.wishlist.length;
                  return IconButton(
                    icon: Badge(
                      isLabelVisible: wishlistCount > 0,
                      label: Text('$wishlistCount'),
                      child: const Icon(Icons.favorite_border),
                    ),
                    tooltip: AppStrings.storeWishlistTooltip,
                    onPressed: () => Navigator.of(context).push(
                      MaterialPageRoute<void>(builder: (_) => const WishlistScreen()),
                    ),
                  );
                },
              ),
            ),
          ),
        // Search & Filter Row
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    height: 48,
                    decoration: BoxDecoration(
                      color: gats.surface,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: AppShadows.card,
                    ),
                    child: TextField(
                      onChanged: (val) => setState(() => _searchQuery = val),
                      decoration: InputDecoration(
                        hintText: AppStrings.storeSearchHint,
                        hintStyle: AppTypography.style(color: gats.textSecondary, fontSize: 14),
                        prefixIcon: Icon(Icons.search, color: gats.textSecondary),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                GestureDetector(
                  onTap: _openFilterDialog,
                  child: Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: gats.surface,
                      shape: BoxShape.circle,
                      boxShadow: AppShadows.card,
                    ),
                    child: Icon(Icons.filter_list_rounded, color: gats.lavenderAccent),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Promo Carousel
          SizedBox(
            height: 125,
            child: PageView.builder(
              controller: _promoController,
              onPageChanged: (i) => setState(() => _currentPromoIndex = i),
              itemCount: _promos.length,
              itemBuilder: (context, index) {
                final promo = _promos[index];
                final colors = promo['colors'] as List<Color>;
                return Container(
                  margin: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(colors: colors),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: AppShadows.elevated,
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.white24,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                promo['tag'] as String,
                                style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              promo['title'] as String,
                              style: AppTypography.style(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              promo['subtitle'] as String,
                              style: AppTypography.style(
                                fontSize: 12,
                                color: Colors.white.withValues(alpha: 0.9),
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.school_outlined, size: 56, color: Colors.white30),
                    ],
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 8),
          // Carousel Indicators
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(_promos.length, (idx) {
              final active = _currentPromoIndex == idx;
              return AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                margin: const EdgeInsets.symmetric(horizontal: 3),
                width: active ? 16 : 6,
                height: 6,
                decoration: BoxDecoration(
                  color: active ? gats.lavenderAccent : gats.divider,
                  borderRadius: BorderRadius.circular(3),
                ),
              );
            }),
          ),
          const SizedBox(height: 20),

          // Exclusive Offers (Paid Courses)
          if (exclusiveOffers.isNotEmpty) ...[
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
              child: Row(
                children: [
                  Text(
                    AppStrings.storeFeatured,
                    style: AppTypography.style(
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                      color: gats.textPrimary,
                    ),
                  ),
                  const Spacer(),
                  Text(
                    AppStrings.storeSeeAll,
                    style: AppTypography.style(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: gats.lavenderAccent,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 220,
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                scrollDirection: Axis.horizontal,
                itemCount: exclusiveOffers.length,
                separatorBuilder: (_, __) => const SizedBox(width: 14),
                itemBuilder: (context, index) {
                  final course = exclusiveOffers[index];
                  return _StoreCourseCard(course: course);
                },
              ),
            ),
            const SizedBox(height: 24),
          ],

          // Best Selling (All courses)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            child: Row(
              children: [
                Text(
                  AppStrings.storeBestSellers,
                  style: AppTypography.style(
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                    color: gats.textPrimary,
                  ),
                ),
                const Spacer(),
                Text(
                  AppStrings.storeSeeAll,
                  style: AppTypography.style(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: gats.lavenderAccent,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 14,
              mainAxisSpacing: 14,
              childAspectRatio: 0.76,
            ),
            itemCount: bestSellers.length,
            itemBuilder: (context, index) {
              final course = bestSellers[index];
              return _StoreCourseCard(course: course);
            },
          ),
        ],
    );
  }
}

class _StoreCourseCard extends StatelessWidget {
  const _StoreCourseCard({required this.course});

  final AppCourse course;

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
    final isWishlist = CartController.instance.isInWishlist(course.id);
    final inCart = CartController.instance.isInCart(course.id);

    return GestureDetector(
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute<void>(
          builder: (_) => CourseStoreDetailScreen(courseId: course.id),
        ),
      ),
      child: Container(
        width: 155,
        decoration: BoxDecoration(
          color: gats.surface,
          borderRadius: BorderRadius.circular(16),
          boxShadow: AppShadows.card,
          border: Border.all(color: gats.divider.withValues(alpha: 0.5)),
        ),
        child: Stack(
          children: [
            // Course Content Layout
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Illustration Cover (SaaS Flat Vector style)
                  Expanded(
                    child: Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        gradient: AppGradients.cardSoft,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        course.isFree ? Icons.lightbulb_outline : Icons.workspace_premium_outlined,
                        size: 40,
                        color: course.isFree ? gats.lavenderAccent : AppColors.accent,
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    course.tag,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: AppColors.accent,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    course.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: AppTypography.style(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      color: gats.textPrimary,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.star_rounded, color: Colors.amber, size: 13),
                      const SizedBox(width: 2),
                      Text(
                        '4.8',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: gats.textPrimary),
                      ),
                      Text(
                        ' (120)',
                        style: TextStyle(fontSize: 9, color: gats.textSecondary),
                      ),
                    ],
                  ),
                  const Spacer(),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _formatPrice(course.price),
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: gats.lavenderAccent,
                        ),
                      ),
                      // Add Button
                      GestureDetector(
                        onTap: () {
                          CartController.instance.addToCart(course.id, quantity: 1);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                AppStrings.storeAddedToCart.replaceFirst('%s', course.title),
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
                        child: Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: inCart ? gats.lavenderAccent.withValues(alpha: 0.12) : gats.lavenderAccent,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            inCart ? Icons.check : Icons.add,
                            color: inCart ? gats.lavenderAccent : Colors.white,
                            size: 16,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            // Wishlist button
            Positioned(
              top: 6,
              right: 6,
              child: GestureDetector(
                onTap: () => CartController.instance.toggleWishlist(course.id),
                child: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: const BoxDecoration(
                    color: Colors.white70,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    isWishlist ? Icons.favorite : Icons.favorite_border,
                    color: isWishlist ? Colors.red : Colors.grey,
                    size: 16,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
