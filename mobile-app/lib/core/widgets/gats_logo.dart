import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:gats_academy/core/constants/app_assets.dart';
import 'package:gats_academy/core/theme/app_theme.dart';

/// Biểu tượng GATS chính thức, dùng chung nhận diện với web-app.
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
    final radius = borderRadius ?? size / 2;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: isDark
            ? Colors.white.withValues(alpha: 0.08)
            : AppColors.primary.withValues(alpha: 0.10),
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
      padding: EdgeInsets.all(size * 0.20),
      child: SvgPicture.asset(
        AppAssets.gatsLogoIcon,
        fit: BoxFit.contain,
        semanticsLabel: 'GATS logo',
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
