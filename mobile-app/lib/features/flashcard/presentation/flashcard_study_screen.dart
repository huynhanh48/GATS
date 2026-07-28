import 'dart:math';

import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/starry_sky_background.dart';
import 'package:gats_academy/data/api/flashcard_api_service.dart';
import 'package:gats_academy/data/mock/mock_data.dart';
import 'package:gats_academy/features/flashcard/presentation/widgets/swipeable_flashcard.dart';

class FlashcardStudyScreen extends StatefulWidget {
  const FlashcardStudyScreen({
    super.key,
    required this.deck,
    this.syncToServer = false,
  });

  final FlashcardDeck deck;
  final bool syncToServer;

  @override
  State<FlashcardStudyScreen> createState() => _FlashcardStudyScreenState();
}

class _FlashcardStudyScreenState extends State<FlashcardStudyScreen> {
  late List<FlashcardItem> _queue;
  int _knownCount = 0;
  int _syncedCount = 0;
  final _pendingReviews = <Map<String, dynamic>>[];

  static final _uuidRe = RegExp(
    r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
  );

  @override
  void initState() {
    super.initState();
    _queue = List.of(widget.deck.cards);
  }

  FlashcardItem? get _currentCard => _queue.isEmpty ? null : _queue.first;

  void _onKnown() => _answerCard(known: true);

  void _onUnknown() => _answerCard(known: false);

  Future<void> _answerCard({required bool known}) async {
    if (_queue.isEmpty) return;
    final card = _queue.first;
    setState(() {
      _queue.removeAt(0);
      if (known) {
        _knownCount++;
      } else {
        _queue.add(card);
      }
    });

    if (widget.syncToServer && _uuidRe.hasMatch(card.id)) {
      _pendingReviews.add({
        'eventId': _uuidV4(),
        'cardId': card.id,
        'rating': known ? 'good' : 'again',
        'occurredAt': DateTime.now().toUtc().toIso8601String(),
      });
      await _flushReviews();
    }

    if (_queue.isEmpty) await _showSummary();
  }

  Future<void> _flushReviews() async {
    if (_pendingReviews.isEmpty) return;
    final token = await AuthPrefs.accessToken();
    if (token == null || token.isEmpty) return;
    final batch = List<Map<String, dynamic>>.from(_pendingReviews);
    _pendingReviews.clear();
    try {
      await FlashcardApiService.syncReviews(token: token, reviews: batch);
      _syncedCount += batch.length;
    } catch (e) {
      debugPrint('FlashcardStudyScreen: syncReviews failed — $e');
      _pendingReviews.insertAll(0, batch);
    }
  }

  Future<void> _showSummary() async {
    await _flushReviews();
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
              const Icon(
                Icons.celebration_outlined,
                size: 48,
                color: AppColors.accent,
              ),
              const SizedBox(height: 12),
              Text(
                AppStrings.flashcardSessionDone,
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              Text(
                'Đã thuộc $_knownCount / ${widget.deck.cards.length} thẻ',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              if (widget.syncToServer) ...[
                const SizedBox(height: 4),
                Text(
                  _syncedCount > 0
                      ? 'Đã đồng bộ $_syncedCount lượt ôn lên server'
                      : 'Chưa đồng bộ được — sẽ thử lại khi có mạng',
                  style: TextStyle(
                    color: _syncedCount > 0
                        ? AppColors.success
                        : AppColors.error,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
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
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.deck.title),
            if (widget.deck.courseTitle != null &&
                widget.deck.courseTitle!.trim().isNotEmpty)
              Text(
                widget.deck.courseTitle!,
                style: Theme.of(context).textTheme.bodySmall,
              )
            else if (widget.deck.moduleName.trim().isNotEmpty)
              Text(
                widget.deck.moduleName,
                style: Theme.of(context).textTheme.bodySmall,
              ),
          ],
        ),
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
                          style: FilledButton.styleFrom(
                            backgroundColor: AppColors.success,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
    );
  }

  static String _uuidV4() {
    final r = Random.secure();
    final bytes = List<int>.generate(16, (_) => r.nextInt(256));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    final h = bytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join();
    return '${h.substring(0, 8)}-${h.substring(8, 12)}-${h.substring(12, 16)}-'
        '${h.substring(16, 20)}-${h.substring(20)}';
  }
}
