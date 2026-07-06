import 'package:flutter/material.dart';

/// Chạm vùng trống (ngoài ô nhập) để ẩn bàn phím.
class KeyboardDismissScope extends StatelessWidget {
  const KeyboardDismissScope({super.key, required this.child});

  final Widget child;

  static void dismiss() {
    final focus = FocusManager.instance.primaryFocus;
    if (focus != null && focus.hasFocus) {
      focus.unfocus();
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: dismiss,
      behavior: HitTestBehavior.translucent,
      child: child,
    );
  }
}
