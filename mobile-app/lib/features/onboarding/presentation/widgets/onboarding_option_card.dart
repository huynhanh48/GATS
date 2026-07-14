import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gats_academy/core/theme/app_theme.dart';

class OnboardingOptionCard extends StatelessWidget {
  const OnboardingOptionCard({
    super.key,
    this.icon,
    required this.title,
    this.subtitle,
    this.leading,
    this.leadingBackgroundColor,
    required this.isSelected,
    required this.onTap,
  }) : assert(icon != null || leading != null);

  final IconData? icon;
  final String title;
  final String? subtitle;
  final Widget? leading;
  final Color? leadingBackgroundColor;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return AnimatedScale(
      scale: isSelected ? 1.02 : 1.0,
      alignment: Alignment.center,
      duration: const Duration(milliseconds: 200),
      curve: Curves.easeOutCubic,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            HapticFeedback.lightImpact();
            onTap();
          },
          borderRadius: BorderRadius.circular(AppRadius.md),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 250),
            curve: Curves.easeOutCubic,
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: isSelected ? AppColors.primary.withValues(alpha: 0.08) : AppColors.surface,
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border.all(
                color: isSelected ? AppColors.primary : AppColors.divider,
                width: 2,
              ),
              boxShadow: isSelected ? AppShadows.card : null,
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                _buildLeading(isSelected),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                      ),
                      if (subtitle != null) ...[
                        const SizedBox(height: 4),
                        Text(subtitle!, style: Theme.of(context).textTheme.bodySmall),
                      ],
                    ],
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Icon(
                  isSelected ? Icons.check_circle_rounded : Icons.circle_outlined,
                  color: isSelected ? AppColors.primary : AppColors.divider,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLeading(bool selected) {
    if (leading != null) {
      return SizedBox(
        width: 48,
        height: 48,
        child: leading,
      );
    }

    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        color: leadingBackgroundColor ??
            (selected ? AppColors.primary.withValues(alpha: 0.15) : AppColors.background),
        borderRadius: BorderRadius.circular(AppRadius.sm),
      ),
      child: Center(
        child: Icon(
          icon!,
          color: selected ? AppColors.primary : AppColors.textSecondary,
        ),
      ),
    );
  }
}
