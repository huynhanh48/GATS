import 'package:flutter/material.dart';
import 'package:gats_academy/core/config/legal_urls.dart';
import 'package:gats_academy/core/navigation/gats_main_navigator.dart';
import 'package:gats_academy/core/services/app_locale_controller.dart';
import 'package:gats_academy/core/services/app_theme_controller.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/l10n/auth_l10n.dart';
import 'package:gats_academy/core/services/onboarding_prefs.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/features/notifications/presentation/notifications_screen.dart';
import 'package:gats_academy/core/widgets/rate_app_sheet.dart';
import 'package:gats_academy/core/widgets/section_card.dart';
import 'package:gats_academy/core/widgets/starry_sky_background.dart';
import 'package:gats_academy/features/auth/models/auth_user.dart';
import 'package:gats_academy/features/auth/services/auth_service.dart';
import 'package:gats_academy/features/settings/presentation/account_screen.dart';
import 'package:gats_academy/features/store/presentation/order_history_screen.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/l10n/app_localizations.dart';

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
    AppLocaleController.instance.addListener(_onLocaleChanged);
  }

  @override
  void dispose() {
    AppLocaleController.instance.removeListener(_onLocaleChanged);
    super.dispose();
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
      builder: (sheetContext) {
        final sheetGats = sheetContext.gatsColors;
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
                      color: sheetGats.textPrimary,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                ListTile(
                  leading: const Text('🇻🇳', style: TextStyle(fontSize: 24)),
                  title: Text(
                    'Tiếng Việt',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: sheetGats.textPrimary,
                    ),
                  ),
                  subtitle: Text(
                    'Vietnamese',
                    style: TextStyle(color: sheetGats.textSecondary),
                  ),
                  trailing: currentLocale.languageCode == 'vi'
                      ? Icon(Icons.check_circle, color: sheetGats.lavenderAccent, size: 24)
                      : null,
                  onTap: () async {
                    await AppLocaleController.instance.setLocale(const Locale('vi'));
                    if (sheetContext.mounted) Navigator.pop(sheetContext);
                  },
                ),
                Divider(height: 1, color: sheetGats.divider),
                ListTile(
                  leading: const Text('🇺🇸', style: TextStyle(fontSize: 24)),
                  title: Text(
                    'English',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: sheetGats.textPrimary,
                    ),
                  ),
                  subtitle: Text(
                    'Tiếng Anh',
                    style: TextStyle(color: sheetGats.textSecondary),
                  ),
                  trailing: currentLocale.languageCode == 'en'
                      ? Icon(Icons.check_circle, color: sheetGats.lavenderAccent, size: 24)
                      : null,
                  onTap: () async {
                    await AppLocaleController.instance.setLocale(const Locale('en'));
                    if (sheetContext.mounted) Navigator.pop(sheetContext);
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
    return ListenableBuilder(
      listenable: AppThemeController.instance,
      builder: (context, _) {
        final isDark = AppThemeController.instance.isDarkMode;
        return Theme(
          data: isDark ? AppTheme.dark : AppTheme.light,
          child: Builder(builder: _buildScaffold),
        );
      },
    );
  }

  Widget _buildScaffold(BuildContext context) {
    final gats = context.gatsColors;

    return GatsThemedScaffold(
      appBar: AppBar(
        title: Text(AppStrings.settingsTitle),
        backgroundColor: gats.isStarry ? Colors.transparent : gats.background,
        surfaceTintColor: Colors.transparent,
        foregroundColor: gats.textPrimary,
      ),
      body: FutureBuilder<AuthUser?>(
        future: _loadUser(),
        builder: (context, snapshot) {
          final user = snapshot.data;
          final l10n = AppLocalizations.of(context);
          final accountSubtitle = user != null
              ? '${AppStrings.authSignedInAs.replaceFirst('%s', AuthL10n.userIdentity(l10n, user))}\n${AppStrings.authRoleLabel.replaceFirst('%s', AuthL10n.roleLabel(l10n, user.role))}'
              : AppStrings.authNotSignedIn;

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
                      onTap: () {
                        if (user == null) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text(AppStrings.authNotSignedIn)),
                          );
                          return;
                        }
                        openAccount(context);
                      },
                    ),
                    if (user != null) ...[
                      Divider(height: 1, color: gats.divider),
                      _SettingsTile(
                        icon: Icons.receipt_long_outlined,
                        title: AppStrings.ordersMineTitle,
                        onTap: () => openOrderHistory(context),
                      ),
                      Divider(height: 1, color: gats.divider),
                      _SettingsTile(
                        icon: Icons.logout_rounded,
                        title: AppStrings.authSignOut,
                        onTap: () async {
                          await AuthService.signOut();
                          if (!context.mounted) return;
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(AppStrings.settingsSignOutSuccess),
                            ),
                          );
                          setState(() {});
                        },
                      ),
                    ],
                    Divider(height: 1, color: gats.divider),
                    SwitchListTile(
                      secondary: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: gats.lavenderAccent.withValues(alpha: 0.15),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.dark_mode_outlined,
                          color: gats.lavenderAccent,
                          size: 20,
                        ),
                      ),
                      title: Text(
                        AppStrings.settingsDarkMode,
                        style: TextStyle(color: gats.textPrimary),
                      ),
                      subtitle: Text(
                        AppStrings.settingsDarkModeSubtitle,
                        style: TextStyle(color: gats.textSecondary),
                      ),
                      value: AppThemeController.instance.isDarkMode,
                      activeThumbColor: gats.lavenderAccent,
                      activeTrackColor: gats.lavenderAccent.withValues(alpha: 0.35),
                      onChanged: (_) async {
                        await StarrySkyBackgroundCache.ensurePrecached(context);
                        await AppThemeController.instance.toggleDarkMode();
                      },
                    ),
                    Divider(height: 1, color: gats.divider),
                    _SettingsTile(
                      icon: Icons.notifications_outlined,
                      title: AppStrings.settingsNotifications,
                      onTap: () => openNotifications(context),
                    ),
                    Divider(height: 1, color: gats.divider),
                    _SettingsTile(
                      icon: Icons.language_outlined,
                      title: AppStrings.settingsLanguage,
                      subtitle: AppLocaleController.instance.locale.languageCode == 'vi'
                          ? 'Tiếng Việt'
                          : 'English',
                      onTap: () => _showLanguagePicker(context),
                    ),
                    Divider(height: 1, color: gats.divider),
                    _SettingsTile(
                      icon: Icons.star_outline_rounded,
                      title: AppStrings.settingsRateApp,
                      onTap: () => RateAppSheet.requestNativeReview(feedbackContext: context),
                    ),
                    Divider(height: 1, color: gats.divider),
                    _SettingsTile(
                      icon: Icons.replay_outlined,
                      title: AppStrings.settingsReplayOnboarding,
                      onTap: () async {
                        await OnboardingPrefs.reset();
                        if (!context.mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(AppStrings.settingsReplaySuccess),
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
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Padding(
                      padding: const EdgeInsets.fromLTRB(
                        AppSpacing.lg,
                        AppSpacing.lg,
                        AppSpacing.lg,
                        AppSpacing.sm,
                      ),
                      child: Text(
                        l10n.settingsLegal,
                        style: TextStyle(
                          color: gats.textPrimary,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                    _SettingsTile(
                      icon: Icons.description_outlined,
                      title: l10n.legalTerms,
                      onTap: () async {
                        await LegalUrls.open(context, LegalUrls.terms);
                      },
                    ),
                    Divider(height: 1, color: gats.divider),
                    _SettingsTile(
                      icon: Icons.privacy_tip_outlined,
                      title: l10n.legalPrivacy,
                      onTap: () async {
                        await LegalUrls.open(context, LegalUrls.privacy);
                      },
                    ),
                    Divider(height: 1, color: gats.divider),
                    _SettingsTile(
                      icon: Icons.currency_exchange_outlined,
                      title: l10n.legalRefund,
                      onTap: () async {
                        await LegalUrls.open(context, LegalUrls.refund);
                      },
                    ),
                    Divider(height: 1, color: gats.divider),
                    _SettingsTile(
                      icon: Icons.payments_outlined,
                      title: l10n.legalPayment,
                      onTap: () async {
                        await LegalUrls.open(context, LegalUrls.payment);
                      },
                    ),
                    Divider(height: 1, color: gats.divider),
                    _SettingsTile(
                      icon: Icons.manage_accounts_outlined,
                      title: l10n.legalDataRequest,
                      onTap: () async {
                        await LegalUrls.open(context, LegalUrls.dataRequest);
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
      title: Text(title, style: TextStyle(color: gats.textPrimary)),
      subtitle: subtitle != null
          ? Text(subtitle!, style: TextStyle(color: gats.textSecondary))
          : null,
      trailing: Icon(Icons.chevron_right, color: gats.textSecondary),
      onTap: onTap,
    );
  }
}

/// Mở Settings với dark mode đồng bộ.
void openSettings(BuildContext context) {
  GatsMainNavigator.push(context, const SettingsScreen());
}
