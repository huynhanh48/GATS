import 'package:flutter/material.dart';
import 'package:gats_academy/core/services/review_prompt_service.dart';
import 'package:gats_academy/core/widgets/rate_app_sheet.dart';

Future<void> handleCoreTaskCompleted(BuildContext context) async {
  await ReviewPromptService.incrementCoreTaskCompletion();
  if (!context.mounted) return;
  if (!await ReviewPromptService.shouldShowPostTaskPrompt()) return;
  if (!context.mounted) return;
  await ReviewPromptService.recordPromptShown();
  if (!context.mounted) return;
  await RateAppSheet.show(context);
}
