import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_assets.dart';
import 'package:gats_academy/core/l10n/l10n.dart';
import 'package:gats_academy/core/theme/app_theme.dart';

/// Welcome toàn màn hình với coach và CTA đăng nhập.
class EntryScreen extends StatelessWidget {
  const EntryScreen({
    super.key,
    required this.onContinue,
    required this.onSignIn,
  });

  final VoidCallback onContinue;
  final VoidCallback onSignIn;

  static const _horizontalPadding = 28.0;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final bottomInset = MediaQuery.paddingOf(context).bottom;

    return Scaffold(
      body: Stack(
        fit: StackFit.expand,
        children: [
          Image.asset(
            AppAssets.welcomeEntryBackground,
            fit: BoxFit.cover,
            alignment: Alignment.center,
            filterQuality: FilterQuality.high,
          ),
          SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 28),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: _horizontalPadding),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Text(
                        l10n.welcomeHeadline,
                        textAlign: TextAlign.center,
                        style: AppTypography.style(
                          fontSize: 40,
                          fontWeight: FontWeight.w800,
                          color: const Color(0xFF0B1F3A),
                          height: 1.1,
                          letterSpacing: -0.8,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        l10n.welcomeBody,
                        textAlign: TextAlign.center,
                        style: AppTypography.style(
                          fontSize: 17,
                          fontWeight: FontWeight.w500,
                          color: AppColors.textSecondary,
                          height: 1.45,
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: LayoutBuilder(
                    builder: (context, constraints) {
                      final coachWidth = constraints.maxWidth * 0.76;
                      return Align(
                        alignment: Alignment.bottomRight,
                        child: Padding(
                          padding: const EdgeInsets.only(right: 4, bottom: 4),
                          child: SizedBox(
                            width: coachWidth,
                            child: Image.asset(
                              AppAssets.coach,
                              fit: BoxFit.contain,
                              alignment: Alignment.bottomRight,
                              filterQuality: FilterQuality.high,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
                Padding(
                  padding: EdgeInsets.fromLTRB(
                    _horizontalPadding,
                    0,
                    _horizontalPadding,
                    bottomInset + 16,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      SizedBox(
                        height: 56,
                        width: double.infinity,
                        child: FilledButton(
                          onPressed: onContinue,
                          style: FilledButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.white,
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(AppRadius.pill),
                            ),
                            textStyle: AppTypography.style(
                              fontWeight: FontWeight.w700,
                              fontSize: 17,
                            ),
                          ),
                          child: Text(l10n.entryContinue),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      Center(
                        child: TextButton(
                          onPressed: onSignIn,
                          style: TextButton.styleFrom(
                            foregroundColor: AppColors.textPrimary,
                            textStyle: AppTypography.style(
                              fontWeight: FontWeight.w700,
                              fontSize: 16,
                            ),
                          ),
                          child: Text(l10n.entrySignIn),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
