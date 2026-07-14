import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/app_theme.dart';

/// Sticky CTA tiếp tục học trong màn khóa.
class CourseContinueBar extends StatelessWidget {
  const CourseContinueBar({
    super.key,
    required this.progressLabel,
    required this.buttonLabel,
    required this.subtitle,
    required this.onPressed,
    this.enabled = true,
  });

  final String progressLabel;
  final String buttonLabel;
  final String subtitle;
  final VoidCallback? onPressed;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final bottom = MediaQuery.paddingOf(context).bottom;

    return Material(
      color: gats.surface.withValues(alpha: gats.isStarry ? 0.92 : 1),
      elevation: gats.isStarry ? 0 : 8,
      shadowColor: Colors.black26,
      child: Container(
        decoration: BoxDecoration(
          border: Border(top: BorderSide(color: gats.divider.withValues(alpha: 0.6))),
        ),
        padding: EdgeInsets.fromLTRB(
          AppSpacing.lg,
          AppSpacing.md,
          AppSpacing.lg,
          AppSpacing.md + bottom,
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    progressLabel,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: gats.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: gats.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            FilledButton(
              onPressed: enabled ? onPressed : null,
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                disabledBackgroundColor: gats.divider,
                elevation: 0,
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppRadius.pill),
                ),
              ),
              child: Text(buttonLabel),
            ),
          ],
        ),
      ),
    );
  }
}
