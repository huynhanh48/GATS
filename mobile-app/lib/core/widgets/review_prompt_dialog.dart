import 'package:flutter/material.dart';
import 'package:gats_academy/core/l10n/l10n.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/rate_app_sheet.dart';

/// Result: `true` = user tapped Rate, `false` = No thanks.
typedef ReviewPromptResult = bool;

abstract final class ReviewPromptDialog {
  static Future<ReviewPromptResult?> show(BuildContext context) {
    return showDialog<ReviewPromptResult>(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) => const _ReviewPromptDialog(),
    );
  }
}

class _ReviewPromptDialog extends StatefulWidget {
  const _ReviewPromptDialog();

  @override
  State<_ReviewPromptDialog> createState() => _ReviewPromptDialogState();
}

class _ReviewPromptDialogState extends State<_ReviewPromptDialog> {
  bool _isSubmitting = false;

  Future<void> _onRate() async {
    if (_isSubmitting) return;
    setState(() => _isSubmitting = true);
    try {
      await RateAppSheet.requestNativeReview();
      if (!mounted) return;
      Navigator.of(context).pop(true);
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final gats = context.gatsColors;

    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.lg)),
      title: Text(
        l10n.reviewDialogTitle,
        style: const TextStyle(fontWeight: FontWeight.w800),
      ),
      content: Text(
        l10n.reviewDialogBody,
        style: TextStyle(color: gats.textSecondary, height: 1.45),
      ),
      actionsAlignment: MainAxisAlignment.spaceBetween,
      actions: [
        TextButton(
          onPressed: _isSubmitting ? null : () => Navigator.of(context).pop(false),
          child: Text(l10n.reviewDialogNoThanks),
        ),
        FilledButton(
          onPressed: _isSubmitting ? null : _onRate,
          child: _isSubmitting
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                )
              : Text(l10n.reviewDialogRate),
        ),
      ],
    );
  }
}
