import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/gats_logo.dart';
import 'package:gats_academy/features/settings/presentation/settings_screen.dart';
import 'package:gats_academy/l10n/app_localizations.dart';
import 'package:gats_academy/core/services/app_locale_controller.dart';
import 'package:gats_academy/core/services/cart_controller.dart';
import 'package:gats_academy/features/store/presentation/cart_screen.dart';

class AppHeader extends StatelessWidget implements PreferredSizeWidget {
  const AppHeader({
    super.key,
    required this.title,
    this.subtitle,
  });

  final String title;
  final String? subtitle;

  @override
  Size get preferredSize => Size.fromHeight(subtitle != null ? 72 : kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: context.gatsColors.background,
      surfaceTintColor: Colors.transparent,
      toolbarHeight: preferredSize.height,
      title: Row(
        children: [
          const GatsLogoMark(size: 36),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(title, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800)),
                if (subtitle != null)
                  Text(
                    subtitle!,
                    style: Theme.of(context).textTheme.bodySmall,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
              ],
            ),
          ),
        ],
      ),
      actions: [
        AnimatedBuilder(
          animation: CartController.instance,
          builder: (context, _) {
            final qty = CartController.instance.totalQuantity;
            return IconButton(
              icon: qty > 0
                  ? Badge(
                      label: Text('$qty'),
                      child: const Icon(Icons.shopping_cart_outlined),
                    )
                  : const Icon(Icons.shopping_cart_outlined),
              tooltip: 'Giỏ hàng',
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute<void>(builder: (_) => const CartScreen()),
                );
              },
            );
          },
        ),
        IconButton(
          icon: const Icon(Icons.settings_outlined),
          tooltip: AppStrings.settingsTitle,
          onPressed: () {
            Navigator.of(context).push(
              MaterialPageRoute<void>(builder: (_) => const SettingsScreen()),
            );
          },
        ),
      ],
    );
  }
}

abstract final class AppHeaderSubtitles {
  static AppLocalizations get _l10n => lookupAppLocalizations(AppLocaleController.instance.locale);

  static String get home => _l10n.headerSubtitleHome;
  static String get daily => _l10n.headerSubtitleDaily;
  static String get library => _l10n.headerSubtitleLibrary;
  static String get aiCoach => _l10n.headerSubtitleAiCoach;
  static String get hub => _l10n.headerSubtitleHub;
  static String get store => _l10n.headerSubtitleStore;
}

