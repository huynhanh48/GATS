import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:gats_academy/core/l10n/l10n.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/brand_icon.dart';

class SocialAuthButtons extends StatelessWidget {
  const SocialAuthButtons({
    super.key,
    required this.onGoogle,
    required this.onApple,
    required this.onMomo,
    this.isLoading = false,
  });

  final VoidCallback? onGoogle;
  final VoidCallback? onApple;
  final VoidCallback? onMomo;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final showMomo = kDebugMode && onMomo != null;

    return Column(
      children: [
        Text(
          l10n.authOrContinueWith,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppColors.textSecondary,
                fontWeight: FontWeight.w500,
              ),
        ),
        const SizedBox(height: AppSpacing.lg),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _SocialCircleButton(
              tooltip: l10n.authGoogle,
              onPressed: isLoading ? null : onGoogle,
              child: const BrandIcon(type: BrandIconType.google, size: 30),
            ),
            const SizedBox(width: AppSpacing.xl),
            _SocialCircleButton(
              tooltip: l10n.authApple,
              onPressed: isLoading ? null : onApple,
              child: const BrandIcon(type: BrandIconType.apple, size: 31),
            ),
            if (showMomo) ...[
              const SizedBox(width: AppSpacing.xl),
              _SocialCircleButton(
                tooltip: l10n.authMomo,
                onPressed: isLoading ? null : onMomo,
                child: const BrandIcon(type: BrandIconType.momo, size: 32),
              ),
            ],
          ],
        ),
      ],
    );
  }
}

class _SocialCircleButton extends StatelessWidget {
  const _SocialCircleButton({
    required this.child,
    required this.tooltip,
    this.onPressed,
  });

  final Widget child;
  final String tooltip;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: Material(
        color: AppColors.surface,
        shape: const CircleBorder(),
        elevation: 2,
        shadowColor: AppColors.primary.withValues(alpha: 0.12),
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: onPressed,
          child: SizedBox(
            width: 56,
            height: 56,
            child: Center(child: child),
          ),
        ),
      ),
    );
  }
}
