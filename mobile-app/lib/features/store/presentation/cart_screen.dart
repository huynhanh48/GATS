import 'package:flutter/material.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/services/cart_controller.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/starry_sky_background.dart';
import 'package:gats_academy/core/widgets/section_card.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/data/mock/mock_course_store.dart';
import 'package:gats_academy/features/store/presentation/widgets/checkout_success_dialog.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
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

  Future<void> _performCheckout() async {
    final user = await AuthPrefs.currentUser();
    final userId = user?.id ?? 'mock_user';
    
    if (!mounted) return;
    
    // Show success dialog which handles checkout internal logic and Confetti
    showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (context) => CheckoutSuccessDialog(userId: userId),
    );
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final cartItems = CartController.instance.items;

    return GatsThemedScaffold(
      appBar: AppBar(
        backgroundColor: gats.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          AppStrings.cartTitle,
          style: AppTypography.style(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: gats.textPrimary,
          ),
        ),
      ),
      body: cartItems.isEmpty
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: EmptyState(
                  icon: Icons.shopping_basket_outlined,
                  title: AppStrings.cartEmptyTitle,
                  description: AppStrings.cartEmptyDesc,
                  action: FilledButton(
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                    ),
                    onPressed: () => Navigator.pop(context),
                    child: Text(AppStrings.cartContinueShopping),
                  ),
                ),
              ),
            )
          : Stack(
              children: [
                // Scrollable cart items list
                Positioned.fill(
                  child: ListView.separated(
                    padding: const EdgeInsets.fromLTRB(24, 12, 24, 110),
                    itemCount: cartItems.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final courseId = cartItems.keys.elementAt(index);
                      final quantity = cartItems[courseId]!;
                      final course = MockCourseStore.instance.courseById(courseId);

                      if (course == null) return const SizedBox.shrink();

                      final singlePrice = course.price;
                      final totalItemPrice = singlePrice * quantity;

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

                            // Course Title, Tag & Slots details
                            Expanded(
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
                                  const SizedBox(height: 8),

                                  // Slot controller (- 1 +)
                                  Row(
                                    children: [
                                      GestureDetector(
                                        onTap: () {
                                          CartController.instance.updateQuantity(courseId, quantity - 1);
                                        },
                                        child: Container(
                                          padding: const EdgeInsets.all(4),
                                          decoration: BoxDecoration(
                                            border: Border.all(color: gats.divider),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: const Icon(Icons.remove, size: 14),
                                        ),
                                      ),
                                      Padding(
                                        padding: const EdgeInsets.symmetric(horizontal: 12),
                                        child: Text(
                                          '$quantity',
                                          style: AppTypography.style(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w800,
                                            color: gats.textPrimary,
                                          ),
                                        ),
                                      ),
                                      GestureDetector(
                                        onTap: () {
                                          CartController.instance.updateQuantity(courseId, quantity + 1);
                                        },
                                        child: Container(
                                          padding: const EdgeInsets.all(4),
                                          decoration: BoxDecoration(
                                            border: Border.all(color: gats.divider),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: const Icon(Icons.add, size: 14),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),

                            // Total Price & Close Icon
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                IconButton(
                                  icon: Icon(Icons.close, color: gats.textSecondary, size: 18),
                                  onPressed: () => CartController.instance.removeFromCart(courseId),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  _formatPrice(totalItemPrice),
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w800,
                                    color: gats.lavenderAccent,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),

                // Sticky Bottom Checkout Actions
                Positioned(
                  left: 0,
                  right: 0,
                  bottom: 0,
                  child: Container(
                    decoration: BoxDecoration(
                      color: gats.surface,
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.05),
                          blurRadius: 10,
                          offset: const Offset(0, -4),
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                    child: SafeArea(
                      top: false,
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                AppStrings.cartTotal,
                                style: AppTypography.style(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                  color: gats.textSecondary,
                                ),
                              ),
                              Text(
                                _formatPrice(CartController.instance.totalPrice),
                                style: TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.w800,
                                  color: gats.lavenderAccent,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          FilledButton(
                            style: FilledButton.styleFrom(
                              backgroundColor: AppColors.accent,
                              foregroundColor: Colors.white,
                              minimumSize: const Size.fromHeight(50),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
                            ),
                            onPressed: _performCheckout,
                            child: Text(
                              AppStrings.cartCheckout,
                              style: AppTypography.style(
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}
