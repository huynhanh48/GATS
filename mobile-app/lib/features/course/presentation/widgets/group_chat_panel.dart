import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/data/mock/mock_group_chat_store.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';
import 'package:gats_academy/features/auth/models/auth_user.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';

class GroupChatPanel extends StatefulWidget {
  const GroupChatPanel({
    super.key,
    required this.groupChatId,
    required this.currentUser,
    this.canPin = false,
  });

  final String groupChatId;
  final AuthUser? currentUser;
  final bool canPin;

  @override
  State<GroupChatPanel> createState() => _GroupChatPanelState();
}

class _GroupChatPanelState extends State<GroupChatPanel> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    MockGroupChatStore.instance.addListener(_onMessagesChanged);
  }

  void _onMessagesChanged() {
    if (mounted) setState(() {});
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
    MockGroupChatStore.instance.removeListener(_onMessagesChanged);
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _send() {
    final user = widget.currentUser;
    if (user == null) return;
    final text = _controller.text;
    if (text.trim().isEmpty) return;
    MockGroupChatStore.instance.sendMessage(
      groupChatId: widget.groupChatId,
      senderId: user.id,
      senderName: user.displayName,
      text: text,
      isMentor: user.role == UserRole.mentor,
    );
    _controller.clear();
  }

  @override
  Widget build(BuildContext context) {
    final messages = MockGroupChatStore.instance.messagesFor(widget.groupChatId);
    final user = widget.currentUser;

    return Column(
      children: [
        Expanded(
          child: messages.isEmpty
              ? Center(child: Text(AppStrings.groupChatEmpty))
              : ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(AppSpacing.md),
                  itemCount: messages.length,
                  itemBuilder: (context, index) => _MessageBubble(
                    message: messages[index],
                    isMine: user != null && messages[index].senderId == user.id,
                    canPin: widget.canPin,
                    onPin: () => MockGroupChatStore.instance.pinMessage(
                      widget.groupChatId,
                      messages[index].id,
                    ),
                  ),
                ),
        ),
        if (user != null)
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
                      onSubmitted: (_) => _send(),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  IconButton.filled(
                    onPressed: _send,
                    icon: const Icon(Icons.send_rounded),
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
    final alignment = isMine ? Alignment.centerRight : Alignment.centerLeft;
    final color = isMine ? AppColors.primary : AppColors.surface;
    final textColor = isMine ? Colors.white : AppColors.textPrimary;

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
