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
    BrandIconType.google: AppAssets.brandGoogle,
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

    return SizedBox.square(
      dimension: size,
      child: SvgPicture.asset(
        _assetByType[type]!,
        width: size,
        height: size,
        fit: BoxFit.contain,
      ),
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
