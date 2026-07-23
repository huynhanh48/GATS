import 'package:flutter/material.dart';
import 'package:gats_academy/l10n/app_localizations.dart';
import 'package:url_launcher/url_launcher.dart';

abstract final class LegalUrls {
  static final terms = Uri.parse('https://gats.vn/terms');
  static final privacy = Uri.parse('https://gats.vn/privacy');
  static final refund = Uri.parse('https://gats.vn/refund');
  static final payment = Uri.parse('https://gats.vn/payment-policy');
  static final dataRequest = Uri.parse('https://gats.vn/data-request');

  static Future<void> open(BuildContext context, Uri uri) async {
    try {
      final launched = await launchUrl(
        uri,
        mode: LaunchMode.externalApplication,
      );
      if (launched || !context.mounted) return;
    } catch (error) {
      debugPrint('[LegalUrls] launchUrl failed ($uri): $error');
      if (!context.mounted) return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(AppLocalizations.of(context).legalOpenFailed)),
    );
  }
}
