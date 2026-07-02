import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/app_theme.dart';

class AuthDecorativeHeader extends StatelessWidget {
  const AuthDecorativeHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 80,
      child: Stack(
        children: [
          Positioned(left: 24, top: 10, child: _ring(36, 2)),
          Positioned(right: 40, top: 0, child: _ring(52, 3.5)),
          Positioned(left: 80, top: 46, child: _ring(22, 2)),
          Positioned(right: 24, top: 62, child: _ring(28, 2.5)),
        ],
      ),
    );
  }

  Widget _ring(double size, double stroke) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(
          color: AppColors.primary.withValues(alpha: 0.15),
          width: stroke,
        ),
      ),
    );
  }
}
