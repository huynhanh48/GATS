import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/navigation/gats_main_navigator.dart';
import 'package:gats_academy/core/navigation/notification_deep_link.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/services/gats_notification_service.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/app_header.dart';
import 'package:gats_academy/core/widgets/gats_notification_banner.dart';
import 'package:gats_academy/core/widgets/starry_sky_background.dart';
import 'package:gats_academy/data/api/notification_api_service.dart';
import 'package:gats_academy/features/notifications/data/mock_notifications.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  bool _testing = false;
  bool _loadingList = true;
  List<AppNotificationItem> _items = const [];

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() => _loadingList = true);
    final items = await NotificationApiService.listOrEmpty();
    if (!mounted) return;
    setState(() {
      _items = items;
      _loadingList = false;
    });
  }

  Future<void> _runTest(
    Future<bool> Function() action, {
    String? successMessage,
    bool skipSuccessBanner = false,
  }) async {
    if (_testing) return;
    setState(() => _testing = true);
    try {
      final ok = await action();
      if (!mounted) return;
      if (!ok) {
        _showTopNotice(AppStrings.notificationsPermissionDenied, kind: GatsNotificationKind.warning);
        return;
      }
      if (!skipSuccessBanner) {
        _showTopNotice(successMessage ?? AppStrings.notificationsTestSent);
      }
    } finally {
      if (mounted) setState(() => _testing = false);
    }
  }

  void _showTopNotice(String message, {GatsNotificationKind kind = GatsNotificationKind.success}) {
    GatsNotificationService.showInApp(message: message, kind: kind);
  }

  Future<void> _onTapItem(AppNotificationItem item) async {
    final token = await AuthPrefs.accessToken();
    if (token != null && item.isUnread) {
      try {
        await NotificationApiService.markOneRead(token: token, id: item.id);
      } catch (_) {/* ignore */}
    }
    if (item.href != null && item.href!.isNotEmpty) {
      await NotificationDeepLink.open(item.href);
    }
    await _loadNotifications();
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;

    return GatsThemedScaffold(
      appBar: AppBar(
        backgroundColor: gats.isStarry ? Colors.transparent : gats.background,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: gats.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              AppStrings.notificationsScreenTitle,
              style: AppTypography.style(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: gats.textPrimary,
              ),
            ),
            Text(
              AppHeaderSubtitles.notifications,
              style: AppTypography.style(
                fontSize: 12,
                color: gats.textSecondary,
              ).copyWith(decoration: TextDecoration.none),
            ),
          ],
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _loadNotifications,
        child: ListView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          children: [
            _TestNotificationCard(
              loading: _testing,
              onTestBanner: () => _runTest(
                GatsNotificationService.testInAppBanner,
                skipSuccessBanner: true,
              ),
              onTestPush: () => _runTest(
                GatsNotificationService.testSystemPush,
                skipSuccessBanner: true,
              ),
              onTestDelayed: () => _runTest(
                GatsNotificationService.testDelayedSystemPush,
                successMessage: AppStrings.notificationsTestScheduled,
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
            if (_loadingList)
              const Center(child: CircularProgressIndicator())
            else
              ..._buildSections(context),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildSections(BuildContext context) {
    final sections = [
      (AppNotificationSection.today, AppStrings.notificationsToday),
      (AppNotificationSection.yesterday, AppStrings.notificationsYesterday),
      (AppNotificationSection.earlier, 'Trước đó'),
    ];

    final widgets = <Widget>[];
    for (final (section, label) in sections) {
      final items = _items.where((n) => n.section == section).toList();
      if (items.isEmpty) continue;

      widgets
        ..add(Text(
          label,
          style: AppTypography.style(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: context.gatsColors.textPrimary,
          ),
        ))
        ..add(const SizedBox(height: AppSpacing.md));

      for (final item in items) {
        widgets
          ..add(_NotificationTile(item: item, onTap: () => _onTapItem(item)))
          ..add(const SizedBox(height: AppSpacing.sm));
      }

      widgets.add(const SizedBox(height: AppSpacing.lg));
    }

    if (widgets.isEmpty) {
      widgets.add(Center(
        child: Text(
          AppStrings.notificationsEmpty,
          style: AppTypography.style(color: context.gatsColors.textSecondary),
        ),
      ));
    }

    return widgets;
  }
}

class _TestNotificationCard extends StatelessWidget {
  const _TestNotificationCard({
    required this.loading,
    required this.onTestBanner,
    required this.onTestPush,
    required this.onTestDelayed,
  });

  final bool loading;
  final VoidCallback onTestBanner;
  final VoidCallback onTestPush;
  final VoidCallback onTestDelayed;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: gats.surface.withValues(alpha: gats.isStarry ? 0.92 : 1),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: gats.divider.withValues(alpha: 0.6)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Icon(Icons.science_outlined, color: gats.lavenderAccent, size: 22),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Text(
                  AppStrings.notificationsTestSection,
                  style: AppTypography.style(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: gats.textPrimary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            AppStrings.notificationsTestHint,
            style: AppTypography.style(fontSize: 13, color: gats.textSecondary),
          ),
          const SizedBox(height: AppSpacing.lg),
          Wrap(
            spacing: AppSpacing.sm,
            runSpacing: AppSpacing.sm,
            children: [
              _TestButton(
                label: AppStrings.notificationsTestBanner,
                icon: Icons.notifications_active_outlined,
                onPressed: loading ? null : onTestBanner,
              ),
              _TestButton(
                label: AppStrings.notificationsTestPush,
                icon: Icons.phone_android_outlined,
                onPressed: loading ? null : onTestPush,
              ),
              _TestButton(
                label: AppStrings.notificationsTestPushDelayed,
                icon: Icons.timer_outlined,
                onPressed: loading ? null : onTestDelayed,
                filled: true,
              ),
            ],
          ),
          if (loading) ...[
            const SizedBox(height: AppSpacing.md),
            const Center(child: SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2))),
          ],
        ],
      ),
    );
  }
}

class _TestButton extends StatelessWidget {
  const _TestButton({
    required this.label,
    required this.icon,
    required this.onPressed,
    this.filled = false,
  });

  final String label;
  final IconData icon;
  final VoidCallback? onPressed;
  final bool filled;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;

    return FilledButton.tonalIcon(
      onPressed: onPressed,
      style: FilledButton.styleFrom(
        backgroundColor: filled
            ? gats.lavenderAccent.withValues(alpha: 0.2)
            : gats.surface,
        foregroundColor: gats.textPrimary,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      ),
      icon: Icon(icon, size: 18),
      label: Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
    );
  }
}

class _NotificationTile extends StatelessWidget {
  const _NotificationTile({required this.item, required this.onTap});

  final AppNotificationItem item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final hasColoredBg = item.iconBackground != null;
    final iconBg = item.iconBackground ?? gats.lavenderAccent.withValues(alpha: 0.12);
    final iconColor = hasColoredBg ? Colors.white : gats.lavenderAccent;

    return Material(
      color: gats.surface.withValues(alpha: gats.isStarry ? 0.88 : 1),
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: iconBg,
                  shape: BoxShape.circle,
                  border: hasColoredBg
                      ? null
                      : Border.all(color: gats.divider.withValues(alpha: 0.5)),
                ),
                child: Icon(item.icon, color: iconColor, size: 22),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            item.title,
                            style: AppTypography.style(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: gats.textPrimary,
                            ),
                          ),
                        ),
                        if (item.isUnread)
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: AppColors.accent,
                              shape: BoxShape.circle,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      item.body,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: AppTypography.style(fontSize: 13, color: gats.textSecondary),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

void openNotifications(BuildContext context) {
  GatsMainNavigator.push(context, const NotificationsScreen());
}
