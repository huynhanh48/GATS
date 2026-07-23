import 'dart:async';

import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/network/api_exception.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/data/api/course_chat_api_service.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';
import 'package:gats_academy/features/auth/models/auth_user.dart';

class GroupChatPanel extends StatefulWidget {
  const GroupChatPanel({
    super.key,
    required this.courseId,
    required this.currentUser,
    this.canPin = false,
  });

  final String courseId;
  final AuthUser? currentUser;
  final bool canPin;

  @override
  State<GroupChatPanel> createState() => _GroupChatPanelState();
}

class _GroupChatPanelState extends State<GroupChatPanel> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  List<GroupChatMessage> _messages = const [];
  Timer? _pollTimer;
  bool _loading = true;
  bool _sending = false;
  bool _accessClosed = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    unawaited(_load());
    _pollTimer = Timer.periodic(
      const Duration(seconds: 5),
      (_) => unawaited(_load(silent: true)),
    );
  }

  Future<void> _load({bool silent = false}) async {
    if (_accessClosed) return;
    final token = await AuthPrefs.accessToken();
    if (token == null) return;
    try {
      final messages = await CourseChatApiService.list(
        courseId: widget.courseId,
        token: token,
      );
      if (!mounted) return;
      final changed = messages.length != _messages.length ||
          (messages.isNotEmpty &&
              (_messages.isEmpty || messages.last.id != _messages.last.id));
      setState(() {
        _messages = messages;
        _loading = false;
        _error = null;
      });
      if (changed) _scrollToBottom();
    } catch (error) {
      if (!mounted) return;
      final closed = error is ApiException &&
          (error.statusCode == 410 || error.statusCode == 403);
      if (!closed && silent) return;
      _handleError(error);
    }
  }

  void _handleError(Object error) {
    if (!mounted) return;
    final closed = error is ApiException &&
        (error.statusCode == 410 || error.statusCode == 403);
    if (closed) _pollTimer?.cancel();
    setState(() {
      _loading = false;
      _accessClosed = closed;
      _error = error is ApiException ? error.message : error.toString();
    });
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    final user = widget.currentUser;
    final token = await AuthPrefs.accessToken();
    if (user == null || token == null || _sending) return;
    final text = _controller.text.trim();
    if (text.trim().isEmpty) return;
    setState(() => _sending = true);
    try {
      await CourseChatApiService.send(
        courseId: widget.courseId,
        token: token,
        content: text,
      );
      _controller.clear();
      await _load();
    } catch (error) {
      _handleError(error);
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  Future<void> _togglePin(GroupChatMessage message) async {
    final token = await AuthPrefs.accessToken();
    if (token == null) return;
    try {
      await CourseChatApiService.setPinned(
        courseId: widget.courseId,
        messageId: message.id,
        token: token,
        isPinned: !message.isPinned,
      );
      await _load();
    } catch (error) {
      _handleError(error);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = widget.currentUser;

    return Column(
      children: [
        if (_error != null)
          MaterialBanner(
            content: Text(_error!),
            actions: _accessClosed
                ? const [SizedBox.shrink()]
                : [
                    TextButton(
                      onPressed: () => unawaited(_load()),
                      child: const Text('Thử lại'),
                    ),
                  ],
          ),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : _messages.isEmpty
              ? Center(child: Text(AppStrings.groupChatEmpty))
              : ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(AppSpacing.md),
                  itemCount: _messages.length,
                  itemBuilder: (context, index) => _MessageBubble(
                    message: _messages[index],
                    isMine: user != null && _messages[index].senderId == user.id,
                    canPin: widget.canPin,
                    onPin: () => _togglePin(_messages[index]),
                  ),
                ),
        ),
        if (user != null && !_accessClosed)
          SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(AppSpacing.md, 0, AppSpacing.md, AppSpacing.md),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      decoration: InputDecoration(
                        hintText: AppStrings.groupChatHint,
                        filled: true,
                        fillColor: AppColors.accent,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(AppRadius.lg),
                          borderSide: BorderSide.none,
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.md,
                          vertical: AppSpacing.sm,
                        ),
                      ),
                      textInputAction: TextInputAction.send,
                      enabled: !_sending,
                      onSubmitted: (_) => unawaited(_send()),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  IconButton.filled(
                    onPressed: _sending ? null : () => unawaited(_send()),
                    icon: _sending
                        ? const SizedBox.square(
                            dimension: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.send_rounded),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }
}

class _MessageBubble extends StatelessWidget {
  const _MessageBubble({
    required this.message,
    required this.isMine,
    required this.canPin,
    required this.onPin,
  });

  final GroupChatMessage message;
  final bool isMine;
  final bool canPin;
  final VoidCallback onPin;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final alignment = isMine ? Alignment.centerRight : Alignment.centerLeft;
    final color = isMine ? AppColors.primary : gats.surface;
    final textColor = isMine ? Colors.white : gats.textPrimary;

    return Align(
      alignment: alignment,
      child: Container(
        margin: const EdgeInsets.only(bottom: AppSpacing.sm),
        constraints: BoxConstraints(maxWidth: MediaQuery.sizeOf(context).width * 0.78),
        child: Material(
          color: color,
          elevation: message.isPinned ? 2 : 0,
          borderRadius: BorderRadius.circular(AppRadius.md),
          child: InkWell(
            onLongPress: canPin ? onPin : null,
            borderRadius: BorderRadius.circular(AppRadius.md),
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (message.isPinned)
                    const Row(
                      children: [
                        Icon(Icons.push_pin, size: 14, color: AppColors.accent),
                        SizedBox(width: 4),
                        Text('Ghim', style: TextStyle(fontSize: 11, color: AppColors.accent)),
                      ],
                    ),
                  Text(
                    message.senderName,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: isMine ? Colors.white70 : AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(message.text, style: TextStyle(color: textColor)),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
