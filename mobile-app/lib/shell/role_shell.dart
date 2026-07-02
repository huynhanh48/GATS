import 'package:flutter/material.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/theme/gats_main_app_theme.dart';
import 'package:gats_academy/features/auth/models/auth_user.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/shell/admin_shell.dart';
import 'package:gats_academy/shell/main_shell.dart';
import 'package:gats_academy/shell/mentor_shell.dart';

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
  }

  Future<void> _load() async {
    final user = await AuthPrefs.currentUser();
    if (!mounted) return;
    setState(() => _user = user);
  }

  @override
  Widget build(BuildContext context) {
    final role = _user?.role ?? UserRole.guest;

    final shell = switch (role) {
      UserRole.admin => const AdminShell(),
      UserRole.mentor => const MentorShell(),
      UserRole.user || UserRole.guest => const MainShell(),
    };

    return GatsMainAppTheme(child: shell);
  }
}
