import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/app_theme.dart';

/// Reusable "+X XP" popup overlay that floats up and fades out.
class XpPopup {
  static OverlayEntry? _current;

  static void show(BuildContext context, {int xp = 5, Offset? position}) {
    _current?.remove();

    final overlay = Overlay.of(context);
    final entry = OverlayEntry(
      builder: (context) => _XpPopupWidget(
        xp: xp,
        position: position ??
            Offset(
              MediaQuery.of(context).size.width / 2 - 30,
              MediaQuery.of(context).size.height / 2 - 30,
            ),
        onDone: () {
          _current?.remove();
          _current = null;
        },
      ),
    );

    _current = entry;
    overlay.insert(entry);
  }
}

class _XpPopupWidget extends StatefulWidget {
  const _XpPopupWidget({
    required this.xp,
    required this.position,
    required this.onDone,
  });

  final int xp;
  final Offset position;
  final VoidCallback onDone;

  @override
  State<_XpPopupWidget> createState() => _XpPopupWidgetState();
}

class _XpPopupWidgetState extends State<_XpPopupWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _opacity;
  late Animation<Offset> _offset;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _opacity = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 0, end: 1), weight: 20),
      TweenSequenceItem(tween: Tween(begin: 1, end: 1), weight: 50),
      TweenSequenceItem(tween: Tween(begin: 1, end: 0), weight: 30),
    ]).animate(_controller);
    _offset = Tween<Offset>(
      begin: Offset.zero,
      end: const Offset(0, -60),
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOutCubic,
    ));
    _controller.forward().then((_) => widget.onDone());
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Positioned(
          left: widget.position.dx,
          top: widget.position.dy + _offset.value.dy,
          child: IgnorePointer(
            child: Opacity(
              opacity: _opacity.value,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  gradient: AppGradients.accent,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.accent.withValues(alpha: 0.4),
                      blurRadius: 12,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: Text(
                  '+${widget.xp} XP',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                    fontSize: 16,
                    decoration: TextDecoration.none,
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
