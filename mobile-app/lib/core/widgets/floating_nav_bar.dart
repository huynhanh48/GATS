import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/app_theme.dart';

class FloatingNavDestination {
  FloatingNavDestination({
    required this.icon,
    required this.selectedIcon,
    required this.label,
    this.badgeLabel,
    this.badgeTooltip,
  });

  final IconData icon;
  final IconData selectedIcon;
  final String label;
  final String? badgeLabel;
  /// Explains what the badge count means (e.g. remaining daily goals).
  final String? badgeTooltip;
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

  /// Đệm đáy list khi [Scaffold.extendBody] = true (nav nổi che nội dung).
  static double scrollBottomPadding(BuildContext context) {
    final bottomInset = MediaQuery.paddingOf(context).bottom;
    const barBody = 104.0;
    const centerButtonLift = 28.0;
    return bottomInset + AppSpacing.xs + barBody + centerButtonLift + AppSpacing.sm;
  }

  /// Đệm đáy cho ô nhập / widget cố định — chỉ né pill nav (không thêm khoảng FAB giữa).
  static double bodyBottomPadding(BuildContext context) {
    final bottomInset = MediaQuery.paddingOf(context).bottom;
    const navPillHeight = 68.0;
    return bottomInset + AppSpacing.xs + navPillHeight;
  }

  /// Ô chat: mép dưới cách đỉnh nút quick action (⚡) đúng [gap] px.
  static double chatInputBottomPadding(BuildContext context, {double gap = 5}) {
    final bottomInset = MediaQuery.paddingOf(context).bottom;
    const navMaterialHeight = 85.0; // top 24 + item ~53 + bottom 8
    const quickActionTopOffset = 6.0;
    return bottomInset + AppSpacing.xs + navMaterialHeight + quickActionTopOffset - gap;
  }

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
      padding: EdgeInsets.fromLTRB(AppSpacing.lg, 0, AppSpacing.lg, bottomInset + AppSpacing.xs),
      child: useCenter
          ? Stack(
              clipBehavior: Clip.none,
              alignment: Alignment.topCenter,
              children: [
                Material(
                  color: gats.surface.withValues(alpha: gats.isStarry ? 0.92 : 1),
                  elevation: gats.isStarry ? 4 : 8,
                  shadowColor: gats.textPrimary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(AppRadius.pill),
                  child: navContent,
                ),
                Positioned(top: -6, child: centerAction!),
              ],
            )
          : Material(
              color: gats.surface.withValues(alpha: gats.isStarry ? 0.92 : 1),
              elevation: gats.isStarry ? 4 : 8,
              shadowColor: gats.textPrimary.withValues(alpha: 0.1),
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
            label: Text(
              destination.badgeLabel!,
              style: const TextStyle(fontSize: 10),
            ),
            backgroundColor: AppColors.accent,
            child: Icon(icon, size: 22, color: textColor),
          )
        : Icon(icon, size: 22, color: textColor);

    final labeledIcon = destination.badgeTooltip != null &&
            destination.badgeLabel != null
        ? Tooltip(
            message: destination.badgeTooltip!,
            child: iconWidget,
          )
        : iconWidget;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.pill),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          curve: Curves.easeOut,
          padding: const EdgeInsets.symmetric(horizontal: 2, vertical: AppSpacing.sm),
          decoration: BoxDecoration(
            color: selected ? selectedFill : Colors.transparent,
            borderRadius: BorderRadius.circular(AppRadius.pill),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              labeledIcon,
              const SizedBox(height: AppSpacing.xs),
              FittedBox(
                fit: BoxFit.scaleDown,
                child: Text(
                  destination.label,
                  maxLines: 1,
                  softWrap: false,
                  textAlign: TextAlign.center,
                  style: labelStyle,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
