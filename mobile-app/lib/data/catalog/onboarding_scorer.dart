import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gats_academy/data/catalog/catalog_paths.dart';
import 'package:gats_academy/data/catalog/course_catalog_loader.dart';
import 'package:gats_academy/data/mock/mock_course_store.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';
import 'package:gats_academy/features/onboarding/models/onboarding_answers.dart';

/// Gợi ý khóa học từ `onboarding_rules.json` + metadata trong catalog.
class OnboardingScorer {
  OnboardingScorer._();
  static final OnboardingScorer instance = OnboardingScorer._();

  bool _loaded = false;
  int _maxRecommendations = 2;
  final List<_ScoreRule> _rules = [];
  int _metadataBoostWeight = 1;
  List<String> _fallbackIds = ['course-1'];

  Future<void> init() async {
    if (_loaded) return;
    try {
      final raw = await rootBundle.loadString(CatalogPaths.onboardingRules);
      final json = jsonDecode(raw) as Map<String, dynamic>;
      _maxRecommendations = json['maxRecommendations'] as int? ?? 2;
      _fallbackIds = (json['fallbackCourseIds'] as List<dynamic>? ?? ['course-1'])
          .map((e) => e.toString())
          .toList();
      final meta = json['metadataBoost'] as Map<String, dynamic>?;
      _metadataBoostWeight = meta?['weight'] as int? ?? 1;

      for (final rule in json['rules'] as List<dynamic>? ?? []) {
        final m = rule as Map<String, dynamic>;
        _rules.add(
          _ScoreRule(
            field: m['field'] as String,
            value: m['value'] as String,
            courseId: m['courseId'] as String?,
            categoryId: m['categoryId'] as String?,
            weight: m['weight'] as int? ?? 1,
          ),
        );
      }
      _loaded = true;
    } catch (e, st) {
      debugPrint('OnboardingScorer: load failed — $e\n$st');
      _loaded = true;
    }
  }

  List<CourseItem> recommend(OnboardingAnswers answers) {
    final courses = MockCourseStore.instance.publishedCourses();
    if (courses.isEmpty) return [];

    final scores = <String, int>{for (final c in courses) c.id: 0};

    void addScore(String? courseId, String? categoryId, int weight) {
      if (courseId != null) {
        scores[courseId] = (scores[courseId] ?? 0) + weight;
        return;
      }
      if (categoryId == null) return;
      for (final c in courses) {
        final cat = CourseCatalogLoader.instance.categoryIdFor(c.id);
        if (cat == categoryId) {
          scores[c.id] = (scores[c.id] ?? 0) + weight;
        }
      }
    }

    for (final rule in _rules) {
      if (!_matchesRule(rule, answers)) continue;
      addScore(rule.courseId, rule.categoryId, rule.weight);
    }

    _applyMetadataBoost(answers, courses, scores);

    final ranked = courses.map((c) => c.toListItem()).toList()
      ..sort((a, b) => (scores[b.id] ?? 0).compareTo(scores[a.id] ?? 0));

    final top = ranked.where((c) => (scores[c.id] ?? 0) > 0).take(_maxRecommendations).toList();
    if (top.isNotEmpty) return top;

    final fallback = <CourseItem>[];
    for (final id in _fallbackIds) {
      final course = MockCourseStore.instance.courseById(id);
      if (course != null && course.isPublished) {
        fallback.add(course.toListItem());
      }
      if (fallback.length >= _maxRecommendations) break;
    }
    return fallback.isNotEmpty ? fallback : [courses.first.toListItem()];
  }

  bool _matchesRule(_ScoreRule rule, OnboardingAnswers answers) {
    return switch (rule.field) {
      'level' => answers.level?.name == rule.value,
      'purpose' => answers.purpose?.name == rule.value,
      'profile' => answers.profile?.name == rule.value,
      'ageRange' => answers.ageRange?.name == rule.value,
      'motivation' => answers.motivation?.name == rule.value,
      'dailyGoal' => answers.dailyGoal?.name == rule.value,
      'interest' => answers.interests.any((i) => i.name == rule.value),
      _ => false,
    };
  }

  void _applyMetadataBoost(
    OnboardingAnswers answers,
    List<AppCourse> courses,
    Map<String, int> scores,
  ) {
    final answerMap = <String, Set<String>>{
      'skillLevels': {if (answers.level != null) answers.level!.name},
      'purposes': {if (answers.purpose != null) answers.purpose!.name},
      'profiles': {if (answers.profile != null) answers.profile!.name},
      'motivations': {if (answers.motivation != null) answers.motivation!.name},
      'ageRanges': {if (answers.ageRange != null) answers.ageRange!.name},
      'dailyGoals': {if (answers.dailyGoal != null) answers.dailyGoal!.name},
      'interests': answers.interests.map((e) => e.name).toSet(),
    };

    for (final course in courses) {
      final meta = CourseCatalogLoader.instance.onboardingMetaFor(course.id);
      for (final entry in answerMap.entries) {
        final courseValues = meta[entry.key];
        if (courseValues == null || courseValues.isEmpty) continue;
        if (courseValues.intersection(entry.value).isNotEmpty) {
          scores[course.id] = (scores[course.id] ?? 0) + _metadataBoostWeight;
        }
      }
    }
  }
}

class _ScoreRule {
  const _ScoreRule({
    required this.field,
    required this.value,
    this.courseId,
    this.categoryId,
    required this.weight,
  });

  final String field;
  final String value;
  final String? courseId;
  final String? categoryId;
  final int weight;
}
