import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/starry_sky_background.dart';
import 'package:gats_academy/data/mock/mock_data.dart';
import 'package:gats_academy/features/flashcard/presentation/widgets/swipeable_flashcard.dart';

class FlashcardStudyScreen extends StatefulWidget {
  const FlashcardStudyScreen({super.key, required this.deck});

  final FlashcardDeck deck;

  @override
  State<FlashcardStudyScreen> createState() => _FlashcardStudyScreenState();
}

class _FlashcardStudyScreenState extends State<FlashcardStudyScreen> {
  late List<FlashcardItem> _queue;
  int _knownCount = 0;

  @override
  void initState() {
    super.initState();
    _queue = List.of(widget.deck.cards);
  }

  FlashcardItem? get _currentCard => _queue.isEmpty ? null : _queue.first;

  void _onKnown() => _answerCard(known: true);

  void _onUnknown() => _answerCard(known: false);

  void _answerCard({required bool known}) {
    if (_queue.isEmpty) return;
    setState(() {
      final card = _queue.removeAt(0);
      if (known) {
        _knownCount++;
      } else {
        _queue.add(card);
      }
    });
    if (_queue.isEmpty) _showSummary();
  }

  Future<void> _showSummary() async {
    final xp = _knownCount * 2;
    if (!mounted) return;
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(24, 24, 24, 40),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.celebration_outlined, size: 48, color: AppColors.accent),
              const SizedBox(height: 12),
              Text(AppStrings.flashcardSessionDone, style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              Text(
                'Đã thuộc $_knownCount / ${widget.deck.cards.length} thẻ',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 4),
              Text(
                AppStrings.flashcardXpEarned.replaceFirst('%d', '$xp'),
                style: const TextStyle(color: AppColors.success, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                    Navigator.of(context).pop(true);
                  },
                  child: const Text('Xong'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final card = _currentCard;
    final progress = widget.deck.cards.isEmpty
        ? 0.0
        : _knownCount / widget.deck.cards.length;

    final gats = context.gatsColors;
    return GatsThemedScaffold(
      appBar: AppBar(
        title: Text(widget.deck.title),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(4),
          child: LinearProgressIndicator(
            value: progress,
            minHeight: 4,
            backgroundColor: gats.divider,
            color: AppColors.accent,
          ),
        ),
      ),
      body: card == null
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                children: [
                  Text(
                    '$_knownCount / ${widget.deck.cards.length} đã thuộc',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  Expanded(
                    child: SwipeableFlashcard(
                      key: ValueKey(card.id),
                      card: card,
                      onKnown: _onKnown,
                      onUnknown: _onUnknown,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: _onUnknown,
                          icon: const Icon(Icons.close, color: AppColors.error),
                          label: Text(AppStrings.flashcardUnknown),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.error,
                            side: const BorderSide(color: AppColors.error),
                          ),
                        ),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: FilledButton.icon(
                          onPressed: _onKnown,
                          icon: const Icon(Icons.check),
                          label: Text(AppStrings.flashcardKnown),
                          style: FilledButton.styleFrom(backgroundColor: AppColors.success),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
    );
  }
}
