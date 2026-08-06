import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:url_launcher/url_launcher.dart';

/// Renders AI Coach reply with tappable markdown / bare URLs.
class CoachMessageBody extends StatelessWidget {
  const CoachMessageBody({
    super.key,
    required this.text,
    this.onPrimary = false,
  });

  final String text;
  /// White text on user bubble gradient.
  final bool onPrimary;

  static final _bareUrlRe = RegExp(
    r'''(?<![\(\[<])((?:https?:\/\/|www\.)[^\s<>\)\]"']+)''',
    caseSensitive: false,
  );

  /// Turn bare URLs into markdown links so [MarkdownBody] can open them.
  static String autolinkBareUrls(String raw) {
    return raw.replaceAllMapped(_bareUrlRe, (match) {
      var url = match.group(1)!;
      // Trim trailing punctuation commonly stuck to URLs.
      while (url.isNotEmpty && '.,;:!?)]}'.contains(url[url.length - 1])) {
        url = url.substring(0, url.length - 1);
      }
      if (url.isEmpty) return match.group(0)!;
      final href = url.startsWith('www.') ? 'https://$url' : url;
      return '[$url]($href)';
    });
  }

  static Future<void> openLink(BuildContext context, String? href) async {
    if (href == null || href.trim().isEmpty) return;
    var raw = href.trim();
    if (raw.startsWith('www.')) raw = 'https://$raw';
    final uri = Uri.tryParse(raw);
    if (uri == null || !(uri.hasScheme && (uri.scheme == 'http' || uri.scheme == 'https'))) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Không mở được liên kết này.')),
      );
      return;
    }
    try {
      final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!ok && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Không mở được liên kết này.')),
        );
      }
    } catch (_) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Không mở được liên kết này.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final theme = Theme.of(context);
    final baseColor = onPrimary ? Colors.white : gats.textPrimary;
    final linkColor = onPrimary ? Colors.white : AppColors.accent;

    return MarkdownBody(
      data: autolinkBareUrls(text.trim()),
      // selectable:true often eats link taps on mobile.
      selectable: false,
      softLineBreak: true,
      styleSheet: MarkdownStyleSheet.fromTheme(theme).copyWith(
        p: TextStyle(fontSize: 14, height: 1.5, color: baseColor),
        strong: TextStyle(
          fontSize: 14,
          height: 1.5,
          fontWeight: FontWeight.w700,
          color: baseColor,
        ),
        em: TextStyle(
          fontSize: 14,
          height: 1.5,
          fontStyle: FontStyle.italic,
          color: baseColor,
        ),
        listBullet: TextStyle(fontSize: 14, height: 1.5, color: baseColor),
        a: TextStyle(
          color: linkColor,
          decoration: TextDecoration.underline,
          decorationColor: linkColor,
          fontWeight: FontWeight.w600,
        ),
        code: TextStyle(
          fontSize: 13,
          fontFamily: 'monospace',
          color: baseColor,
          backgroundColor: onPrimary
              ? Colors.white.withValues(alpha: 0.18)
              : gats.divider.withValues(alpha: 0.35),
        ),
        blockquote: TextStyle(
          fontSize: 14,
          height: 1.45,
          fontStyle: FontStyle.italic,
          color: onPrimary
              ? Colors.white.withValues(alpha: 0.9)
              : gats.textSecondary,
        ),
      ),
      onTapLink: (label, href, title) => openLink(context, href),
    );
  }
}
