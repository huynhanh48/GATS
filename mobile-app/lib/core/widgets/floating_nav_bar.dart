import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/app_theme.dart';

class FloatingNavDestination {
  FloatingNavDestination({
    required this.icon,
    required this.selectedIcon,
    required this.label,
    this.badgeLabel,
  });

  final IconData icon;
  final IconData selectedIcon;
  final String label;
  final String? badgeLabel;
}

/// Bottom nav dạng pill nổi — icon + label, item chọn có nền oval xám nhạt.
class FloatingNavBar extends StatelessWidget {
  const FloatingNavBar({
    super.key,
    required this.selectedIndex,
    required this.onDestinationSelected,
    required this.destinations,
    this.centerAction,
  });

  final int selectedIndex;
  final ValueChanged<int> onDestinationSelected;
  final List<FloatingNavDestination> destinations;
  final Widget? centerAction;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final bottomInset = MediaQuery.paddingOf(context).bottom;
    final useCenter = centerAction != null && destinations.length >= 2;
    final half = useCenter ? destinations.length ~/ 2 : destinations.length;

    final navContent = Padding(
      padding: EdgeInsets.fromLTRB(
        AppSpacing.sm,
        useCenter ? AppSpacing.lg + AppSpacing.sm : AppSpacing.sm,
        AppSpacing.sm,
        AppSpacing.sm,
      ),
      child: Row(
        children: [
          for (var i = 0; i < (useCenter ? half : destinations.length); i++)
            Expanded(
                    child: _FloatingNavItem(
                        destination: destinations[i],
                        selected: selectedIndex == i,
                        onTap: () => onDestinationSelected(i),
                        selectedFill: gats.navSelectedFill,
                        textColor: gats.textPrimary,
                      ),
            ),
          if (useCenter) const SizedBox(width: 52),
          if (useCenter)
            for (var i = half; i < destinations.length; i++)
              Expanded(
                    child: _FloatingNavItem(
                        destination: destinations[i],
                        selected: selectedIndex == i,
                        onTap: () => onDestinationSelected(i),
                        selectedFill: gats.navSelectedFill,
                        textColor: gats.textPrimary,
                      ),
              ),
        ],
      ),
    );

    return Padding(
      padding: EdgeInsets.fromLTRB(AppSpacing.lg, 0, AppSpacing.lg, bottomInset + AppSpacing.md),
      child: useCenter
          ? Stack(
              clipBehavior: Clip.none,
              alignment: Alignment.topCenter,
              children: [
                Material(
                  color: gats.surface.withValues(alpha: gats.isStarry ? 0.92 : 1),
                  elevation: 12,
                  shadowColor: gats.textPrimary.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(AppRadius.pill),
                  child: navContent,
                ),
                Positioned(top: -6, child: centerAction!),
              ],
            )
          : Material(
              color: gats.surface.withValues(alpha: gats.isStarry ? 0.92 : 1),
              elevation: 12,
              shadowColor: gats.textPrimary.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(AppRadius.pill),
              child: navContent,
            ),
    );
  }
}

/// Nút cam giữa thanh nav — bo góc, sát pill.
class FloatingNavCenterButton extends StatelessWidget {
  const FloatingNavCenterButton({
    super.key,
    required this.onPressed,
  });

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.accent,
      elevation: 6,
      shadowColor: AppColors.accent.withValues(alpha: 0.35),
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(16),
        child: const SizedBox(
          width: 48,
          height: 48,
          child: Icon(Icons.bolt_rounded, color: Colors.white, size: 26),
        ),
      ),
    );
  }
}

class _FloatingNavItem extends StatelessWidget {
  const _FloatingNavItem({
    required this.destination,
    required this.selected,
    required this.onTap,
    required this.selectedFill,
    required this.textColor,
  });

  final FloatingNavDestination destination;
  final bool selected;
  final VoidCallback onTap;
  final Color selectedFill;
  final Color textColor;

  @override
  Widget build(BuildContext context) {
    final icon = selected ? destination.selectedIcon : destination.icon;
    final labelStyle = AppTypography.style(
      fontSize: 11,
      fontWeight: FontWeight.w600,
      color: textColor,
      height: 1.1,
    );

    final iconWidget = destination.badgeLabel != null
        ? Badge(
            label: Text(destination.badgeLabel!, style: const TextStyle(fontSize: 10)),
            backgroundColor: AppColors.accent,
            child: Icon(icon, size: 22, color: textColor),
          )
        : Icon(icon, size: 22, color: textColor);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.pill),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOutCubic,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.sm),
          decoration: BoxDecoration(
            color: selected ? selectedFill : Colors.transparent,
            borderRadius: BorderRadius.circular(AppRadius.pill),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              iconWidget,
              const SizedBox(height: AppSpacing.xs),
              Text(
                destination.label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: labelStyle,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
