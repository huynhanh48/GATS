/// Strip HTML tags / entities for plain-text UI (cards, excerpts).
abstract final class HtmlPlainText {
  static final _tagRe = RegExp(r'<[^>]*>', multiLine: true);
  static final _multiSpaceRe = RegExp(r'[ \t\u00a0]+');
  static final _multiNewlineRe = RegExp(r'\n{3,}');

  static String from(String? html) {
    if (html == null) return '';
    var text = html.trim();
    if (text.isEmpty) return '';

    text = text
        .replaceAll(RegExp(r'<br\s*/?>', caseSensitive: false), '\n')
        .replaceAll(RegExp(r'</p\s*>', caseSensitive: false), '\n')
        .replaceAll(RegExp(r'</div\s*>', caseSensitive: false), '\n')
        .replaceAll(RegExp(r'</li\s*>', caseSensitive: false), '\n')
        .replaceAll(_tagRe, '');

    text = text
        .replaceAll('&nbsp;', ' ')
        .replaceAll('&amp;', '&')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>')
        .replaceAll('&quot;', '"')
        .replaceAll('&#39;', "'")
        .replaceAll('&apos;', "'");

    text = text
        .replaceAllMapped(RegExp(r'&#(\d+);'), (m) {
          final code = int.tryParse(m.group(1)!);
          if (code == null) return m.group(0)!;
          return String.fromCharCode(code);
        })
        .replaceAllMapped(RegExp(r'&#x([0-9a-fA-F]+);'), (m) {
          final code = int.tryParse(m.group(1)!, radix: 16);
          if (code == null) return m.group(0)!;
          return String.fromCharCode(code);
        });

    text = text.replaceAll(_multiSpaceRe, ' ');
    text = text
        .split('\n')
        .map((line) => line.trim())
        .where((line) => line.isNotEmpty)
        .join('\n');
    text = text.replaceAll(_multiNewlineRe, '\n\n').trim();
    return text;
  }
}
