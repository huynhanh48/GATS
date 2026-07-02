import 'dart:math';
import 'package:flutter/material.dart';
import 'package:gats_academy/core/services/cart_controller.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/xp_popup.dart';
import 'package:gats_academy/core/constants/app_strings.dart';

class CheckoutSuccessDialog extends StatefulWidget {
  const CheckoutSuccessDialog({super.key, required this.userId});

  final String userId;

  @override
  State<CheckoutSuccessDialog> createState() => _CheckoutSuccessDialogState();
}

class _CheckoutSuccessDialogState extends State<CheckoutSuccessDialog>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late List<_ConfettiParticle> _particles;
  final Random _random = Random();

  @override
  void initState() {
    super.initState();
    // Complete checkout logic in CartController
    CartController.instance.checkout(widget.userId);

    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    );

    _scaleAnimation = CurvedAnimation(
      parent: _controller,
      curve: const Interval(0.0, 0.4, curve: Curves.elasticOut),
    );

    _generateParticles();
    _controller.forward();
  }

  void _generateParticles() {
    _particles = List.generate(45, (index) {
      final angle = _random.nextDouble() * 2 * pi;
      final speed = 30.0 + _random.nextDouble() * 120.0;
      final size = 5.0 + _random.nextDouble() * 10.0;
      final color = [
        const Color(0xFF0070EB), // Primary Blue
        const Color(0xFFFF7622), // Accent Orange
        const Color(0xFFEC4899), // Pink Store color
        const Color(0xFF10B981), // Emerald Success
        const Color(0xFFFBBF24), // Amber star
      ][_random.nextInt(5)];

      return _ConfettiParticle(
        angle: angle,
        speed: speed,
        size: size,
        color: color,
        rotationSpeed: -3.0 + _random.nextDouble() * 6.0,
      );
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      backgroundColor: Colors.transparent,
      elevation: 0,
      child: Stack(
        alignment: Alignment.center,
        clipBehavior: Clip.none,
        children: [
          // Background Card
          Container(
            width: 320,
            padding: const EdgeInsets.fromLTRB(24, 60, 24, 24),
            decoration: BoxDecoration(
              color: gats.surface,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.15),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  AppStrings.checkoutSuccessTitle,
                  textAlign: TextAlign.center,
                  style: AppTypography.style(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: gats.textPrimary,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  AppStrings.checkoutSuccessDesc,
                  textAlign: TextAlign.center,
                  style: AppTypography.style(
                    fontSize: 13,
                    color: gats.textSecondary,
                    height: 1.45,
                  ),
                ),
                const SizedBox(height: 24),
                
                // Primary CTA
                FilledButton(
                  style: FilledButton.styleFrom(
                    backgroundColor: gats.lavenderAccent,
                    foregroundColor: gats.isStarry ? AppColors.nightSkyBottom : Colors.white,
                    minimumSize: const Size.fromHeight(48),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                  ),
                  onPressed: () {
                    // Close success dialog
                    Navigator.pop(context); // Pop dialog
                    Navigator.pop(context); // Pop Cart Screen (goes back to store or main shell)
                    
                    // Show a fun XP reward popup on main dashboard
                    WidgetsBinding.instance.addPostFrameCallback((_) {
                      XpPopup.show(
                        Navigator.of(context).overlay!.context,
                        xp: 150, // Reward XP for checkout
                      );
                    });
                  },
                  child: Text(
                    AppStrings.checkoutStartLearning,
                    style: AppTypography.style(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Confetti sparks overlay behind checkmark
          Positioned(
            top: -50,
            child: AnimatedBuilder(
              animation: _controller,
              builder: (context, _) {
                return CustomPaint(
                  size: const Size(120, 120),
                  painter: _ConfettiPainter(
                    particles: _particles,
                    progress: _controller.value,
                  ),
                );
              },
            ),
          ),

          // Animated Checkmark on Top
          Positioned(
            top: -40,
            child: ScaleTransition(
              scale: _scaleAnimation,
              child: Container(
                width: 80,
                height: 80,
                decoration: const BoxDecoration(
                  color: Color(0xFF10B981), // Emerald Success
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Color(0x3310B981),
                      blurRadius: 12,
                      spreadRadius: 4,
                      offset: Offset(0, 4),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.check,
                  color: Colors.white,
                  size: 44,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ConfettiParticle {
  _ConfettiParticle({
    required this.angle,
    required this.speed,
    required this.size,
    required this.color,
    required this.rotationSpeed,
  });

  final double angle;
  final double speed;
  final double size;
  final Color color;
  final double rotationSpeed;
}

class _ConfettiPainter extends CustomPainter {
  _ConfettiPainter({required this.particles, required this.progress});

  final List<_ConfettiParticle> particles;
  final double progress;

  @override
  void paint(Canvas canvas, Size size) {
    if (progress <= 0.05) return;

    final center = Offset(size.width / 2, size.height / 2);
    final paint = Paint()..style = PaintingStyle.fill;

    for (final p in particles) {
      // Linear gravity/drag effect
      final distance = p.speed * progress * (1.0 - progress * 0.4);
      final x = center.dx + cos(p.angle) * distance;
      final y = center.dy + sin(p.angle) * distance + (progress * progress * 50.0); // Gravity drop

      paint.color = p.color.withValues(alpha: 1.0 - progress);

      canvas.save();
      canvas.translate(x, y);
      canvas.rotate(p.rotationSpeed * progress * pi);
      
      // Draw small colorful square / rectangle confetti shards
      final rect = Rect.fromCenter(center: Offset.zero, width: p.size, height: p.size);
      canvas.drawRect(rect, paint);
      
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
