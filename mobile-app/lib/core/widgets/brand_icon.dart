import 'dart:math' as math;

import 'package:flutter/material.dart';

enum BrandIconType { google, apple, facebook, youtube, tiktok, momo }

class BrandIcon extends StatelessWidget {
  const BrandIcon({
    super.key,
    required this.type,
    this.size = 28,
  });

  final BrandIconType type;
  final double size;

  @override
  Widget build(BuildContext context) {
    return SizedBox.square(
      dimension: size,
      child: switch (type) {
        BrandIconType.google => CustomPaint(painter: _GooglePainter()),
        BrandIconType.apple => Icon(Icons.apple, size: size, color: Colors.black),
        BrandIconType.facebook => _FacebookIcon(size: size),
        BrandIconType.youtube => _YouTubeIcon(size: size),
        BrandIconType.tiktok => _TikTokIcon(size: size),
        BrandIconType.momo => _MoMoIcon(size: size),
      },
    );
  }
}

class _GooglePainter extends CustomPainter {
  static const _blue = Color(0xFF4285F4);
  static const _red = Color(0xFFEA4335);
  static const _yellow = Color(0xFFFBBC05);
  static const _green = Color(0xFF34A853);

  @override
  void paint(Canvas canvas, Size size) {
    final stroke = size.width * 0.16;
    final rect = Rect.fromLTWH(stroke / 2, stroke / 2, size.width - stroke, size.height - stroke);
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..strokeCap = StrokeCap.round;

    void arc(Color color, double start, double sweep) {
      paint.color = color;
      canvas.drawArc(rect, start, sweep, false, paint);
    }

    arc(_blue, -0.08 * math.pi, 0.50 * math.pi);
    arc(_green, 0.45 * math.pi, 0.48 * math.pi);
    arc(_yellow, 0.90 * math.pi, 0.38 * math.pi);
    arc(_red, 1.22 * math.pi, 0.58 * math.pi);

    final barPaint = Paint()
      ..color = _blue
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..strokeCap = StrokeCap.square;
    canvas.drawLine(
      Offset(size.width * 0.54, size.height * 0.50),
      Offset(size.width * 0.88, size.height * 0.50),
      barPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _FacebookIcon extends StatelessWidget {
  const _FacebookIcon({required this.size});

  final double size;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(
        shape: BoxShape.circle,
        color: Color(0xFF1877F2),
      ),
      child: Center(
        child: Text(
          'f',
          style: TextStyle(
            color: Colors.white,
            fontSize: size * 0.82,
            fontWeight: FontWeight.w800,
            height: 0.95,
            fontFamily: 'Arial',
          ),
        ),
      ),
    );
  }
}

class _YouTubeIcon extends StatelessWidget {
  const _YouTubeIcon({required this.size});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        width: size,
        height: size * 0.70,
        decoration: BoxDecoration(
          color: const Color(0xFFFF0000),
          borderRadius: BorderRadius.circular(size * 0.18),
        ),
        child: Icon(
          Icons.play_arrow_rounded,
          color: Colors.white,
          size: size * 0.62,
        ),
      ),
    );
  }
}

class _TikTokIcon extends StatelessWidget {
  const _TikTokIcon({required this.size});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        Transform.translate(
          offset: Offset(-size * 0.07, size * 0.05),
          child: Icon(Icons.music_note_rounded, color: const Color(0xFF25F4EE), size: size),
        ),
        Transform.translate(
          offset: Offset(size * 0.07, -size * 0.03),
          child: Icon(Icons.music_note_rounded, color: const Color(0xFFFE2C55), size: size),
        ),
        Icon(Icons.music_note_rounded, color: Colors.black, size: size),
      ],
    );
  }
}

class _MoMoIcon extends StatelessWidget {
  const _MoMoIcon({required this.size});

  static const _pink = Color(0xFFA50064);

  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: _pink,
        borderRadius: BorderRadius.circular(size * 0.22),
      ),
      padding: EdgeInsets.all(size * 0.10),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _MoMoRow(size: size),
          SizedBox(height: size * 0.05),
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
      width: size * 0.31,
      height: size * 0.31,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(size * 0.07),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: _MoMoIcon._pink,
          fontSize: size * 0.19,
          fontWeight: FontWeight.w900,
          height: 1,
        ),
      ),
    );
  }
}
