import 'package:flutter/material.dart';
import 'package:gats_academy/core/l10n/l10n.dart';
import 'package:gats_academy/core/utils/runtime_env.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/gats_logo.dart';

/// Splash Flutter — nền trắng + chữ brand + shimmer (sau native launch screen).
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with TickerProviderStateMixin {
  late AnimationController _shimmerController;
  late AnimationController _enterController;
  late Animation<double> _fadeIn;

  @override
  void initState() {
    super.initState();
    _enterController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 450),
    )..forward();
    _fadeIn = CurvedAnimation(parent: _enterController, curve: Curves.easeOut);

    _shimmerController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat();
  }

  @override
  void dispose() {
    _enterController.dispose();
    _shimmerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final textStyle = AppTypography.style(
      fontSize: 28,
      fontWeight: FontWeight.w800,
      color: AppColors.textPrimary,
      letterSpacing: -0.6,
      height: 1,
    );

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: Center(
        child: AnimatedBuilder(
          animation: _shimmerController,
          builder: (context, child) {
            final t = _shimmerController.value;
            final sweep = (t * 2) % 1.0;

            return FadeTransition(
              opacity: _fadeIn,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const GatsLogoMark(size: 72, showShadow: true),
                  const SizedBox(height: 20),
                  ShaderMask(
                    blendMode: BlendMode.srcIn,
                    shaderCallback: (bounds) {
                      return LinearGradient(
                        begin: Alignment.centerLeft,
                        end: Alignment.centerRight,
                        colors: const [
                          AppColors.textPrimary,
                          AppColors.textPrimary,
                          Color(0xFFB8C4D9),
                          Colors.white,
                          Color(0xFFB8C4D9),
                          AppColors.textPrimary,
                          AppColors.textPrimary,
                        ],
                        stops: [
                          0,
                          (sweep - 0.22).clamp(0.0, 1.0),
                          (sweep - 0.08).clamp(0.0, 1.0),
                          sweep.clamp(0.0, 1.0),
                          (sweep + 0.08).clamp(0.0, 1.0),
                          (sweep + 0.22).clamp(0.0, 1.0),
                          1,
                        ],
                      ).createShader(bounds);
                    },
                    child: Text(
                      l10n.appName,
                      textAlign: TextAlign.center,
                      style: textStyle.copyWith(color: Colors.white),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

/// Thời gian tối thiểu splash để người dùng thấy animation.
Duration splashMinDuration() {
  if (isFlutterTest) return Duration.zero;
  return const Duration(milliseconds: 1600);
}
