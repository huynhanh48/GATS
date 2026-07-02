class CourseCurriculumLesson {
  const CourseCurriculumLesson({
    required this.title,
    required this.durationMinutes,
    this.isPreview = false,
  });

  final String title;
  final int durationMinutes;
  final bool isPreview;
}

class CourseCurriculumSection {
  const CourseCurriculumSection({
    required this.title,
    required this.lessons,
  });

  final String title;
  final List<CourseCurriculumLesson> lessons;

  int get totalMinutes => lessons.fold(0, (sum, l) => sum + l.durationMinutes);
}

class CourseLandingContent {
  const CourseLandingContent({
    required this.courseId,
    required this.subtitle,
    required this.about,
    required this.learningOutcomes,
    required this.requirements,
    required this.curriculum,
    required this.instructorName,
    required this.instructorTitle,
    required this.rating,
    required this.reviewCount,
    required this.studentCount,
    required this.level,
    required this.lastUpdated,
  });

  final String courseId;
  final String subtitle;
  final String about;
  final List<String> learningOutcomes;
  final List<String> requirements;
  final List<CourseCurriculumSection> curriculum;
  final String instructorName;
  final String instructorTitle;
  final double rating;
  final int reviewCount;
  final int studentCount;
  final String level;
  final String lastUpdated;

  int get totalLessons => curriculum.fold(0, (sum, s) => sum + s.lessons.length);

  int get totalMinutes => curriculum.fold(0, (sum, s) => sum + s.totalMinutes);
}
