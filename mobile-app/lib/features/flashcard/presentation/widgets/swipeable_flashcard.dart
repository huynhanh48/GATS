import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_shadows.dart';
import 'package:gats_academy/core/theme/app_spacing.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/ui_components.dart';
import 'package:gats_academy/data/mock/mock_data.dart';

class SwipeableFlashcard extends StatefulWidget {
  const SwipeableFlashcard({
    super.key,
    required this.card,
    required this.onKnown,
    required this.onUnknown,
  });

  final FlashcardItem card;
  final VoidCallback onKnown;
  final VoidCallback onUnknown;

  @override
  State<SwipeableFlashcard> createState() => _SwipeableFlashcardState();
}

class _SwipeableFlashcardState extends State<SwipeableFlashcard> {
  bool _isFlipped = false;
  Offset _dragOffset = Offset.zero;

  static const _threshold = 80.0;

  void _onDragEnd(DragEndDetails details) {
    if (_dragOffset.dx > _threshold) {
      _flyOff(1);
    } else if (_dragOffset.dx < -_threshold) {
      _flyOff(-1);
    } else {
      setState(() => _dragOffset = Offset.zero);
    }
  }

  Future<void> _flyOff(int direction) async {
    setState(() => _dragOffset = Offset(direction * 400, 0));
    await Future<void>.delayed(const Duration(milliseconds: 200));
    if (!mounted) return;
    if (direction > 0) {
      widget.onKnown();
    } else {
      widget.onUnknown();
    }
    setState(() {
      _dragOffset = Offset.zero;
      _isFlipped = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final dragX = _dragOffset.dx;
    final knowOpacity = (dragX / _threshold).clamp(0.0, 1.0);
    final unknownOpacity = (-dragX / _threshold).clamp(0.0, 1.0);

    return GestureDetector(
      onPanUpdate: (d) => setState(() => _dragOffset += d.delta),
      onPanEnd: _onDragEnd,
      onTap: () => setState(() => _isFlipped = !_isFlipped),
      behavior: HitTestBehavior.opaque,
      child: Transform.translate(
        offset: _dragOffset,
        child: Transform.rotate(
          angle: dragX * 0.0008,
          child: Stack(
            alignment: Alignment.center,
            children: [
              if (knowOpacity > 0)
                Positioned(
                  top: 24,
                  right: 24,
                  child: Opacity(
                    opacity: knowOpacity,
                    child: const Icon(Icons.check_circle, color: AppColors.success, size: 48),
                  ),
                ),
              if (unknownOpacity > 0)
                Positioned(
                  top: 24,
                  left: 24,
                  child: Opacity(
                    opacity: unknownOpacity,
                    child: const Icon(Icons.cancel, color: AppColors.error, size: 48),
                  ),
                ),
              FlipCard(
                isFlipped: _isFlipped,
                front: _CardFace(
                  text: widget.card.front,
                  hint: widget.card.hint ?? AppStrings.flashcardTapFlip,
                  isBack: false,
                ),
                back: _CardFace(text: widget.card.back, hint: null, isBack: true),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CardFace extends StatelessWidget {
  const _CardFace({required this.text, required this.hint, required this.isBack});

  final String text;
  final String? hint;
  final bool isBack;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: 320,
      padding: const EdgeInsets.all(AppSpacing.xl),
      decoration: BoxDecoration(
        gradient: isBack ? AppGradients.cardSoft : AppGradients.primary,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        boxShadow: AppShadows.elevated,
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            text,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: isBack ? AppColors.textPrimary : Colors.white,
              height: 1.4,
            ),
          ),
          if (hint != null) ...[
            const SizedBox(height: AppSpacing.lg),
            Text(
              hint!,
              style: TextStyle(
                fontSize: 12,
                color: Colors.white.withValues(alpha: 0.7),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
