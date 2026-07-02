import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:gats_academy/core/services/app_locale_controller.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/features/onboarding/presentation/app_bootstrap.dart';
import 'package:gats_academy/l10n/app_localizations.dart';

class GatsAcademyApp extends StatelessWidget {
  const GatsAcademyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: AppLocaleController.instance,
      builder: (context, _) {
        return MaterialApp(
          title: 'GATS Academy',
          locale: AppLocaleController.instance.locale,
          supportedLocales: AppLocalizations.supportedLocales,
          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          theme: AppTheme.light,
          themeMode: ThemeMode.light,
          debugShowCheckedModeBanner: false,
          home: const AppBootstrap(),
        );
      },
    );
  }
}
