import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gats_academy/core/services/app_theme_controller.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/theme/gats_main_app_theme.dart';
import 'package:gats_academy/core/widgets/starry_sky_background.dart';
import 'package:gats_academy/features/auth/models/auth_user.dart';
import 'package:gats_academy/shell/main_shell.dart';

/// Mobile app is learner-only. Admin / instructor use the web admin dashboard.
class RoleShell extends StatefulWidget {
  const RoleShell({super.key});

  @override
  State<RoleShell> createState() => _RoleShellState();
}

class _RoleShellState extends State<RoleShell> {
  AuthUser? _user;

  @override
  void initState() {
    super.initState();
    _load();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      if (AppThemeController.instance.isDarkMode) {
        StarrySkyBackgroundCache.ensurePrecached(context);
      }
    });
  }

  Future<void> _load() async {
    final user = await AuthPrefs.currentUser();
    if (!mounted) return;
    setState(() => _user = user);
  }

  @override
  Widget build(BuildContext context) {
    if (_user == null) {
      return const GatsMainAppTheme(
        child: Scaffold(body: Center(child: CircularProgressIndicator())),
      );
    }

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (didPop) return;
        SystemNavigator.pop();
      },
      child: const GatsMainAppTheme(child: MainShell()),
    );
  }
}
