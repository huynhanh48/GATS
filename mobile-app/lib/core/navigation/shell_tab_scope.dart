import 'package:flutter/material.dart';

/// Tab index đang active trong [MainShell] — dùng pause animation/timer tab ẩn.
class ShellTabScope extends InheritedWidget {
  const ShellTabScope({
    super.key,
    required this.activeIndex,
    required super.child,
  });

  final int activeIndex;

  static ShellTabScope? maybeOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<ShellTabScope>();
  }

  static bool isActive(BuildContext context, int index) {
    return maybeOf(context)?.activeIndex == index;
  }

  @override
  bool updateShouldNotify(ShellTabScope oldWidget) {
    return activeIndex != oldWidget.activeIndex;
  }
}
