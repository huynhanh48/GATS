import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/course_cover_assets.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/utils/media_url.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';

/// Banner đầu màn preview khóa — ảnh bìa + app bar overlay (back / yêu thích).
class CourseHeroHeader extends StatelessWidget {
  const CourseHeroHeader({
    super.key,
    required this.course,
    this.onBack,
    this.isWishlisted = false,
    this.onToggleWishlist,
    this.bannerHeight = 200,
  });

  final AppCourse course;
  final VoidCallback? onBack;
  final bool isWishlisted;
  final VoidCallback? onToggleWishlist;
  final double bannerHeight;

  @override
  Widget build(BuildContext context) {
    final topInset = MediaQuery.paddingOf(context).top;
    final height = bannerHeight + topInset;
    final thumb = MediaUrl.resolve(course.thumbnailUrl);
    final assetPath = CourseCoverAssets.pathForSeed(course.id.hashCode);

    return SizedBox(
      height: height,
      width: double.infinity,
      child: Stack(
        fit: StackFit.expand,
        children: [
          Image(
            image: (thumb != null && thumb.isNotEmpty)
                ? NetworkImage(thumb) as ImageProvider
                : AssetImage(assetPath),
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) {
              return Image.asset(
                assetPath,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: AppGradients.courseCover(course.id.hashCode),
                    ),
                  );
                },
              );
            },
          ),
          DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                stops: const [0, 0.45, 1],
                colors: [
                  Colors.black.withValues(alpha: 0.55),
                  Colors.black.withValues(alpha: 0.18),
                  Colors.black.withValues(alpha: 0.06),
                ],
              ),
            ),
          ),
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              bottom: false,
              child: SizedBox(
                height: kToolbarHeight,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
                  child: Row(
                    children: [
                      if (onBack != null)
                        _HeroOverlayButton(
                          icon: Icons.arrow_back_rounded,
                          onPressed: onBack,
                        )
                      else
                        const SizedBox(width: 40),
                      const Spacer(),
                      if (onToggleWishlist != null)
                        _HeroOverlayButton(
                          icon: isWishlisted ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                          iconColor: isWishlisted ? const Color(0xFFFF6B6B) : Colors.white,
                          onPressed: onToggleWishlist,
                        ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _HeroOverlayButton extends StatelessWidget {
  const _HeroOverlayButton({
    required this.icon,
    required this.onPressed,
    this.iconColor = Colors.white,
  });

  final IconData icon;
  final VoidCallback? onPressed;
  final Color iconColor;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.black.withValues(alpha: 0.42),
      shape: const CircleBorder(),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onPressed,
        customBorder: const CircleBorder(),
        child: SizedBox(
          width: 40,
          height: 40,
          child: Icon(icon, color: iconColor, size: 22),
        ),
      ),
    );
  }
}
