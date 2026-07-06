import 'dart:async';

import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/app_theme.dart';

enum GatsNotificationKind { success, info, warning, error }

/// Banner bo tròn hiện phía trên màn hình (thay SnackBar).
class GatsNotificationBanner extends StatefulWidget {
  const GatsNotificationBanner({
    super.key,
    this.title,
    required this.message,
    this.actionLabel,
    this.onAction,
    this.kind = GatsNotificationKind.success,
    required this.onDismiss,
    this.duration = const Duration(seconds: 4),
  });

  final String? title;
  final String message;
  final String? actionLabel;
  final VoidCallback? onAction;
  final GatsNotificationKind kind;
  final VoidCallback onDismiss;
  final Duration duration;

  @override
  State<GatsNotificationBanner> createState() => _GatsNotificationBannerState();
}

class _GatsNotificationBannerState extends State<GatsNotificationBanner>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<Offset> _slide;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 320),
      reverseDuration: const Duration(milliseconds: 260),
    );
    _slide = Tween<Offset>(
      begin: const Offset(0, -1.2),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic));
    _controller.forward();
    _timer = Timer(widget.duration, _dismiss);
  }

  Future<void> _dismiss() async {
    _timer?.cancel();
    if (!mounted) return;
    await _controller.reverse();
    if (mounted) widget.onDismiss();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  IconData _iconForKind() {
    return switch (widget.kind) {
      GatsNotificationKind.success => Icons.check_circle_rounded,
      GatsNotificationKind.info => Icons.info_outline_rounded,
      GatsNotificationKind.warning => Icons.warning_amber_rounded,
      GatsNotificationKind.error => Icons.error_outline_rounded,
    };
  }

  Color _accentForKind(GatsThemeExtension gats) {
    return switch (widget.kind) {
      GatsNotificationKind.success => const Color(0xFF10B981),
      GatsNotificationKind.info => gats.lavenderAccent,
      GatsNotificationKind.warning => AppColors.accent,
      GatsNotificationKind.error => const Color(0xFFEF4444),
    };
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final accent = _accentForKind(gats);

    return Positioned(
      top: 0,
      left: 0,
      right: 0,
      child: SlideTransition(
        position: _slide,
        child: SafeArea(
          bottom: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.sm, AppSpacing.lg, 0),
            child: Material(
              color: Colors.transparent,
              child: GestureDetector(
                onVerticalDragEnd: (details) {
                  if (details.primaryVelocity != null && details.primaryVelocity! < -200) {
                    _dismiss();
                  }
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    color: gats.surface,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: gats.divider.withValues(alpha: 0.55)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: gats.isStarry ? 0.35 : 0.12),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: accent.withValues(alpha: 0.12),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(_iconForKind(), color: accent, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (widget.title != null && widget.title!.isNotEmpty) ...[
                              Text(
                                widget.title!,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w800,
                                  color: gats.textPrimary,
                                  decoration: TextDecoration.none,
                                ),
                              ),
                              const SizedBox(height: 2),
                            ],
                            Text(
                              widget.message,
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: gats.textPrimary,
                                height: 1.35,
                                decoration: TextDecoration.none,
                              ),
                            ),
                          ],
                        ),
                      ),
                      if (widget.actionLabel != null && widget.onAction != null) ...[
                        const SizedBox(width: 8),
                        TextButton(
                          style: TextButton.styleFrom(
                            foregroundColor: gats.lavenderAccent,
                            padding: const EdgeInsets.symmetric(horizontal: 10),
                            minimumSize: Size.zero,
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                          onPressed: () {
                            widget.onAction!();
                            _dismiss();
                          },
                          child: Text(
                            widget.actionLabel!,
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                              decoration: TextDecoration.none,
                            ),
                          ),
                        ),
                      ],
                      IconButton(
                        visualDensity: VisualDensity.compact,
                        iconSize: 18,
                        onPressed: _dismiss,
                        color: gats.textSecondary,
                        icon: const Icon(Icons.close_rounded),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
