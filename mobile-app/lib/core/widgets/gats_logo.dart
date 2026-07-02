import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/app_theme.dart';

/// Biểu tượng GATS — chữ G trên nền gradient brand.
class GatsLogoMark extends StatelessWidget {
  const GatsLogoMark({
    super.key,
    this.size = 52,
    this.borderRadius,
    this.showShadow = true,
  });

  final double size;
  final double? borderRadius;
  final bool showShadow;

  @override
  Widget build(BuildContext context) {
    final radius = borderRadius ?? size * 0.27;

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        gradient: AppGradients.primary,
        borderRadius: BorderRadius.circular(radius),
        boxShadow: showShadow
            ? [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.25),
                  blurRadius: size * 0.23,
                  offset: Offset(0, size * 0.08),
                ),
              ]
            : null,
      ),
      alignment: Alignment.center,
      child: Text(
        'G',
        style: AppTypography.style(
          fontSize: size * 0.52,
          fontWeight: FontWeight.w800,
          color: Colors.white,
          height: 1,
          letterSpacing: -1,
        ),
      ),
    );
  }
}

/// Logo đầy đủ: mark + tên app (+ tagline tùy chọn).
class GatsLogo extends StatelessWidget {
  const GatsLogo({
    super.key,
    this.markSize = 52,
    this.title,
    this.tagline,
    this.titleStyle,
    this.taglineStyle,
    this.alignment = MainAxisAlignment.center,
  });

  final double markSize;
  final String? title;
  final String? tagline;
  final TextStyle? titleStyle;
  final TextStyle? taglineStyle;
  final MainAxisAlignment alignment;

  @override
  Widget build(BuildContext context) {
    final resolvedTitle = title ?? 'GATS Academy';

    return Row(
      mainAxisAlignment: alignment,
      mainAxisSize: MainAxisSize.min,
      children: [
        GatsLogoMark(size: markSize),
        SizedBox(width: markSize * 0.28),
        Flexible(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                resolvedTitle,
                style: titleStyle ??
                    Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w800,
                          color: AppColors.primary,
                          height: 1.1,
                        ),
              ),
              if (tagline != null) ...[
                const SizedBox(height: 2),
                Text(
                  tagline!,
                  style: taglineStyle ??
                      Theme.of(context).textTheme.labelSmall?.copyWith(
                            color: AppColors.textSecondary,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 0.4,
                          ),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}
