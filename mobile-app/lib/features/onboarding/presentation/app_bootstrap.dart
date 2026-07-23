import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:gats_academy/core/services/app_locale_controller.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/services/cart_controller.dart';
import 'package:gats_academy/core/utils/runtime_env.dart';
import 'package:gats_academy/core/services/review_prompt_service.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/features/auth/presentation/login_screen.dart';
import 'package:gats_academy/features/auth/services/auth_service.dart';
import 'package:gats_academy/features/course/course_module.dart';
import 'package:gats_academy/features/onboarding/presentation/splash_screen.dart';
import 'package:gats_academy/features/onboarding/presentation/entry_screen.dart';
import 'package:gats_academy/features/onboarding/presentation/language_picker_screen.dart';
import 'package:gats_academy/shell/role_shell.dart';

enum _BootstrapPhase { checking, language, entry, auth, main }

bool _shouldResetFlowForDebug() {
  // Chỉ reset flow trên web dev — tránh xóa session MoMo mỗi lần chạy trên máy thật.
  return kDebugMode && kIsWeb;
}

class AppBootstrap extends StatefulWidget {
  const AppBootstrap({super.key});

  @override
  State<AppBootstrap> createState() => _AppBootstrapState();
}

class _AppBootstrapState extends State<AppBootstrap> {
  _BootstrapPhase _phase = _BootstrapPhase.checking;
  AuthGate _authGate = AuthGate.entry;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    var next = _BootstrapPhase.entry;
    try {
      final minSplash = splashMinDuration();

      await Future.wait([
        ReviewPromptService.init(),
        Future<void>.delayed(minSplash),
      ]);

      if (_shouldResetFlowForDebug()) {
        await AuthPrefs.signOut();
        await AppLocaleController.instance.resetChoice();
      }

      var signedIn = await AuthPrefs.isSignedIn();
      if (signedIn && !isFlutterTest) {
        try {
          final restored = await AuthService.restoreSession();
          if (restored != null) {
            await AuthService.persistSession(restored);
            await CourseModule.init();
            await CartController.instance.syncFromApi();
          } else {
            await AuthPrefs.signOut();
            signedIn = false;
          }
        } catch (_) {
          await AuthPrefs.signOut();
          signedIn = false;
        }
      }
      final hasLocale = AppLocaleController.instance.hasChosenLocale;
      if (!hasLocale) {
        next = _BootstrapPhase.language;
      } else if (signedIn) {
        next = _BootstrapPhase.main;
      } else {
        next = _BootstrapPhase.entry;
      }
    } catch (e, st) {
      debugPrint('AppBootstrap._load thất bại: $e\n$st');
    }
    if (!mounted) return;
    setState(() => _phase = next);
  }

  void _onLanguageChosen() {
    if (!mounted) return;
    setState(() => _phase = _BootstrapPhase.entry);
  }

  void _onEntryContinue() {
    if (!mounted) return;
    setState(() {
      _authGate = AuthGate.entry;
      _phase = _BootstrapPhase.auth;
    });
  }

  void _onEntrySignIn() {
    if (!mounted) return;
    setState(() {
      _authGate = AuthGate.entry;
      _phase = _BootstrapPhase.auth;
    });
  }

  Future<void> _onAuthSuccess() async {
    if (!mounted) return;

    await CourseModule.init();
    await CartController.instance.syncFromApi();
    if (!mounted) return;
    setState(() => _phase = _BootstrapPhase.main);
  }

  void _onAuthBack() {
    if (!mounted) return;
    setState(() => _phase = _BootstrapPhase.entry);
  }

  @override
  Widget build(BuildContext context) {
    final phase = switch (_phase) {
      _BootstrapPhase.checking => const SplashScreen(),
      _BootstrapPhase.language => LanguagePickerScreen(onContinue: _onLanguageChosen),
      _BootstrapPhase.entry => EntryScreen(
          onContinue: _onEntryContinue,
          onSignIn: _onEntrySignIn,
        ),
      _BootstrapPhase.auth => LoginScreen(
          gate: _authGate,
          onAuthenticated: _onAuthSuccess,
          onBack: _onAuthBack,
        ),
      _BootstrapPhase.main => const RoleShell(),
    };

    if (_phase == _BootstrapPhase.main) return phase;

    return Theme(data: AppTheme.light, child: phase);
  }
}
