import 'package:flutter/material.dart';
import 'package:gats_academy/core/services/cart_controller.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/starry_sky_background.dart';
import 'package:gats_academy/core/widgets/section_card.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/utils/price_formatter.dart';
import 'package:gats_academy/data/mock/mock_course_store.dart';
import 'package:gats_academy/features/store/presentation/course_store_detail_screen.dart';

class WishlistScreen extends StatefulWidget {
  const WishlistScreen({super.key});

  @override
  State<WishlistScreen> createState() => _WishlistScreenState();
}

class _WishlistScreenState extends State<WishlistScreen> {
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

  void _addAllToCart(Set<String> wishItems) {
    for (final courseId in wishItems) {
      CartController.instance.addToCart(courseId, quantity: 1);
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(AppStrings.wishlistAllAdded)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final wishlist = CartController.instance.wishlist;

    return GatsThemedScaffold(
      appBar: AppBar(
        backgroundColor: gats.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          AppStrings.wishlistTitle,
          style: AppTypography.style(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: gats.textPrimary,
          ),
        ),
      ),
      body: wishlist.isEmpty
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: EmptyState(
                  icon: Icons.favorite_border_rounded,
                  title: AppStrings.wishlistEmptyTitle,
                  description: AppStrings.wishlistEmptyDesc,
                  action: FilledButton(
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                    ),
                    onPressed: () => Navigator.pop(context),
                    child: Text(AppStrings.quickActionStore),
                  ),
                ),
              ),
            )
          : Stack(
              children: [
                Positioned.fill(
                  child: ListView.separated(
                    padding: const EdgeInsets.fromLTRB(24, 12, 24, 100),
                    itemCount: wishlist.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final courseId = wishlist.elementAt(index);
                      final course = MockCourseStore.instance.courseById(courseId);

                      if (course == null) return const SizedBox.shrink();

                      return Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: gats.surface,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: AppShadows.card,
                          border: Border.all(color: gats.divider.withValues(alpha: 0.5)),
                        ),
                        child: Row(
                          children: [
                            // Cover Icon
                            Container(
                              width: 64,
                              height: 64,
                              decoration: BoxDecoration(
                                gradient: AppGradients.cardSoft,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(
                                course.isFree ? Icons.lightbulb_outline : Icons.workspace_premium_outlined,
                                color: course.isFree ? gats.lavenderAccent : AppColors.accent,
                                size: 28,
                              ),
                            ),
                            const SizedBox(width: 14),

                            // Details
                            Expanded(
                              child: InkWell(
                                onTap: () => Navigator.of(context).push(
                                  MaterialPageRoute<void>(
                                    builder: (_) => CourseStoreDetailScreen(courseId: courseId),
                                  ),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      course.title,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: AppTypography.style(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w800,
                                        color: gats.textPrimary,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
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
                                      formatVndPrice(course.price),
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w800,
                                        color: gats.lavenderAccent,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),

                            // Delete / Arrow Action
                            Row(
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.close, color: Colors.grey, size: 18),
                                  onPressed: () => CartController.instance.toggleWishlist(courseId),
                                ),
                                Icon(Icons.chevron_right, color: gats.textSecondary),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),

                // Sticky Bottom Add All Button
                Positioned(
                  left: 24,
                  right: 24,
                  bottom: 24,
                  child: FilledButton(
                    style: FilledButton.styleFrom(
                      backgroundColor: gats.lavenderAccent,
                      foregroundColor: gats.isStarry ? AppColors.nightSkyBottom : Colors.white,
                      minimumSize: const Size.fromHeight(54),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(27)),
                      elevation: 4,
                    ),
                    onPressed: () => _addAllToCart(wishlist),
                    child: Text(
                      AppStrings.wishlistAddAll,
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
}
