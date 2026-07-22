import 'package:flutter/material.dart';
import 'package:gats_academy/core/network/api_exception.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/data/api/quiz_api_service.dart';

/// Màn làm quiz — take/submit qua BE.
class QuizTakeScreen extends StatefulWidget {
  const QuizTakeScreen({
    super.key,
    required this.quizId,
    this.title,
  });

  final String quizId;
  final String? title;

  static Future<void> open(
    BuildContext context, {
    required String quizId,
    String? title,
  }) {
    return Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => QuizTakeScreen(quizId: quizId, title: title),
      ),
    );
  }

  @override
  State<QuizTakeScreen> createState() => _QuizTakeScreenState();
}

class _QuizTakeScreenState extends State<QuizTakeScreen> {
  QuizTakePayload? _quiz;
  String? _error;
  bool _loading = true;
  bool _submitting = false;
  QuizSubmitResult? _result;

  /// questionId → selected answer id (single) hoặc text.
  final Map<String, String> _selectedAnswerIds = {};
  final Map<String, TextEditingController> _textControllers = {};

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    for (final c in _textControllers.values) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
      _result = null;
    });
    try {
      final token = await AuthPrefs.accessToken();
      if (token == null || token.isEmpty) {
        throw StateError('Chưa đăng nhập');
      }
      final quiz = await QuizApiService.take(
        quizId: widget.quizId,
        token: token,
      );
      for (final q in quiz.questions) {
        if (!q.isChoice) {
          _textControllers[q.id] = TextEditingController();
        }
      }
      if (!mounted) return;
      setState(() {
        _quiz = quiz;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = e is ApiException ? e.message : 'Không tải được bài quiz.';
      });
    }
  }

  Future<void> _submit() async {
    final quiz = _quiz;
    if (quiz == null) return;
    setState(() => _submitting = true);
    try {
      final token = await AuthPrefs.accessToken();
      if (token == null) throw StateError('Chưa đăng nhập');

      final answers = <QuizSubmitAnswer>[];
      for (final q in quiz.questions) {
        if (q.isChoice) {
          final selected = _selectedAnswerIds[q.id];
          if (selected == null || selected.isEmpty) continue;
          answers.add(QuizSubmitAnswer(
            questionId: q.id,
            selectedAnswerId: selected,
          ));
        } else {
          final text = _textControllers[q.id]?.text.trim() ?? '';
          if (text.isEmpty) continue;
          answers.add(QuizSubmitAnswer(questionId: q.id, textAnswer: text));
        }
      }

      final result = await QuizApiService.submit(
        quizId: quiz.id,
        token: token,
        answers: answers,
      );
      if (!mounted) return;
      setState(() => _result = result);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            e is ApiException ? e.message : 'Nộp bài thất bại. Thử lại.',
          ),
        ),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final title = widget.title ?? _quiz?.title ?? 'Quiz';

    return Scaffold(
      backgroundColor: gats.background,
      appBar: AppBar(
        title: Text(title),
        backgroundColor: gats.surface,
        surfaceTintColor: Colors.transparent,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? _ErrorBody(message: _error!, onRetry: _load)
              : _result != null
                  ? _ResultBody(result: _result!, onDone: () => Navigator.pop(context))
                  : _QuizBody(
                      quiz: _quiz!,
                      selectedAnswerIds: _selectedAnswerIds,
                      textControllers: _textControllers,
                      submitting: _submitting,
                      onSelect: (qid, aid) {
                        setState(() => _selectedAnswerIds[qid] = aid);
                      },
                      onSubmit: _submit,
                    ),
    );
  }
}

class _ErrorBody extends StatelessWidget {
  const _ErrorBody({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: AppSpacing.lg),
            FilledButton(onPressed: onRetry, child: const Text('Thử lại')),
          ],
        ),
      ),
    );
  }
}

class _ResultBody extends StatelessWidget {
  const _ResultBody({required this.result, required this.onDone});

  final QuizSubmitResult result;
  final VoidCallback onDone;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Icon(Icons.check_circle_outline, size: 64, color: gats.lavenderAccent),
          const SizedBox(height: AppSpacing.lg),
          Text(
            'Kết quả: ${result.percentage.round()}%',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: gats.textPrimary,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            '${result.correctCount}/${result.totalQuestions} câu đúng · '
            '${result.score}/${result.maxScore} điểm'
            '${result.passed == true ? ' · Đạt' : result.passed == false ? ' · Chưa đạt' : ''}',
            textAlign: TextAlign.center,
            style: TextStyle(color: gats.textSecondary),
          ),
          const Spacer(),
          FilledButton(onPressed: onDone, child: const Text('Xong')),
        ],
      ),
    );
  }
}

class _QuizBody extends StatelessWidget {
  const _QuizBody({
    required this.quiz,
    required this.selectedAnswerIds,
    required this.textControllers,
    required this.submitting,
    required this.onSelect,
    required this.onSubmit,
  });

  final QuizTakePayload quiz;
  final Map<String, String> selectedAnswerIds;
  final Map<String, TextEditingController> textControllers;
  final bool submitting;
  final void Function(String questionId, String answerId) onSelect;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return Column(
      children: [
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.all(AppSpacing.lg),
            itemCount: quiz.questions.length,
            separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.lg),
            itemBuilder: (context, index) {
              final q = quiz.questions[index];
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Câu ${index + 1}. ${q.question}',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
                      color: gats.textPrimary,
                    ),
                  ),
                  if (q.description != null && q.description!.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(q.description!, style: TextStyle(color: gats.textSecondary)),
                  ],
                  const SizedBox(height: AppSpacing.sm),
                  if (q.isChoice)
                    ...q.answers.map((a) {
                      final selected = selectedAnswerIds[q.id] == a.id;
                      return RadioListTile<String>(
                        value: a.id,
                        groupValue: selectedAnswerIds[q.id],
                        onChanged: submitting
                            ? null
                            : (v) {
                                if (v != null) onSelect(q.id, v);
                              },
                        title: Text(a.answer),
                        dense: true,
                        activeColor: gats.lavenderAccent,
                        selected: selected,
                      );
                    })
                  else
                    TextField(
                      controller: textControllers[q.id],
                      enabled: !submitting,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        hintText: 'Nhập câu trả lời…',
                        border: OutlineInputBorder(),
                      ),
                    ),
                ],
              );
            },
          ),
        ),
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: SizedBox(
              width: double.infinity,
              height: 52,
              child: FilledButton(
                onPressed: submitting ? null : onSubmit,
                child: submitting
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Nộp bài'),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
