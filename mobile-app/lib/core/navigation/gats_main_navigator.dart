import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/gats_main_app_theme.dart';

/// Push màn trong app chính — transition nhẹ, kế thừa dark mode từ [GatsMainAppTheme].
abstract final class GatsMainNavigator {
  static const _forward = Duration(milliseconds: 180);
  static const _reverse = Duration(milliseconds: 160);

  static Future<T?> push<T>(BuildContext context, Widget page) {
    return Navigator.of(context).push<T>(_route<T>(page));
  }

  /// Đóng overlay (sheet/dialog) rồi push — gọi sau [Navigator.pop].
  static Future<T?> pushAfterPop<T>(BuildContext context, Widget page) {
    return push<T>(context, page);
  }

  static Route<T> _route<T>(Widget page) {
    return PageRouteBuilder<T>(
      pageBuilder: (context, animation, secondaryAnimation) {
        return GatsMainAppTheme(child: page);
      },
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        final curved = CurvedAnimation(
          parent: animation,
          curve: Curves.easeOutCubic,
          reverseCurve: Curves.easeInCubic,
        );
        return FadeTransition(
          opacity: curved,
          child: child,
        );
      },
      transitionDuration: _forward,
      reverseTransitionDuration: _reverse,
    );
  }
}
