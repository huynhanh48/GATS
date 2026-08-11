import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/features/ai_coach/data/ai_coach_store.dart';
import 'package:gats_academy/features/ai_coach/models/ai_coach_session.dart';

class AiCoachSessionSheet extends StatefulWidget {
  const AiCoachSessionSheet({
    super.key,
    required this.userId,
    required this.activeSessionId,
    required this.onSelectSession,
    required this.onNewSession,
  });

  final String userId;
  final String? activeSessionId;
  final ValueChanged<AiCoachSession> onSelectSession;
  final VoidCallback onNewSession;

  static Future<void> show({
    required BuildContext context,
    required String userId,
    required String? activeSessionId,
    required ValueChanged<AiCoachSession> onSelectSession,
    required VoidCallback onNewSession,
  }) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => AiCoachSessionSheet(
        userId: userId,
        activeSessionId: activeSessionId,
        onSelectSession: onSelectSession,
        onNewSession: onNewSession,
      ),
    );
  }

  @override
  State<AiCoachSessionSheet> createState() => _AiCoachSessionSheetState();
}

class _AiCoachSessionSheetState extends State<AiCoachSessionSheet> {
  List<AiCoachSession> _sessions = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadSessions();
  }

  Future<void> _loadSessions() async {
    final list = await AiCoachStore.loadSessions(widget.userId);
    if (!mounted) return;
    setState(() {
      _sessions = list;
      _isLoading = false;
    });
  }

  Future<void> _deleteSession(String sessionId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Xóa cuộc trò chuyện'),
        content: const Text('Bạn có chắc chắn muốn xóa đoạn chat này không?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Hủy'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: const Text('Xóa'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    await AiCoachStore.deleteSession(widget.userId, sessionId);
    await _loadSessions();
  }

  Future<void> _clearAll() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Xóa toàn bộ lịch sử'),
        content: const Text(
            'Thao tác này sẽ xóa tất cả các cuộc trò chuyện đã lưu của bạn.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Hủy'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: const Text('Xóa tất cả'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    await AiCoachStore.clearAllSessions(widget.userId);
    if (!mounted) return;
    Navigator.pop(context);
    widget.onNewSession();
  }

  String _formatDate(DateTime dt) {
    final now = DateTime.now();
    if (dt.year == now.year && dt.month == now.month && dt.day == now.day) {
      final hour = dt.hour.toString().padLeft(2, '0');
      final min = dt.minute.toString().padLeft(2, '0');
      return 'Hôm nay, $hour:$min';
    }
    return '${dt.day}/${dt.month}/${dt.year}';
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final screenHeight = MediaQuery.of(context).size.height;

    return Container(
      constraints: BoxConstraints(maxHeight: screenHeight * 0.75),
      margin: const EdgeInsets.all(AppSpacing.md),
      decoration: GatsSurfaceDecoration.card(
        context,
        borderRadius: BorderRadius.circular(AppRadius.xl),
        lightShadow: AppShadows.elevated,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header handle
          const SizedBox(height: 12),
          Container(
            width: 36,
            height: 4,
            decoration: BoxDecoration(
              color: gats.divider,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: AppSpacing.md),

          // Title & New Session Button
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Lịch sử trò chuyện AI Coach',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w800,
                              color: gats.textPrimary,
                            ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${_sessions.length} đoạn hội thoại đã lưu',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: gats.textSecondary,
                            ),
                      ),
                    ],
                  ),
                ),
                FilledButton.icon(
                  onPressed: () {
                    Navigator.pop(context);
                    widget.onNewSession();
                  },
                  icon: const Icon(Icons.add_rounded, size: 18),
                  label: const Text('Tạo mới'),
                  style: FilledButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.md, vertical: AppSpacing.xs),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppRadius.pill),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Divider(color: gats.divider.withValues(alpha: 0.5)),

          // Session List
          if (_isLoading)
            const Padding(
              padding: EdgeInsets.all(AppSpacing.xl),
              child: CircularProgressIndicator(),
            )
          else if (_sessions.isEmpty)
            Padding(
              padding: const EdgeInsets.all(AppSpacing.xl),
              child: Column(
                children: [
                  Icon(Icons.chat_bubble_outline_rounded,
                      size: 48, color: gats.textSecondary.withValues(alpha: 0.5)),
                  const SizedBox(height: AppSpacing.md),
                  Text(
                    'Chưa có lịch sử trò chuyện nào',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: gats.textSecondary,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    'Bắt đầu nhắn tin với AI Coach để lưu lại tư vấn.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 12,
                      color: gats.textSecondary.withValues(alpha: 0.8),
                    ),
                  ),
                ],
              ),
            )
          else
            Flexible(
              child: ListView.separated(
                shrinkWrap: true,
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.md,
                  vertical: AppSpacing.xs,
                ),
                itemCount: _sessions.length,
                separatorBuilder: (ctx, i) =>
                    Divider(height: 1, color: gats.divider.withValues(alpha: 0.3)),
                itemBuilder: (ctx, index) {
                  final session = _sessions[index];
                  final isActive = session.id == widget.activeSessionId;
                  final lastMessage = session.messages.isNotEmpty
                      ? session.messages.last.text
                      : 'Chưa có tin nhắn';

                  return ListTile(
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md,
                      vertical: 4,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppRadius.md),
                    ),
                    tileColor: isActive
                        ? AppColors.primary.withValues(alpha: 0.08)
                        : null,
                    leading: CircleAvatar(
                      backgroundColor: isActive
                          ? AppColors.primary
                          : gats.divider.withValues(alpha: 0.4),
                      child: Icon(
                        isActive
                            ? Icons.chat_rounded
                            : Icons.chat_bubble_outline_rounded,
                        color: isActive ? Colors.white : gats.textSecondary,
                        size: 18,
                      ),
                    ),
                    title: Text(
                      session.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontWeight:
                            isActive ? FontWeight.w700 : FontWeight.w600,
                        fontSize: 14,
                        color: isActive ? AppColors.primary : gats.textPrimary,
                      ),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 2),
                        Text(
                          lastMessage,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 12,
                            color: gats.textSecondary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          _formatDate(session.updatedAt),
                          style: TextStyle(
                            fontSize: 10,
                            color: gats.textSecondary.withValues(alpha: 0.6),
                          ),
                        ),
                      ],
                    ),
                    trailing: IconButton(
                      icon: const Icon(Icons.delete_outline_rounded, size: 20),
                      color: gats.textSecondary.withValues(alpha: 0.6),
                      tooltip: 'Xóa',
                      onPressed: () => _deleteSession(session.id),
                    ),
                    onTap: () {
                      Navigator.pop(context);
                      widget.onSelectSession(session);
                    },
                  );
                },
              ),
            ),

          if (_sessions.isNotEmpty) ...[
            Divider(color: gats.divider.withValues(alpha: 0.5)),
            Padding(
              padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.lg, vertical: AppSpacing.xs),
              child: TextButton.icon(
                onPressed: _clearAll,
                icon: const Icon(Icons.delete_sweep_rounded, size: 18),
                label: const Text('Xóa tất cả lịch sử'),
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.error,
                ),
              ),
            ),
          ],
          const SizedBox(height: AppSpacing.md),
        ],
      ),
    );
  }
}
