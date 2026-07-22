import 'package:flutter/material.dart';
import 'package:gats_academy/core/l10n/auth_l10n.dart';
import 'package:gats_academy/core/navigation/gats_main_navigator.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/starry_sky_background.dart';
import 'package:gats_academy/features/auth/models/auth_exception.dart';
import 'package:gats_academy/features/auth/models/auth_user.dart';
import 'package:gats_academy/features/auth/services/auth_service.dart';
import 'package:gats_academy/data/api/auth_api_service.dart';
import 'package:gats_academy/l10n/app_localizations.dart';

class AccountScreen extends StatefulWidget {
  const AccountScreen({super.key});

  @override
  State<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends State<AccountScreen> {
  final _nameController = TextEditingController();
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _forgotEmailController = TextEditingController();
  final _resetTokenController = TextEditingController();
  final _resetPasswordController = TextEditingController();

  AuthUser? _user;
  bool _loading = true;
  bool _savingProfile = false;
  bool _changingPassword = false;
  bool _sendingForgot = false;
  bool _resetting = false;

  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    _forgotEmailController.dispose();
    _resetTokenController.dispose();
    _resetPasswordController.dispose();
    super.dispose();
  }

  Future<void> _bootstrap() async {
    final user = await AuthPrefs.currentUser();
    if (!mounted) return;
    setState(() {
      _user = user;
      _loading = false;
      if (user != null) {
        _nameController.text = user.displayName;
        _forgotEmailController.text = user.email;
      }
    });
  }

  void _snack(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  String _errorOf(Object e) {
    if (e is AuthException) return e.serverMessage ?? e.toString();
    return e.toString();
  }

  Future<void> _saveProfile() async {
    final token = await AuthPrefs.accessToken();
    final name = _nameController.text.trim();
    if (token == null || name.isEmpty) {
      _snack('Tên hiển thị không được trống');
      return;
    }
    setState(() => _savingProfile = true);
    try {
      final updated = await AuthApiService.updateMe(
        token: token,
        userName: name,
      );
      await AuthPrefs.saveSession(updated, token: token);
      if (!mounted) return;
      setState(() => _user = updated);
      _snack('Đã cập nhật hồ sơ');
    } catch (e) {
      _snack(_errorOf(e));
    } finally {
      if (mounted) setState(() => _savingProfile = false);
    }
  }

  Future<void> _changePassword() async {
    final token = await AuthPrefs.accessToken();
    final current = _currentPasswordController.text;
    final next = _newPasswordController.text;
    final confirm = _confirmPasswordController.text;
    if (token == null) return;
    if (next.length < 6) {
      _snack('Mật khẩu mới tối thiểu 6 ký tự');
      return;
    }
    if (next != confirm) {
      _snack('Xác nhận mật khẩu không khớp');
      return;
    }
    setState(() => _changingPassword = true);
    try {
      await AuthApiService.changePassword(
        token: token,
        currentPassword: current,
        newPassword: next,
      );
      _currentPasswordController.clear();
      _newPasswordController.clear();
      _confirmPasswordController.clear();
      _snack('Đã đổi mật khẩu');
    } catch (e) {
      _snack(_errorOf(e));
    } finally {
      if (mounted) setState(() => _changingPassword = false);
    }
  }

  Future<void> _forgotPassword() async {
    final email = _forgotEmailController.text.trim();
    if (email.isEmpty) {
      _snack('Nhập email');
      return;
    }
    setState(() => _sendingForgot = true);
    try {
      await AuthApiService.forgotPassword(email: email);
      _snack('Nếu email tồn tại, link/token đặt lại đã được gửi');
    } catch (e) {
      _snack(_errorOf(e));
    } finally {
      if (mounted) setState(() => _sendingForgot = false);
    }
  }

  Future<void> _resetPassword() async {
    final token = _resetTokenController.text.trim();
    final password = _resetPasswordController.text;
    if (token.isEmpty || password.length < 6) {
      _snack('Nhập token và mật khẩu mới (≥ 6 ký tự)');
      return;
    }
    setState(() => _resetting = true);
    try {
      await AuthApiService.resetPassword(token: token, newPassword: password);
      _resetTokenController.clear();
      _resetPasswordController.clear();
      _snack('Đặt lại mật khẩu thành công — đăng nhập lại');
    } catch (e) {
      _snack(_errorOf(e));
    } finally {
      if (mounted) setState(() => _resetting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final l10n = AppLocalizations.of(context);

    return GatsThemedScaffold(
      appBar: AppBar(
        backgroundColor: gats.isStarry ? Colors.transparent : gats.background,
        surfaceTintColor: Colors.transparent,
        title: Text(
          'Tài khoản',
          style: AppTypography.style(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: gats.textPrimary,
          ),
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _user == null
              ? const Center(child: Text('Chưa đăng nhập'))
              : ListView(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 40),
                  children: [
                    Text(
                      _user!.email,
                      style: TextStyle(color: gats.textSecondary),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${AuthL10n.methodLabel(l10n, _user!.method)} · ${AuthL10n.roleLabel(l10n, _user!.role)}',
                      style: TextStyle(
                        color: gats.textSecondary,
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'Tên hiển thị',
                      style: AppTypography.style(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: gats.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _nameController,
                      decoration: const InputDecoration(
                        hintText: 'Tên của bạn',
                      ),
                    ),
                    const SizedBox(height: 12),
                    FilledButton(
                      onPressed: _savingProfile ? null : _saveProfile,
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                      ),
                      child: _savingProfile
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Text('Lưu hồ sơ'),
                    ),
                    if (_user!.method == AuthMethod.email) ...[
                      const SizedBox(height: 32),
                      Text(
                        'Đổi mật khẩu',
                        style: AppTypography.style(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: gats.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _currentPasswordController,
                        obscureText: true,
                        decoration: const InputDecoration(
                          hintText: 'Mật khẩu hiện tại',
                        ),
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: _newPasswordController,
                        obscureText: true,
                        decoration: const InputDecoration(
                          hintText: 'Mật khẩu mới',
                        ),
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: _confirmPasswordController,
                        obscureText: true,
                        decoration: const InputDecoration(
                          hintText: 'Xác nhận mật khẩu mới',
                        ),
                      ),
                      const SizedBox(height: 12),
                      FilledButton(
                        onPressed:
                            _changingPassword ? null : _changePassword,
                        style: FilledButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                        ),
                        child: _changingPassword
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Text('Đổi mật khẩu'),
                      ),
                      const SizedBox(height: 32),
                      Text(
                        'Quên mật khẩu',
                        style: AppTypography.style(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: gats.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _forgotEmailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: const InputDecoration(hintText: 'Email'),
                      ),
                      const SizedBox(height: 12),
                      OutlinedButton(
                        onPressed: _sendingForgot ? null : _forgotPassword,
                        child: _sendingForgot
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : const Text('Gửi email đặt lại'),
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        controller: _resetTokenController,
                        decoration: const InputDecoration(
                          hintText: 'Token đặt lại (từ email)',
                        ),
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: _resetPasswordController,
                        obscureText: true,
                        decoration: const InputDecoration(
                          hintText: 'Mật khẩu mới',
                        ),
                      ),
                      const SizedBox(height: 12),
                      OutlinedButton(
                        onPressed: _resetting ? null : _resetPassword,
                        child: _resetting
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : const Text('Đặt lại mật khẩu'),
                      ),
                    ],
                    const SizedBox(height: 32),
                    TextButton.icon(
                      onPressed: () async {
                        await AuthService.signOut();
                        if (!context.mounted) return;
                        Navigator.pop(context);
                      },
                      icon: const Icon(Icons.logout_rounded),
                      label: const Text('Đăng xuất'),
                    ),
                  ],
                ),
    );
  }
}

void openAccount(BuildContext context) {
  GatsMainNavigator.push(context, const AccountScreen());
}
