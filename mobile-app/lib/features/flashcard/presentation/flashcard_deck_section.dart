import 'package:flutter/material.dart';
import 'package:gats_academy/core/navigation/gats_main_navigator.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/section_card.dart';
import 'package:gats_academy/core/widgets/ui_components.dart';
import 'package:gats_academy/data/api/flashcard_api_service.dart';
import 'package:gats_academy/data/mock/mock_data.dart';
import 'package:gats_academy/features/flashcard/presentation/flashcard_study_screen.dart';
import 'package:gats_academy/features/home/data/mobile_bootstrap_store.dart';

class FlashcardDeckSection extends StatefulWidget {
  const FlashcardDeckSection({super.key, this.onSessionComplete});

  final VoidCallback? onSessionComplete;

  @override
  State<FlashcardDeckSection> createState() => _FlashcardDeckSectionState();
}

class _FlashcardDeckSectionState extends State<FlashcardDeckSection> {
  List<FlashcardDeck> _decks = const [];
  bool _loading = true;
  bool _fromApi = false;

  @override
  void initState() {
    super.initState();
    _loadDue();
  }

  Future<void> _loadDue() async {
    if (!MobileBootstrapStore.instance.isFeatureEnabled('flashcards')) {
      if (mounted) setState(() => _loading = false);
      return;
    }

    final token = await AuthPrefs.accessToken();
    if (token == null || token.isEmpty) {
      if (mounted) {
        setState(() {
          _decks = MockData.flashcardDecks;
          _fromApi = false;
          _loading = false;
        });
      }
      return;
    }

    try {
      final cards = await FlashcardApiService.due(token: token);
      if (!mounted) return;
      setState(() {
        _fromApi = true;
        _loading = false;
        _decks = FlashcardApiService.groupDueByDeck(cards);
      });
    } catch (e) {
      debugPrint('FlashcardDeckSection: due API failed — $e');
      if (!mounted) return;
      setState(() {
        // Offline fallback only — do not merge with API decks.
        _decks = MockData.flashcardDecks;
        _fromApi = false;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!MobileBootstrapStore.instance.isFeatureEnabled('flashcards')) {
      return const SizedBox.shrink();
    }

    if (_loading) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: AppSpacing.lg),
        child: Center(child: CircularProgressIndicator()),
      );
    }

    final totalDue = _decks.fold<int>(0, (s, d) => s + d.dueToday);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionHeader(
          title: AppStrings.flashcardSectionTitle,
          subtitle: AppStrings.flashcardDue.replaceFirst('%d', '$totalDue'),
        ),
        const SizedBox(height: AppSpacing.md),
        if (_decks.isEmpty)
          Text(
            'Không có thẻ đến hạn hôm nay.',
            style: Theme.of(context).textTheme.bodyMedium,
          )
        else
          ..._decks.map((deck) {
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
                            deck.moduleName,
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.9),
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 2),
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
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.style_outlined,
                            color: Colors.white,
                            size: 16,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            AppStrings.startFlashcard,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                              fontSize: 12,
                            ),
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
    final completed = await GatsMainNavigator.push<bool>(
      context,
      FlashcardStudyScreen(deck: deck, syncToServer: _fromApi),
    );
    if (completed == true) {
      widget.onSessionComplete?.call();
      await _loadDue();
    }
  }
}
