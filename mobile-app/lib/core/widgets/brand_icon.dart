import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:gats_academy/core/constants/app_assets.dart';

enum BrandIconType { google, apple, facebook, youtube, tiktok, momo }

class BrandIcon extends StatelessWidget {
  const BrandIcon({
    super.key,
    required this.type,
    this.size = 24,
  });

  final BrandIconType type;
  final double size;

  static const _assetByType = {
    BrandIconType.apple: AppAssets.brandApple,
    BrandIconType.facebook: AppAssets.brandFacebook,
    BrandIconType.youtube: AppAssets.brandYoutube,
    BrandIconType.tiktok: AppAssets.brandTiktok,
  };

  @override
  Widget build(BuildContext context) {
    if (type == BrandIconType.momo) {
      return _MoMoIcon(size: size);
    }
    // Google: CustomPaint — tránh SVG asset lỗi render trên một số build.
    if (type == BrandIconType.google) {
      return SizedBox.square(
        dimension: size,
        child: CustomPaint(painter: _GoogleGPainter()),
      );
    }

    return SizedBox.square(
      dimension: size,
      child: SvgPicture.asset(
        _assetByType[type]!,
        width: size,
        height: size,
        fit: BoxFit.contain,
        placeholderBuilder: (_) => Icon(
          Icons.broken_image_outlined,
          size: size * 0.7,
          color: Colors.grey,
        ),
      ),
    );
  }
}

/// Official-style Google "G" (4-color) — không phụ thuộc file SVG.
class _GoogleGPainter extends CustomPainter {
  static const _blue = Color(0xFF4285F4);
  static const _green = Color(0xFF34A853);
  static const _yellow = Color(0xFFFBBC05);
  static const _red = Color(0xFFEA4335);

  @override
  void paint(Canvas canvas, Size size) {
    final s = size.shortestSide;
    final stroke = s * 0.18;
    final radius = (s - stroke) / 2;
    final center = Offset(s / 2, s / 2);
    final rect = Rect.fromCircle(center: center, radius: radius);

    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..strokeCap = StrokeCap.butt;

    paint.color = _blue;
    canvas.drawArc(rect, -0.35, 1.55, false, paint);

    paint.color = _green;
    canvas.drawArc(rect, 1.2, 1.35, false, paint);

    paint.color = _yellow;
    canvas.drawArc(rect, 2.55, 1.0, false, paint);

    paint.color = _red;
    canvas.drawArc(rect, 3.55, 1.35, false, paint);

    final barPaint = Paint()
      ..color = _blue
      ..style = PaintingStyle.fill;
    final barH = stroke;
    final barTop = center.dy - barH / 2;
    final barLeft = center.dx - s * 0.02;
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(barLeft, barTop, s * 0.42, barH),
        Radius.circular(barH * 0.15),
      ),
      barPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _MoMoIcon extends StatelessWidget {
  const _MoMoIcon({required this.size});

  static const _pink = Color(0xFFA50064);

  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: _pink,
        borderRadius: BorderRadius.circular(size * 0.22),
      ),
      padding: EdgeInsets.all(size * 0.12),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _MoMoRow(size: size),
          SizedBox(height: size * 0.04),
          _MoMoRow(size: size),
        ],
      ),
    );
  }
}

class _MoMoRow extends StatelessWidget {
  const _MoMoRow({required this.size});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _MoMoCell(size: size, text: 'm'),
        SizedBox(width: size * 0.05),
        _MoMoCell(size: size, text: 'o'),
      ],
    );
  }
}

class _MoMoCell extends StatelessWidget {
  const _MoMoCell({required this.size, required this.text});

  final double size;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size * 0.34,
      height: size * 0.34,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(size * 0.08),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: _MoMoIcon._pink,
          fontSize: size * 0.2,
          fontWeight: FontWeight.w900,
          height: 1,
          decoration: TextDecoration.none,
        ),
      ),
    );
  }
}
