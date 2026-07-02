import 'package:flutter/material.dart';
import 'package:gats_academy/core/services/app_theme_controller.dart';
import 'package:gats_academy/core/theme/app_theme.dart';

/// Dark mode chỉ áp dụng trong app chính (sau onboarding), không ảnh hưởng welcome/auth.
class GatsMainAppTheme extends StatelessWidget {
  const GatsMainAppTheme({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: AppThemeController.instance,
      builder: (context, _) {
        if (!AppThemeController.instance.isDarkMode) return child;
        return Theme(
          data: AppTheme.dark,
          child: child,
        );
      },
    );
  }
}
