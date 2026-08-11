import 'package:flutter/material.dart';
import 'package:gats_academy/core/services/app_locale_controller.dart';
import 'package:gats_academy/core/services/onboarding_prefs.dart';
import 'package:gats_academy/data/mock/mock_data.dart';
import 'package:gats_academy/features/onboarding/data/course_recommender.dart';
import 'package:gats_academy/features/onboarding/models/onboarding_answers.dart';
import 'package:gats_academy/features/onboarding/presentation/onboarding_intro_screen.dart';
import 'package:gats_academy/features/onboarding/presentation/onboarding_quiz_screen.dart';
import 'package:gats_academy/features/onboarding/presentation/onboarding_results_screen.dart';

enum _OnboardingPhase { intro, quiz, results }

AppLanguage? _languageFromLocale(Locale locale) {
  return switch (locale.languageCode) {
    'en' => AppLanguage.english,
    'vi' => AppLanguage.vietnamese,
    _ => null,
  };
}

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({
    super.key,
    required this.onReadyForRateUs,
    required this.onBackToEntry,
  });

  final ValueChanged<List<String>> onReadyForRateUs;
  final VoidCallback onBackToEntry;

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  _OnboardingPhase _phase = _OnboardingPhase.intro;
  late OnboardingAnswers _answers = OnboardingAnswers(
    language: _languageFromLocale(AppLocaleController.instance.locale),
  );
  List<CourseItem> _recommended = [];
  bool _isRecommending = false;

  Future<void> _goToResults() async {
    if (_isRecommending) return;
    setState(() {
      _isRecommending = true;
    });
    await OnboardingPrefs.savePendingAnswers(_answers);
    final recommended = await CourseRecommender.recommend(_answers);
    if (!mounted) return;
    setState(() {
      _recommended = recommended;
      _isRecommending = false;
      _phase = _OnboardingPhase.results;
    });
  }

  void _goToRateUs() {
    widget.onReadyForRateUs(_recommended.map((c) => c.id).toList());
  }

  @override
  Widget build(BuildContext context) {
    return switch (_phase) {
      _OnboardingPhase.intro => OnboardingIntroScreen(
        onContinue: () => setState(() => _phase = _OnboardingPhase.quiz),
        onBack: widget.onBackToEntry,
      ),
      _OnboardingPhase.quiz => Stack(
        children: [
          OnboardingQuizScreen(
            answers: _answers,
            onAnswersChanged: (a) => setState(() => _answers = a),
            onComplete: _goToResults,
            onBack: () => setState(() => _phase = _OnboardingPhase.intro),
          ),
          if (_isRecommending)
            const Positioned.fill(
              child: ColoredBox(
                color: Color(0x66000000),
                child: Center(child: CircularProgressIndicator()),
              ),
            ),
        ],
      ),
      _OnboardingPhase.results => OnboardingResultsScreen(
        courses: _recommended,
        onContinue: _goToRateUs,
        onBack: () => setState(() => _phase = _OnboardingPhase.quiz),
      ),
    };
  }
}
