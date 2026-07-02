import 'package:gats_academy/data/mock/mock_course_store.dart';
import 'package:gats_academy/data/mock/mock_data.dart';
import 'package:gats_academy/features/onboarding/models/onboarding_answers.dart';

abstract final class CourseRecommender {
  static List<CourseItem> recommend(OnboardingAnswers answers) {
    final courses = MockCourseStore.instance.publishedCourses();
    final scores = <String, int>{for (final c in courses) c.id: 0};

    switch (answers.level) {
      case SkillLevel.beginner:
        scores['course-1'] = (scores['course-1'] ?? 0) + 3;
      case SkillLevel.intermediate:
        scores['course-2'] = (scores['course-2'] ?? 0) + 3;
        scores['course-1'] = (scores['course-1'] ?? 0) + 1;
      case SkillLevel.advanced:
        scores['course-3'] = (scores['course-3'] ?? 0) + 3;
        scores['course-2'] = (scores['course-2'] ?? 0) + 1;
      case null:
        break;
    }

    switch (answers.purpose) {
      case LearningPurpose.officeWork:
        scores['course-1'] = (scores['course-1'] ?? 0) + 2;
      case LearningPurpose.skillUpgrade:
        scores['course-2'] = (scores['course-2'] ?? 0) + 2;
      case LearningPurpose.careerChange:
        scores['course-1'] = (scores['course-1'] ?? 0) + 2;
        scores['course-2'] = (scores['course-2'] ?? 0) + 1;
      case LearningPurpose.personalInterest:
        scores['course-1'] = (scores['course-1'] ?? 0) + 1;
        scores['course-3'] = (scores['course-3'] ?? 0) + 1;
      case null:
        break;
    }

    switch (answers.profile) {
      case UserProfile.student:
        scores['course-2'] = (scores['course-2'] ?? 0) + 2;
      case UserProfile.officeWorker:
        scores['course-1'] = (scores['course-1'] ?? 0) + 2;
      case UserProfile.freelancer:
        scores['course-3'] = (scores['course-3'] ?? 0) + 2;
      case UserProfile.other:
        for (final id in scores.keys) {
          scores[id] = (scores[id] ?? 0) + 1;
        }
      case null:
        break;
    }

    switch (answers.ageRange) {
      case AgeRange.under25:
      case AgeRange.age26to35:
        scores['course-2'] = (scores['course-2'] ?? 0) + 1;
      case AgeRange.age36to45:
      case AgeRange.above45:
        scores['course-1'] = (scores['course-1'] ?? 0) + 1;
      case null:
        break;
    }

    switch (answers.motivation) {
      case Motivation.career:
      case Motivation.income:
        scores['course-2'] = (scores['course-2'] ?? 0) + 2;
      case Motivation.keepUp:
        scores['course-1'] = (scores['course-1'] ?? 0) + 1;
        scores['course-2'] = (scores['course-2'] ?? 0) + 1;
      case Motivation.curiosity:
        scores['course-3'] = (scores['course-3'] ?? 0) + 1;
      case null:
        break;
    }

    for (final interest in answers.interests) {
      switch (interest) {
        case AiInterest.chatbot:
        case AiInterest.contentWriting:
          scores['course-1'] = (scores['course-1'] ?? 0) + 1;
        case AiInterest.dataAnalysis:
        case AiInterest.automation:
          scores['course-2'] = (scores['course-2'] ?? 0) + 1;
        case AiInterest.imageGen:
        case AiInterest.coding:
          scores['course-3'] = (scores['course-3'] ?? 0) + 1;
      }
    }

    switch (answers.dailyGoal) {
      case DailyGoal.serious:
      case DailyGoal.intense:
        scores['course-3'] = (scores['course-3'] ?? 0) + 1;
      case DailyGoal.casual:
      case DailyGoal.regular:
        scores['course-1'] = (scores['course-1'] ?? 0) + 1;
      case null:
        break;
    }

    final ranked = courses.map((c) => c.toListItem()).toList()
      ..sort((a, b) => (scores[b.id] ?? 0).compareTo(scores[a.id] ?? 0));

    final top = ranked.where((c) => (scores[c.id] ?? 0) > 0).take(2).toList();
    return top.isEmpty
        ? [courses.first.toListItem()]
        : top;
  }
}
