import 'package:flutter/widgets.dart';
import 'package:gats_academy/l10n/app_localizations.dart';

export 'auth_l10n.dart';
export 'onboarding_l10n.dart';

extension BuildContextL10n on BuildContext {
  AppLocalizations get l10n => AppLocalizations.of(this);
}
