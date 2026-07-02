import 'dart:async';

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

  void _goToResults() {
    setState(() {
      _recommended = CourseRecommender.recommend(_answers);
      _phase = _OnboardingPhase.results;
    });
    unawaited(OnboardingPrefs.savePendingAnswers(_answers));
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
      _OnboardingPhase.quiz => OnboardingQuizScreen(
          answers: _answers,
          onAnswersChanged: (a) => setState(() => _answers = a),
          onComplete: _goToResults,
          onBack: () => setState(() => _phase = _OnboardingPhase.intro),
        ),
      _OnboardingPhase.results => OnboardingResultsScreen(
          courses: _recommended,
          onContinue: _goToRateUs,
          onBack: () => setState(() => _phase = _OnboardingPhase.quiz),
        ),
    };
  }
}
