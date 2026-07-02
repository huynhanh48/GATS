import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/brand_icon.dart';

/// Nút provider kiểu Brilliant — Apple / Google cạnh nhau.
class AuthProviderButton extends StatelessWidget {
  const AuthProviderButton({
    super.key,
    required this.icon,
    required this.onPressed,
  });

  final Widget icon;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(AppRadius.md),
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: Container(
          height: 56,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(color: AppColors.divider),
          ),
          alignment: Alignment.center,
          child: icon,
        ),
      ),
    );
  }
}

class AuthProviderRow extends StatelessWidget {
  const AuthProviderRow({
    super.key,
    required this.onApple,
    required this.onGoogle,
    this.onMomo,
    this.momoLabel,
    this.enabled = true,
  });

  final VoidCallback? onApple;
  final VoidCallback? onGoogle;
  final VoidCallback? onMomo;
  final String? momoLabel;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: AuthProviderButton(
                onPressed: enabled ? onApple : null,
                icon: const BrandIcon(type: BrandIconType.apple, size: 28),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: AuthProviderButton(
                onPressed: enabled ? onGoogle : null,
                icon: const BrandIcon(type: BrandIconType.google, size: 28),
              ),
            ),
          ],
        ),
        if (onMomo != null) ...[
          const SizedBox(height: AppSpacing.md),
          AuthProviderButton(
            onPressed: enabled ? onMomo : null,
            icon: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const BrandIcon(type: BrandIconType.momo, size: 28),
                if (momoLabel != null) ...[
                  const SizedBox(width: AppSpacing.sm),
                  Text(
                    momoLabel!,
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 16,
                      color: Color(0xFFA50064),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ],
    );
  }
}
