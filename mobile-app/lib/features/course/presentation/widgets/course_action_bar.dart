import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/services/cart_controller.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';

enum CourseActionKind {
  continueLearning,
  enrollFree,
  addToCart,
  inCart,
  buyNow,
}

class CourseActionBar extends StatelessWidget {
  const CourseActionBar({
    super.key,
    required this.course,
    required this.isEnrolled,
    this.onContinue,
    this.onEnrollFree,
    this.onAddToCart,
    this.onBuyNow,
    this.priceLabel,
  });

  final AppCourse course;
  final bool isEnrolled;
  final VoidCallback? onContinue;
  final VoidCallback? onEnrollFree;
  final VoidCallback? onAddToCart;
  final VoidCallback? onBuyNow;
  final String? priceLabel;

  CourseActionKind get _kind {
    if (isEnrolled) return CourseActionKind.continueLearning;
    if (course.isFree) return CourseActionKind.enrollFree;
    if (CartController.instance.isInCart(course.id)) return CourseActionKind.inCart;
    return CourseActionKind.addToCart;
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final kind = _kind;

    return Container(
      padding: EdgeInsets.fromLTRB(16, 12, 16, 12 + MediaQuery.paddingOf(context).bottom),
      decoration: BoxDecoration(
        color: gats.surface,
        border: Border(top: BorderSide(color: gats.divider.withValues(alpha: 0.6))),
        boxShadow: gats.isStarry ? null : AppShadows.card,
      ),
      child: Row(
        children: [
          if (priceLabel != null && !isEnrolled && !course.isFree) ...[
            Expanded(
              flex: 2,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    AppStrings.cartTotal,
                    style: TextStyle(fontSize: 12, color: gats.textSecondary),
                  ),
                  Text(
                    priceLabel!,
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: gats.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
          ],
          Expanded(
            flex: 3,
            child: _buildPrimary(context, kind),
          ),
        ],
      ),
    );
  }

  Widget _buildPrimary(BuildContext context, CourseActionKind kind) {
    final gats = context.gatsColors;
    final (label, onPressed) = switch (kind) {
      CourseActionKind.continueLearning => (AppStrings.continueLearning, onContinue),
      CourseActionKind.enrollFree => (AppStrings.courseEnrollFree, onEnrollFree),
      CourseActionKind.inCart => (AppStrings.storeViewCart, null),
      CourseActionKind.addToCart => (AppStrings.storeAddToCart, onAddToCart),
      CourseActionKind.buyNow => (AppStrings.cartCheckout, onBuyNow),
    };

    return FilledButton(
      style: FilledButton.styleFrom(
        backgroundColor: gats.lavenderAccent,
        foregroundColor: gats.isStarry ? AppColors.nightSkyBottom : Colors.white,
        minimumSize: const Size.fromHeight(48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      ),
      onPressed: onPressed,
      child: Text(label, style: const TextStyle(fontWeight: FontWeight.w700)),
    );
  }
}
