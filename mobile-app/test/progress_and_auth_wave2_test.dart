import 'package:flutter_test/flutter_test.dart';
import 'package:gats_academy/data/api/progress_api_service.dart';
import 'package:gats_academy/features/auth/services/mock_auth_provider.dart';

void main() {
  group('CourseProgressDto', () {
    test('parses completedLessonIds and fraction', () {
      final dto = CourseProgressDto.fromJson({
        'completedLessons': 2,
        'totalLessons': 4,
        'percent': 50,
        'completedLessonIds': ['a', 'b'],
      });
      expect(dto.completedLessons, 2);
      expect(dto.totalLessons, 4);
      expect(dto.percent, 50);
      expect(dto.fraction, 0.5);
      expect(dto.completedLessonIds, ['a', 'b']);
    });

    test('handles missing ids', () {
      final dto = CourseProgressDto.fromJson({
        'completedLessons': 0,
        'totalLessons': 0,
        'percent': 0,
      });
      expect(dto.completedLessonIds, isEmpty);
      expect(dto.fraction, 0);
    });
  });

  group('MockAuthProvider', () {
    test('detects mock_session tokens', () {
      expect(MockAuthProvider.isMockToken('mock_session:momo'), isTrue);
      expect(MockAuthProvider.isMockToken('eyJhbGciOi...'), isFalse);
      expect(MockAuthProvider.isMockToken(null), isFalse);
    });
  });
}
