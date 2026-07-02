import 'package:gats_academy/data/mock/mock_data.dart';
import 'package:gats_academy/l10n/app_localizations.dart';

abstract final class MockCourseL10n {
  static String title(CourseItem course, AppLocalizations l10n) => switch (course.id) {
        'course-1' => l10n.course1Title,
        'course-2' => l10n.course2Title,
        'course-3' => l10n.course3Title,
        _ => course.title,
      };

  static String description(CourseItem course, AppLocalizations l10n) => switch (course.id) {
        'course-1' => l10n.course1Description,
        'course-2' => l10n.course2Description,
        'course-3' => l10n.course3Description,
        _ => course.description,
      };

  static String tag(CourseItem course, AppLocalizations l10n) => switch (course.id) {
        'course-1' => l10n.course1Tag,
        'course-2' => l10n.course2Tag,
        'course-3' => l10n.course3Tag,
        _ => course.tag,
      };
}
