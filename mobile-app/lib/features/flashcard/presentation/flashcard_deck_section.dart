import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_spacing.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/section_card.dart';
import 'package:gats_academy/core/widgets/ui_components.dart';
import 'package:gats_academy/data/mock/mock_data.dart';
import 'package:gats_academy/features/flashcard/presentation/flashcard_study_screen.dart';

class FlashcardDeckSection extends StatelessWidget {
  const FlashcardDeckSection({super.key, this.onSessionComplete});

  final VoidCallback? onSessionComplete;

  @override
  Widget build(BuildContext context) {
    final totalDue = MockData.flashcardDecks.fold<int>(0, (s, d) => s + d.dueToday);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionHeader(
          title: AppStrings.flashcardSectionTitle,
          subtitle: AppStrings.flashcardDue.replaceFirst('%d', '$totalDue'),
        ),
        const SizedBox(height: AppSpacing.md),
        ...MockData.flashcardDecks.map((deck) {
          return Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.md),
            child: GradientCard(
              gradient: AppGradients.courseCover(deck.id.hashCode),
              onTap: () => _openDeck(context, deck),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          deck.title,
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                            fontSize: 16,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${deck.cards.length} thẻ · ${deck.dueToday} cần ôn',
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.85),
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.style_outlined, color: Colors.white, size: 16),
                        SizedBox(width: 4),
                        Text(
                          AppStrings.startFlashcard,
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  Future<void> _openDeck(BuildContext context, FlashcardDeck deck) async {
    final completed = await Navigator.of(context).push<bool>(
      MaterialPageRoute<bool>(
        builder: (_) => FlashcardStudyScreen(deck: deck),
      ),
    );
    if (completed == true) onSessionComplete?.call();
  }
}
