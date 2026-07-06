import 'package:flutter/material.dart';
import 'package:gats_academy/core/services/cart_controller.dart';
import 'package:gats_academy/core/widgets/ted/ted.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';

/// Hàng khóa học ngang — cùng card dọc như Store (155×220).
class HomeCourseCarouselSection extends StatelessWidget {
  const HomeCourseCarouselSection({
    super.key,
    required this.title,
    required this.courses,
    required this.onCourseTap,
    this.actionLabel,
    this.onAction,
    this.showAddToCart = false,
    this.purchased = false,
    this.onAddToCart,
    this.empty,
  });

  static const cardWidth = 155.0;
  static const cardHeight = 220.0;

  final String title;
  final List<CourseItem> courses;
  final ValueChanged<CourseItem> onCourseTap;
  final String? actionLabel;
  final VoidCallback? onAction;
  final bool showAddToCart;
  final bool purchased;
  final ValueChanged<CourseItem>? onAddToCart;
  final Widget? empty;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TedSectionHeader(
          title: title,
          actionLabel: actionLabel,
          onAction: onAction,
        ),
        const SizedBox(height: 12),
        if (courses.isEmpty)
          empty ?? const SizedBox.shrink()
        else
          SizedBox(
            height: cardHeight,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: courses.length,
              separatorBuilder: (_, _) => const SizedBox(width: 14),
              itemBuilder: (context, index) {
                final course = courses[index];
                return SizedBox(
                  width: cardWidth,
                  height: cardHeight,
                  child: AnimatedBuilder(
                    animation: CartController.instance,
                    builder: (context, _) {
                      final owned = purchased || course.isEnrolled;
                      return TedCourseCard(
                        course: course,
                        vertical: true,
                        showProgress: owned,
                        isPurchased: owned,
                        showAddToCart: showAddToCart && !owned,
                        inCart: CartController.instance.isInCart(course.id),
                        onTap: () => onCourseTap(course),
                        onAddToCart: showAddToCart && !owned && onAddToCart != null
                            ? () => onAddToCart!(course)
                            : null,
                      );
                    },
                  ),
                );
              },
            ),
          ),
      ],
    );
  }
}
