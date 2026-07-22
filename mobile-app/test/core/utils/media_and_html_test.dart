import 'package:flutter_test/flutter_test.dart';
import 'package:gats_academy/core/utils/html_plain_text.dart';
import 'package:gats_academy/core/utils/media_url.dart';

void main() {
  group('HtmlPlainText', () {
    test('strips paragraph tags', () {
      expect(
        HtmlPlainText.from(
          '<p>Kiến trúc gợi ý bài học tiếp theo dựa trên progress và quiz score.</p>',
        ),
        'Kiến trúc gợi ý bài học tiếp theo dựa trên progress và quiz score.',
      );
    });

    test('decodes entities', () {
      expect(HtmlPlainText.from('A &amp; B &lt;C&gt;'), 'A & B <C>');
    });
  });

  group('MediaUrl', () {
    test('keeps absolute https', () {
      expect(
        MediaUrl.resolve('https://cdn.example.com/a.jpg'),
        'https://cdn.example.com/a.jpg',
      );
    });

    test('prefixes relative uploads with API origin', () {
      final resolved = MediaUrl.resolve('/uploads/course/thumb.webp');
      expect(resolved, isNotNull);
      expect(resolved!.endsWith('/uploads/course/thumb.webp'), isTrue);
      expect(resolved.startsWith('http'), isTrue);
    });

    test('returns null for empty', () {
      expect(MediaUrl.resolve(null), isNull);
      expect(MediaUrl.resolve('  '), isNull);
    });
  });
}
