import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/app_theme.dart';

class AuthSegmentedTabs extends StatelessWidget {
  const AuthSegmentedTabs({
    super.key,
    required this.isLogin,
    required this.signInLabel,
    required this.signUpLabel,
    required this.onChanged,
    this.enabled = true,
  });

  final bool isLogin;
  final String signInLabel;
  final String signUpLabel;
  final ValueChanged<bool> onChanged;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(AppRadius.pill),
        border: Border.all(color: AppColors.divider),
      ),
      child: Row(
        children: [
          Expanded(
            child: _TabChip(
              label: signInLabel,
              selected: isLogin,
              onTap: enabled && !isLogin ? () => onChanged(true) : null,
            ),
          ),
          Expanded(
            child: _TabChip(
              label: signUpLabel,
              selected: !isLogin,
              onTap: enabled && isLogin ? () => onChanged(false) : null,
            ),
          ),
        ],
      ),
    );
  }
}

class _TabChip extends StatelessWidget {
  const _TabChip({
    required this.label,
    required this.selected,
    this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? AppColors.surface : Colors.transparent,
      borderRadius: BorderRadius.circular(AppRadius.pill),
      elevation: selected ? 1 : 0,
      shadowColor: AppColors.primary.withValues(alpha: 0.08),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.pill),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.labelLarge?.copyWith(
                  fontWeight: selected ? FontWeight.w800 : FontWeight.w500,
                  color: selected ? AppColors.primary : AppColors.textSecondary,
                ),
          ),
        ),
      ),
    );
  }
}
