import 'package:flutter/material.dart';
import 'package:gats_academy/core/services/app_theme_controller.dart';
import 'package:gats_academy/core/services/app_locale_controller.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/services/onboarding_prefs.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/rate_app_sheet.dart';
import 'package:gats_academy/core/widgets/section_card.dart';
import 'package:gats_academy/features/auth/models/auth_user.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  Future<AuthUser?> _loadUser() => AuthPrefs.currentUser();

  @override
  void initState() {
    super.initState();
    AppThemeController.instance.addListener(_onThemeChanged);
    AppLocaleController.instance.addListener(_onLocaleChanged);
  }

  @override
  void dispose() {
    AppThemeController.instance.removeListener(_onThemeChanged);
    AppLocaleController.instance.removeListener(_onLocaleChanged);
    super.dispose();
  }

  void _onThemeChanged() {
    if (mounted) setState(() {});
  }

  void _onLocaleChanged() {
    if (mounted) setState(() {});
  }

  void _showLanguagePicker(BuildContext context) {
    final gats = context.gatsColors;
    final currentLocale = AppLocaleController.instance.locale;

    showModalBottomSheet<void>(
      context: context,
      backgroundColor: gats.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                  child: Text(
                    AppStrings.settingsLanguage,
                    style: AppTypography.style(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: gats.textPrimary,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                ListTile(
                  leading: const Text('🇻🇳', style: TextStyle(fontSize: 24)),
                  title: Text(
                    'Tiếng Việt',
                    style: AppTypography.style(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: gats.textPrimary,
                    ),
                  ),
                  subtitle: Text(
                    'Vietnamese',
                    style: AppTypography.style(
                      fontSize: 13,
                      color: gats.textSecondary,
                    ),
                  ),
                  trailing: currentLocale.languageCode == 'vi'
                      ? const Icon(Icons.check_circle, color: AppColors.primary, size: 24)
                      : null,
                  onTap: () async {
                    await AppLocaleController.instance.setLocale(const Locale('vi'));
                    if (context.mounted) Navigator.pop(context);
                  },
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 24),
                  child: Divider(height: 1),
                ),
                ListTile(
                  leading: const Text('🇺🇸', style: TextStyle(fontSize: 24)),
                  title: Text(
                    'English',
                    style: AppTypography.style(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: gats.textPrimary,
                    ),
                  ),
                  subtitle: Text(
                    'Tiếng Anh',
                    style: AppTypography.style(
                      fontSize: 13,
                      color: gats.textSecondary,
                    ),
                  ),
                  trailing: currentLocale.languageCode == 'en'
                      ? const Icon(Icons.check_circle, color: AppColors.primary, size: 24)
                      : null,
                  onTap: () async {
                    await AppLocaleController.instance.setLocale(const Locale('en'));
                    if (context.mounted) Navigator.pop(context);
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showComingSoon(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(AppStrings.comingSoon)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;

    return Scaffold(
      backgroundColor: gats.background,
      appBar: AppBar(title: Text(AppStrings.settingsTitle)),
      body: FutureBuilder<AuthUser?>(
        future: _loadUser(),
        builder: (context, snapshot) {
          final user = snapshot.data;
          final accountSubtitle = user != null
              ? '${AppStrings.authSignedInAs.replaceFirst('%s', '${user.displayName} (${user.methodLabel})')}\n${AppStrings.authRoleLabel.replaceFirst('%s', user.roleLabel)}'
              : 'Khách — chưa đăng nhập (vai trò: ${UserRole.guest.label})';

          return ListView(
            padding: const EdgeInsets.all(AppSpacing.lg),
            children: [
              SectionCard(
                padding: EdgeInsets.zero,
                child: Column(
                  children: [
                    _SettingsTile(
                      icon: Icons.person_outline,
                      title: AppStrings.settingsAccount,
                      subtitle: accountSubtitle,
                      onTap: () => _showComingSoon(context),
                    ),
                    if (user != null) ...[
                      const Divider(height: 1),
                      _SettingsTile(
                        icon: Icons.logout_rounded,
                        title: AppStrings.authSignOut,
                        onTap: () async {
                          await AuthPrefs.signOut();
                          if (!context.mounted) return;
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Đã đăng xuất. Hot restart app (R) để về màn Entry.'),
                            ),
                          );
                        },
                      ),
                    ],
                    const Divider(height: 1),
                    SwitchListTile(
                      secondary: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: AppColors.nightLavender.withValues(alpha: 0.15),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.dark_mode_outlined, color: AppColors.nightLavender, size: 20),
                      ),
                      title: Text(AppStrings.settingsDarkMode),
                      subtitle: Text(AppStrings.settingsDarkModeSubtitle),
                      value: AppThemeController.instance.isDarkMode,
                      activeThumbColor: AppColors.nightLavender,
                      onChanged: (_) => AppThemeController.instance.toggleDarkMode(),
                    ),
                    const Divider(height: 1),
                    _SettingsTile(
                      icon: Icons.notifications_outlined,
                      title: AppStrings.settingsNotifications,
                      onTap: () => _showComingSoon(context),
                    ),
                    const Divider(height: 1),
                    _SettingsTile(
                      icon: Icons.language_outlined,
                      title: AppStrings.settingsLanguage,
                      subtitle: AppLocaleController.instance.locale.languageCode == 'vi'
                          ? 'Tiếng Việt'
                          : 'English',
                      onTap: () => _showLanguagePicker(context),
                    ),
                    const Divider(height: 1),
                    _SettingsTile(
                      icon: Icons.star_outline_rounded,
                      title: AppStrings.settingsRateApp,
                      onTap: () => RateAppSheet.openStoreListing(),
                    ),
                    const Divider(height: 1),
                    _SettingsTile(
                      icon: Icons.replay_outlined,
                      title: AppStrings.settingsReplayOnboarding,
                      onTap: () async {
                        await OnboardingPrefs.reset();
                        if (!context.mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Đã reset onboarding. Hot restart app (R) để xem lại flow.'),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              SectionCard(
                padding: EdgeInsets.zero,
                child: _SettingsTile(
                  icon: Icons.info_outline,
                  title: AppStrings.settingsAbout,
                  subtitle: AppStrings.appName,
                  onTap: () => _showComingSoon(context),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  const _SettingsTile({
    required this.icon,
    required this.title,
    this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String? subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return ListTile(
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: gats.lavenderAccent.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: gats.lavenderAccent, size: 20),
        ),
        title: Text(title),
        subtitle: subtitle != null ? Text(subtitle!) : null,
        trailing: Icon(Icons.chevron_right, color: gats.textSecondary),
        onTap: onTap,
      );
  }
}
