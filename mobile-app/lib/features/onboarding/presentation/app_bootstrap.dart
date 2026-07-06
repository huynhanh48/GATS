import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:gats_academy/core/services/app_locale_controller.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/utils/runtime_env.dart';
import 'package:gats_academy/core/services/onboarding_prefs.dart';
import 'package:gats_academy/core/services/review_prompt_service.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/features/auth/presentation/login_screen.dart';
import 'package:gats_academy/features/auth/services/auth_service.dart';
import 'package:gats_academy/features/onboarding/presentation/splash_screen.dart';
import 'package:gats_academy/features/onboarding/presentation/entry_screen.dart';
import 'package:gats_academy/features/onboarding/presentation/language_picker_screen.dart';
import 'package:gats_academy/features/onboarding/presentation/onboarding_loading_screen.dart';
import 'package:gats_academy/features/onboarding/data/onboarding_sync_service.dart';
import 'package:gats_academy/features/onboarding/presentation/onboarding_screen.dart';
import 'package:gats_academy/features/onboarding/presentation/rate_us_screen.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/shell/role_shell.dart';

enum _BootstrapPhase { checking, language, entry, onboarding, rateUs, loading, auth, main }

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
  List<String> _recommendedCourseIds = [];
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
        await OnboardingPrefs.reset();
        await AuthPrefs.signOut();
        await AppLocaleController.instance.resetChoice();
      }

      final onboarded = await OnboardingPrefs.isComplete();
      var signedIn = await AuthPrefs.isSignedIn();
      if (signedIn && !isFlutterTest) {
        try {
          final restored = await AuthService.restoreSession();
          if (restored != null) {
            await AuthService.persistSession(restored);
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
      } else if (onboarded) {
        _authGate = AuthGate.postOnboarding;
        next = _BootstrapPhase.auth;
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
    setState(() => _phase = _BootstrapPhase.onboarding);
  }

  void _onEntrySignIn() {
    if (!mounted) return;
    setState(() {
      _authGate = AuthGate.entry;
      _phase = _BootstrapPhase.auth;
    });
  }

  Future<void> _onAuthSuccess() async {
    final user = await AuthPrefs.currentUser();
    if (!mounted) return;

    if (_authGate == AuthGate.postOnboarding) {
      final answers = await OnboardingPrefs.loadPendingAnswers();
      final courseIds = await OnboardingPrefs.recommendedCourseIds();
      await OnboardingSyncService.syncAfterAuth(
        userId: user!.id,
        recommendedCourseIds: courseIds,
        answers: answers,
      );
      await OnboardingPrefs.clearPendingAnswers();
      if (!mounted) return;
      setState(() => _phase = _BootstrapPhase.main);
      return;
    }

    // Sign in từ Welcome = user quay lại → Main. Onboarding chỉ qua nút "Bắt đầu".
    if (user?.role == UserRole.mentor || user?.role == UserRole.admin) {
      await OnboardingPrefs.markComplete();
    }
    if (!mounted) return;
    setState(() => _phase = _BootstrapPhase.main);
  }

  void _onAuthBack() {
    if (!mounted) return;
    setState(() {
      _phase = _authGate == AuthGate.postOnboarding ? _BootstrapPhase.loading : _BootstrapPhase.entry;
    });
  }

  void _onBackToEntry() {
    if (!mounted) return;
    setState(() => _phase = _BootstrapPhase.entry);
  }

  void _onOnboardingReadyForRateUs(List<String> recommendedCourseIds) {
    if (!mounted) return;
    setState(() {
      _recommendedCourseIds = recommendedCourseIds;
      _phase = _BootstrapPhase.rateUs;
    });
  }

  void _onRateUsSkip() async {
    await ReviewPromptService.recordOnboardingRateSkipped();
    if (!mounted) return;
    setState(() => _phase = _BootstrapPhase.loading);
  }

  void _onRateUsContinue({required bool didRequestReview}) async {
    if (!mounted) return;
    if (didRequestReview) {
      ReviewPromptService.markOnboardingRateCompletedThisSession();
      ReviewPromptService.recordPromptShown();
    } else {
      await ReviewPromptService.recordOnboardingRateSkipped();
    }
    setState(() => _phase = _BootstrapPhase.loading);
  }

  Future<void> _onLoadingComplete() async {
    if (!mounted) return;
    final signedIn = await AuthPrefs.isSignedIn();
    if (!mounted) return;
    setState(() {
      if (signedIn) {
        _phase = _BootstrapPhase.main;
      } else {
        _authGate = AuthGate.postOnboarding;
        _phase = _BootstrapPhase.auth;
      }
    });
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
      _BootstrapPhase.onboarding => OnboardingScreen(
          onReadyForRateUs: _onOnboardingReadyForRateUs,
          onBackToEntry: _onBackToEntry,
        ),
      _BootstrapPhase.rateUs => RateUsScreen(
          recommendedCourseIds: _recommendedCourseIds,
          onSkip: _onRateUsSkip,
          onContinue: _onRateUsContinue,
        ),
      _BootstrapPhase.loading => OnboardingLoadingScreen(
          recommendedCourseIds: _recommendedCourseIds,
          onComplete: _onLoadingComplete,
        ),
      _BootstrapPhase.main => const RoleShell(),
    };

    if (_phase == _BootstrapPhase.main) return phase;

    return Theme(data: AppTheme.light, child: phase);
  }
}
