import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_assets.dart';
import 'package:gats_academy/core/theme/app_theme.dart';

/// Precache nền đêm một lần — các màn sau chỉ blit texture đã decode.
abstract final class StarrySkyBackgroundCache {
  static const asset = AssetImage(AppAssets.starrySkyBackground);

  static bool _precached = false;

  static Future<void> ensurePrecached(BuildContext context) async {
    if (_precached) return;
    await precacheImage(asset, context);
    _precached = true;
  }
}

/// Nền gradient đêm + sao + mây — raster PNG (cùng thuật toán CustomPaint cũ).
///
/// PNG/WebP phù hợp hơn SVG ở đây: decode một lần, GPU vẽ một texture.
/// SVG vẫn phải rasterize mỗi kích thước và thường không nhẹ hơn cho nền phức tạp.
class StarrySkyBackground extends StatelessWidget {
  const StarrySkyBackground({
    super.key,
    required this.child,
    this.showMoon = true,
  });

  final Widget child;
  final bool showMoon;

  @override
  Widget build(BuildContext context) {
    final dpr = MediaQuery.devicePixelRatioOf(context);
    final width = MediaQuery.sizeOf(context).width;
    final cacheWidth = (width * dpr).round().clamp(360, 1440);

    return Stack(
      fit: StackFit.expand,
      children: [
        RepaintBoundary(
          child: Image.asset(
            AppAssets.starrySkyBackground,
            fit: BoxFit.cover,
            alignment: Alignment.topCenter,
            filterQuality: FilterQuality.medium,
            cacheWidth: cacheWidth,
            gaplessPlayback: true,
            excludeFromSemantics: true,
          ),
        ),
        if (showMoon)
          Positioned(
            top: MediaQuery.paddingOf(context).top + 8,
            left: 24,
            child: Opacity(
              opacity: 0.9,
              child: Image.asset(
                AppAssets.starryMoonGlow,
                width: 72,
                height: 72,
                fit: BoxFit.contain,
                filterQuality: FilterQuality.medium,
              ),
            ),
          ),
        child,
      ],
    );
  }
}

/// Bọc scaffold chính — tự bật trời sao khi dark mode.
class GatsThemedScaffold extends StatelessWidget {
  const GatsThemedScaffold({
    super.key,
    required this.body,
    this.appBar,
    this.bottomNavigationBar,
    this.floatingActionButton,
    this.extendBody = false,
    this.showStarryBackground = true,
  });

  final Widget body;
  final PreferredSizeWidget? appBar;
  final Widget? bottomNavigationBar;
  final Widget? floatingActionButton;
  final bool extendBody;

  /// false khi màn nằm trên shell đã có nền sao (tránh vẽ lại).
  final bool showStarryBackground;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final content = Scaffold(
      backgroundColor: gats.isStarry ? Colors.transparent : gats.background,
      extendBody: extendBody,
      appBar: appBar,
      body: body,
      bottomNavigationBar: bottomNavigationBar,
      floatingActionButton: floatingActionButton,
    );

    if (!gats.isStarry || !showStarryBackground) return content;

    return StarrySkyBackground(child: content);
  }
}
