import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/utils/html_plain_text.dart';
import 'package:gats_academy/core/utils/media_url.dart';
import 'package:url_launcher/url_launcher.dart';

/// Renders post body like web (`MarkdownRenderer` + HTML from TipTap).
/// Headings (`h1`–`h3` / `#` markdown) get proper size/weight — not plain Text.
class PostRichBody extends StatelessWidget {
  const PostRichBody({super.key, required this.content, this.compact = false});

  final String content;
  final bool compact;

  static final _htmlTagRe = RegExp(r'<[a-zA-Z][^>]*>');
  static final _htmlImageTagRe = RegExp(r'<img\b[^>]*>', caseSensitive: false);
  static final _fixedImageDimensionRe = RegExp(
    r'''\s+(?:width|height)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)''',
    caseSensitive: false,
  );
  static final _inlineImageStyleRe = RegExp(
    r'''\s+style\s*=\s*(?:"[^"]*"|'[^']*')''',
    caseSensitive: false,
  );

  static bool looksLikeHtml(String raw) => _htmlTagRe.hasMatch(raw.trim());

  static String _makeHtmlImagesResponsive(String html) {
    return html.replaceAllMapped(_htmlImageTagRe, (match) {
      return match
          .group(0)!
          .replaceAll(_fixedImageDimensionRe, '')
          .replaceAll(_inlineImageStyleRe, '');
    });
  }

  Future<void> _openLink(String? url) async {
    if (url == null || url.isEmpty) return;
    final uri = Uri.tryParse(url);
    if (uri == null) return;
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final gats = context.gatsColors;
    final raw = content.trim();
    if (raw.isEmpty) return const SizedBox.shrink();

    if (looksLikeHtml(raw)) {
      return LayoutBuilder(
        builder: (context, constraints) {
          final contentWidth = constraints.hasBoundedWidth
              ? constraints.maxWidth
              : MediaQuery.sizeOf(context).width;

          return Html(
            data: _makeHtmlImagesResponsive(raw),
            style: _htmlStyles(theme, gats, compact: compact),
            extensions: [
              ImageExtension(
                handleAssetImages: false,
                handleDataImages: false,
                builder: (extensionContext) {
                  final source = MediaUrl.resolve(
                    extensionContext.attributes['src'],
                  );
                  final alt = extensionContext.attributes['alt'];

                  if (source == null) {
                    return _RichImageError(width: contentWidth, label: alt);
                  }

                  return Padding(
                    padding: const EdgeInsets.symmetric(
                      vertical: AppSpacing.sm,
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(AppRadius.sm),
                      child: Image.network(
                        source,
                        width: contentWidth,
                        fit: BoxFit.fitWidth,
                        semanticLabel: alt?.isNotEmpty == true ? alt : null,
                        loadingBuilder: (context, child, progress) {
                          if (progress == null) return child;
                          return SizedBox(
                            width: contentWidth,
                            height: 160,
                            child: const Center(
                              child: CircularProgressIndicator(strokeWidth: 2),
                            ),
                          );
                        },
                        errorBuilder: (_, _, _) =>
                            _RichImageError(width: contentWidth, label: alt),
                      ),
                    ),
                  );
                },
              ),
            ],
            onLinkTap: (url, _, attributes) => _openLink(url),
          );
        },
      );
    }

    return MarkdownBody(
      data: raw,
      selectable: true,
      sizedImageBuilder: (config) => Padding(
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(AppRadius.sm),
          child: SizedBox(
            width: double.infinity,
            child: Image.network(
              config.uri.toString(),
              width: double.infinity,
              fit: BoxFit.fitWidth,
              semanticLabel: config.alt?.isNotEmpty == true ? config.alt : null,
              errorBuilder: (_, _, _) => Container(
                constraints: const BoxConstraints(minHeight: 120),
                alignment: Alignment.center,
                color: gats.surface,
                child: Icon(
                  Icons.broken_image_outlined,
                  color: gats.textSecondary,
                  size: 32,
                ),
              ),
            ),
          ),
        ),
      ),
      styleSheet: MarkdownStyleSheet.fromTheme(theme).copyWith(
        p: theme.textTheme.bodyLarge?.copyWith(
          height: 1.55,
          fontSize: compact ? 14 : 16,
          color: gats.textPrimary,
        ),
        h1: theme.textTheme.headlineMedium?.copyWith(
          fontWeight: FontWeight.w800,
          color: gats.textPrimary,
          height: 1.25,
        ),
        h2: theme.textTheme.headlineSmall?.copyWith(
          fontWeight: FontWeight.w800,
          color: gats.textPrimary,
          height: 1.3,
        ),
        h3: theme.textTheme.titleLarge?.copyWith(
          fontWeight: FontWeight.w700,
          color: gats.textPrimary,
          height: 1.35,
        ),
        h4: theme.textTheme.titleMedium?.copyWith(
          fontWeight: FontWeight.w700,
          color: gats.textPrimary,
        ),
        blockquote: theme.textTheme.bodyLarge?.copyWith(
          fontStyle: FontStyle.italic,
          color: gats.textSecondary,
        ),
        a: TextStyle(
          color: AppColors.accent,
          decoration: TextDecoration.underline,
        ),
        listBullet: theme.textTheme.bodyLarge?.copyWith(
          color: gats.textPrimary,
        ),
      ),
      onTapLink: (text, href, title) => _openLink(href),
    );
  }

  Map<String, Style> _htmlStyles(
    ThemeData theme,
    GatsThemeExtension gats, {
    required bool compact,
  }) {
    final bodySize = FontSize(compact ? 14 : 16);
    return {
      'body': Style(
        margin: Margins.zero,
        padding: HtmlPaddings.zero,
        fontSize: bodySize,
        lineHeight: const LineHeight(1.55),
        color: gats.textPrimary,
      ),
      'p': Style(
        margin: Margins.only(bottom: compact ? 8 : 12),
        fontSize: bodySize,
        lineHeight: const LineHeight(1.55),
        color: gats.textPrimary,
      ),
      'h1': Style(
        margin: Margins.only(top: compact ? 12 : 20, bottom: compact ? 8 : 12),
        fontSize: FontSize(compact ? 22 : 26),
        fontWeight: FontWeight.w800,
        color: gats.textPrimary,
        lineHeight: const LineHeight(1.25),
      ),
      'h2': Style(
        margin: Margins.only(top: compact ? 12 : 18, bottom: compact ? 6 : 10),
        fontSize: FontSize(compact ? 20 : 22),
        fontWeight: FontWeight.w800,
        color: gats.textPrimary,
        lineHeight: const LineHeight(1.3),
      ),
      'h3': Style(
        margin: Margins.only(top: compact ? 10 : 14, bottom: compact ? 6 : 8),
        fontSize: FontSize(compact ? 17 : 18),
        fontWeight: FontWeight.w700,
        color: gats.textPrimary,
        lineHeight: const LineHeight(1.35),
      ),
      'h4': Style(
        margin: Margins.only(top: 10, bottom: 6),
        fontSize: FontSize(16),
        fontWeight: FontWeight.w700,
        color: gats.textPrimary,
      ),
      'ul': Style(margin: Margins.only(bottom: 12, left: 8)),
      'ol': Style(margin: Margins.only(bottom: 12, left: 8)),
      'li': Style(
        margin: Margins.only(bottom: 4),
        fontSize: bodySize,
        color: gats.textPrimary,
      ),
      'blockquote': Style(
        margin: Margins.symmetric(vertical: 12),
        padding: HtmlPaddings.only(left: 14, top: 8, bottom: 8, right: 8),
        border: Border(left: BorderSide(color: AppColors.accent, width: 4)),
        fontStyle: FontStyle.italic,
        backgroundColor: AppColors.accent.withValues(alpha: 0.06),
        color: gats.textPrimary,
      ),
      'a': Style(
        color: AppColors.accent,
        textDecoration: TextDecoration.underline,
      ),
      'strong': Style(fontWeight: FontWeight.w700),
      'em': Style(fontStyle: FontStyle.italic),
      'img': Style(
        margin: Margins.symmetric(vertical: 12),
        width: Width(100, Unit.percent),
      ),
      'pre': Style(
        backgroundColor: const Color(0xFF0F172A),
        color: Colors.white,
        padding: HtmlPaddings.all(12),
        margin: Margins.symmetric(vertical: 12),
      ),
      'code': Style(
        backgroundColor: theme.colorScheme.surfaceContainerHighest,
        fontFamily: 'monospace',
        fontSize: FontSize(13),
      ),
    };
  }
}

class _RichImageError extends StatelessWidget {
  const _RichImageError({required this.width, this.label});

  final double width;
  final String? label;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return Container(
      width: width,
      constraints: const BoxConstraints(minHeight: 120),
      padding: const EdgeInsets.all(AppSpacing.md),
      alignment: Alignment.center,
      color: gats.surface,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.broken_image_outlined,
            color: gats.textSecondary,
            size: 32,
          ),
          if (label?.isNotEmpty == true) ...[
            const SizedBox(height: AppSpacing.sm),
            Text(
              label!,
              textAlign: TextAlign.center,
              style: TextStyle(color: gats.textSecondary, fontSize: 13),
            ),
          ],
        ],
      ),
    );
  }
}

/// Plain excerpt for cards (strips HTML / light markdown markers).
String postPlainExcerpt(String content, {int maxLen = 160}) {
  var plain = HtmlPlainText.from(content);
  plain = plain.replaceAll(RegExp(r'^#{1,6}\s+', multiLine: true), '');
  plain = plain.trim();
  if (plain.length <= maxLen) return plain;
  return '${plain.substring(0, maxLen - 3)}...';
}
