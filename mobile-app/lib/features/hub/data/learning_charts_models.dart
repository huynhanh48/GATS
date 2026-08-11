import 'package:flutter/material.dart';

class StudyDayStat {
  const StudyDayStat({required this.label, required this.minutes});

  final String label;
  final int minutes;
}

class XpTrendPoint {
  const XpTrendPoint({required this.label, required this.xp});

  final String label;
  final int xp;
}

class StudyActivitySlice {
  const StudyActivitySlice({
    required this.label,
    required this.value,
    required this.color,
  });

  final String label;
  final int value;
  final Color color;
}

class LearningChartsData {
  const LearningChartsData({
    required this.totalXp,
    required this.streakDays,
    required this.dailyGoalMinutes,
    required this.weeklyMinutes,
    required this.weeklyXp,
    required this.activityMix,
  });

  final int totalXp;
  final int streakDays;
  final int dailyGoalMinutes;
  final List<StudyDayStat> weeklyMinutes;
  final List<XpTrendPoint> weeklyXp;
  final List<StudyActivitySlice> activityMix;

  static const empty = LearningChartsData(
    totalXp: 0,
    streakDays: 0,
    dailyGoalMinutes: 10,
    weeklyMinutes: [],
    weeklyXp: [],
    activityMix: [],
  );

  HubProgress toHubProgress({int xpPerLevel = 500}) {
    final safePer = xpPerLevel <= 0 ? 500 : xpPerLevel;
    final level = (totalXp ~/ safePer) + 1;
    final currentXp = totalXp % safePer;
    return HubProgress(
      level: level,
      currentXp: currentXp,
      xpToNextLevel: safePer,
      certXpRequired: safePer,
    );
  }
}

class HubProgress {
  const HubProgress({
    required this.level,
    required this.currentXp,
    required this.xpToNextLevel,
    required this.certXpRequired,
  });

  final int level;
  final int currentXp;
  final int xpToNextLevel;
  final int certXpRequired;
}
