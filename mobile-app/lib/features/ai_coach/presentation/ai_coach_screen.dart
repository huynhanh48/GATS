import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gats_academy/core/constants/app_assets.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/floating_nav_bar.dart';
import 'package:gats_academy/data/mock/mock_data.dart';

class AiCoachScreen extends StatefulWidget {
  const AiCoachScreen({super.key});

  @override
  State<AiCoachScreen> createState() => _AiCoachScreenState();
}

class _AiCoachScreenState extends State<AiCoachScreen> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  late List<ChatMessage> _messages;
  bool _isTyping = false;

  @override
  void initState() {
    super.initState();
    _messages = List.of(MockData.initialChatMessages);
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _sendMessage(String text) async {
    if (text.trim().isEmpty || _isTyping) return;

    setState(() {
      _messages.add(ChatMessage(text: text.trim(), isUser: true));
      _isTyping = true;
    });
    _controller.clear();
    _scrollToEnd();
    HapticFeedback.lightImpact();

    await Future<void>.delayed(const Duration(milliseconds: 800));
    if (!mounted) return;

    setState(() {
      _isTyping = false;
      _messages.add(ChatMessage(text: AppStrings.aiCoachMockReply, isUser: false));
    });
    _scrollToEnd();
  }

  void _scrollToEnd() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final hasConversation = _messages.length > 1;

    return Column(
      children: [
        Expanded(
          child: !hasConversation
              ? _WelcomeHero(onPrompt: _sendMessage)
              : _ChatBody(
                  messages: _messages,
                  isTyping: _isTyping,
                  scrollController: _scrollController,
                ),
        ),
        _ChatInputBar(
          controller: _controller,
          isTyping: _isTyping,
          onSend: _sendMessage,
        ),
      ],
    );
  }
}

class _WelcomeHero extends StatelessWidget {
  const _WelcomeHero({required this.onPrompt});

  final ValueChanged<String> onPrompt;

  static const _suggestions = [
    _Suggestion('Tôi nên học gì tiếp?', Icons.school_rounded, [Color(0xFF3D8FEF), Color(0xFF7C3AED)]),
    _Suggestion('Giải thích AI cơ bản', Icons.lightbulb_rounded, [Color(0xFFFF9A56), Color(0xFFFF7622)]),
    _Suggestion('Lên lịch học hôm nay', Icons.calendar_month_rounded, [Color(0xFF10B981), Color(0xFF059669)]),
    _Suggestion('Quiz nhanh về Prompt', Icons.quiz_rounded, [Color(0xFFEC4899), Color(0xFF8B5CF6)]),
  ];

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.lg,
        AppSpacing.sm,
        AppSpacing.lg,
        AppSpacing.md,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: AppSpacing.md),
          const _CoachAvatar(size: 96),
          const SizedBox(height: AppSpacing.lg),
          Text(
            AppStrings.coachWelcomeCardTitle,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.3,
                  color: gats.textPrimary,
                ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.sm),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
            child: Text(
              AppStrings.coachWelcomeCardBody,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: gats.textSecondary,
                    height: 1.45,
                  ),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          Text(
            'Thử hỏi nhanh',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: gats.textSecondary,
              letterSpacing: 0.2,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _suggestions.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: AppSpacing.md,
              crossAxisSpacing: AppSpacing.md,
              childAspectRatio: 1.28,
            ),
            itemBuilder: (context, i) {
              final s = _suggestions[i];
              return _SuggestionTile(
                suggestion: s,
                onTap: () => onPrompt(s.label),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _Suggestion {
  const _Suggestion(this.label, this.icon, this.gradientColors);
  final String label;
  final IconData icon;
  final List<Color> gradientColors;
}

class _CoachFace extends StatelessWidget {
  const _CoachFace({this.size = 34});

  final double size;

  @override
  Widget build(BuildContext context) {
    final ring = (size * 0.08).clamp(1.5, 3.0);

    return Container(
      width: size,
      height: size,
      padding: EdgeInsets.all(ring),
      decoration: const BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF3D8FEF), Color(0xFF7C3AED)],
        ),
      ),
      child: ClipOval(
        child: ColoredBox(
          color: Colors.black,
          child: Image.asset(
            AppAssets.coach,
            fit: BoxFit.cover,
            alignment: const Alignment(0, -0.15),
            errorBuilder: (context, error, stackTrace) => ColoredBox(
              color: const Color(0xFF1A2151),
              child: Icon(
                Icons.auto_awesome_rounded,
                color: Colors.white,
                size: size * 0.4,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _CoachAvatar extends StatefulWidget {
  const _CoachAvatar({this.size = 96});

  final double size;

  @override
  State<_CoachAvatar> createState() => _CoachAvatarState();
}

class _CoachAvatarState extends State<_CoachAvatar>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2200),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final pulse = 0.9 + (_controller.value * 0.1);
        final glowAlpha = 0.12 + (_controller.value * 0.16);

        return Center(
          child: Container(
            width: widget.size,
            height: widget.size,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: glowAlpha),
                  blurRadius: 28 * pulse,
                  spreadRadius: 4 * pulse,
                ),
              ],
            ),
            child: _CoachFace(size: widget.size),
          ),
        );
      },
    );
  }
}

class _SuggestionTile extends StatelessWidget {
  const _SuggestionTile({required this.suggestion, required this.onTap});

  final _Suggestion suggestion;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        child: Ink(
          decoration: BoxDecoration(
            color: gats.surface.withValues(alpha: gats.isStarry ? 0.9 : 1),
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(color: gats.divider.withValues(alpha: 0.65)),
            boxShadow: gats.isStarry ? null : AppShadows.card,
          ),
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: suggestion.gradientColors,
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(11),
                  ),
                  child: Icon(suggestion.icon, color: Colors.white, size: 18),
                ),
                const Spacer(),
                Text(
                  suggestion.label,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                    height: 1.25,
                    color: gats.textPrimary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Chat body — messages list
// ─────────────────────────────────────────────────────────────

class _ChatBody extends StatelessWidget {
  const _ChatBody({
    required this.messages,
    required this.isTyping,
    required this.scrollController,
  });

  final List<ChatMessage> messages;
  final bool isTyping;
  final ScrollController scrollController;

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      controller: scrollController,
      padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.lg, AppSpacing.lg, AppSpacing.sm),
      itemCount: messages.length + (isTyping ? 1 : 0),
      itemBuilder: (context, index) {
        if (isTyping && index == messages.length) {
          return const _TypingIndicator();
        }
        return _AnimatedChatBubble(
          message: messages[index],
          isLatest: index == messages.length - 1,
        );
      },
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Chat bubble with slide-in animation
// ─────────────────────────────────────────────────────────────

class _AnimatedChatBubble extends StatefulWidget {
  const _AnimatedChatBubble({
    required this.message,
    this.isLatest = false,
  });

  final ChatMessage message;
  final bool isLatest;

  @override
  State<_AnimatedChatBubble> createState() => _AnimatedChatBubbleState();
}

class _AnimatedChatBubbleState extends State<_AnimatedChatBubble>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    if (widget.isLatest) {
      _controller.forward();
    } else {
      _controller.value = 1;
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SlideTransition(
      position: Tween<Offset>(
        begin: Offset(widget.message.isUser ? 0.2 : -0.2, 0.15),
        end: Offset.zero,
      ).animate(CurvedAnimation(
        parent: _controller,
        curve: Curves.easeOutCubic,
      )),
      child: FadeTransition(
        opacity: CurvedAnimation(parent: _controller, curve: Curves.easeOut),
        child: _ChatBubble(message: widget.message),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Chat bubble content — user vs coach
// ─────────────────────────────────────────────────────────────

class _ChatBubble extends StatelessWidget {
  const _ChatBubble({required this.message});

  final ChatMessage message;

  @override
  Widget build(BuildContext context) {
    return message.isUser ? _UserBubble(message: message) : _CoachBubble(message: message);
  }
}

class _UserBubble extends StatelessWidget {
  const _UserBubble({required this.message});
  final ChatMessage message;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerRight,
      child: Container(
        margin: const EdgeInsets.only(bottom: 14, left: 48),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.72),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF3D8FEF), Color(0xFF0052B4)],
          ),
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(20),
            topRight: Radius.circular(20),
            bottomLeft: Radius.circular(20),
            bottomRight: Radius.circular(6),
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withValues(alpha: 0.25),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Text(
          message.text,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
            height: 1.45,
          ),
        ),
      ),
    );
  }
}

class _CoachBubble extends StatelessWidget {
  const _CoachBubble({required this.message});
  final ChatMessage message;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;

    return Padding(
      padding: const EdgeInsets.only(bottom: 14, right: 32),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _CoachFace(size: 34),
          const SizedBox(width: 10),
          Flexible(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.only(left: 2, bottom: 4),
                  child: Text(
                    AppStrings.aiCoachName,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: gats.textSecondary,
                      letterSpacing: 0.3,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: gats.surface,
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(6),
                      topRight: Radius.circular(20),
                      bottomLeft: Radius.circular(20),
                      bottomRight: Radius.circular(20),
                    ),
                    border: gats.isStarry
                        ? Border.all(color: gats.divider.withValues(alpha: 0.5))
                        : null,
                    boxShadow: gats.isStarry
                        ? null
                        : [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.05),
                              blurRadius: 10,
                              offset: const Offset(0, 2),
                            ),
                          ],
                  ),
                  child: Text(
                    message.text,
                    style: TextStyle(
                      fontSize: 14,
                      height: 1.5,
                      color: gats.textPrimary,
                    ),
                  ),
                ),

                // Reactions
                Padding(
                  padding: const EdgeInsets.only(left: 4, top: 6),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      _ReactionPill(icon: Icons.thumb_up_rounded, onTap: () {}),
                      const SizedBox(width: 6),
                      _ReactionPill(icon: Icons.thumb_down_rounded, onTap: () {}),
                      const SizedBox(width: 6),
                      _ReactionPill(icon: Icons.content_copy_rounded, onTap: () {}),
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

// ─────────────────────────────────────────────────────────────
// Reaction pill button
// ─────────────────────────────────────────────────────────────

class _ReactionPill extends StatelessWidget {
  const _ReactionPill({required this.icon, required this.onTap});

  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return Material(
      color: gats.divider.withValues(alpha: 0.3),
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.all(6),
          child: Icon(icon, size: 12, color: gats.textSecondary),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Typing indicator with bouncing dots
// ─────────────────────────────────────────────────────────────

class _TypingIndicator extends StatelessWidget {
  const _TypingIndicator();

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;

    return Padding(
      padding: const EdgeInsets.only(bottom: 14, right: 32),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _CoachFace(size: 34),
          const SizedBox(width: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
            decoration: BoxDecoration(
              color: gats.surface,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(6),
                topRight: Radius.circular(20),
                bottomLeft: Radius.circular(20),
                bottomRight: Radius.circular(20),
              ),
              border: gats.isStarry
                  ? Border.all(color: gats.divider.withValues(alpha: 0.5))
                  : null,
              boxShadow: gats.isStarry
                  ? null
                  : [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 10,
                        offset: const Offset(0, 2),
                      ),
                    ],
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _BouncingDot(delay: 0),
                SizedBox(width: 5),
                _BouncingDot(delay: 150),
                SizedBox(width: 5),
                _BouncingDot(delay: 300),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _BouncingDot extends StatefulWidget {
  const _BouncingDot({required this.delay});
  final int delay;

  @override
  State<_BouncingDot> createState() => _BouncingDotState();
}

class _BouncingDotState extends State<_BouncingDot> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    Future.delayed(Duration(milliseconds: widget.delay), () {
      if (mounted) _controller.repeat(reverse: true);
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final value = _controller.value;
        return Transform.translate(
          offset: Offset(0, -4 * math.sin(value * math.pi)),
          child: Container(
            width: 7,
            height: 7,
            decoration: BoxDecoration(
              color: Color.lerp(
                gats.textSecondary.withValues(alpha: 0.4),
                gats.lavenderAccent,
                value,
              ),
              shape: BoxShape.circle,
            ),
          ),
        );
      },
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Chat input bar
// ─────────────────────────────────────────────────────────────

class _ChatInputBar extends StatelessWidget {
  const _ChatInputBar({
    required this.controller,
    required this.isTyping,
    required this.onSend,
  });

  final TextEditingController controller;
  final bool isTyping;
  final ValueChanged<String> onSend;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;

    return Padding(
      padding: EdgeInsets.fromLTRB(
        AppSpacing.lg,
        AppSpacing.sm,
        AppSpacing.lg,
        FloatingNavBar.chatInputBottomPadding(context, gap: 72),
      ),
      child: Row(
        children: [
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: gats.surface.withValues(alpha: gats.isStarry ? 0.88 : 1),
                borderRadius: BorderRadius.circular(AppRadius.pill),
                border: Border.all(
                  color: gats.divider.withValues(alpha: 0.7),
                ),
                boxShadow: gats.isStarry
                    ? null
                    : [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.04),
                          blurRadius: 12,
                          offset: const Offset(0, 3),
                        ),
                      ],
              ),
              child: TextField(
                controller: controller,
                decoration: InputDecoration(
                  hintText: AppStrings.aiCoachInputHint,
                  hintStyle: TextStyle(
                    color: gats.textSecondary.withValues(alpha: 0.6),
                    fontSize: 14,
                  ),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 18,
                    vertical: 13,
                  ),
                ),
                style: TextStyle(
                  fontSize: 14,
                  color: gats.textPrimary,
                ),
                onSubmitted: onSend,
              ),
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          Container(
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF3D8FEF), Color(0xFF0052B4)],
              ),
              borderRadius: BorderRadius.circular(AppRadius.pill),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.28),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Material(
              color: Colors.transparent,
              borderRadius: BorderRadius.circular(AppRadius.pill),
              child: InkWell(
                onTap: isTyping ? null : () => onSend(controller.text),
                borderRadius: BorderRadius.circular(AppRadius.pill),
                child: SizedBox(
                  width: 46,
                  height: 46,
                  child: Icon(
                    Icons.arrow_upward_rounded,
                    color: Colors.white.withValues(alpha: isTyping ? 0.5 : 1),
                    size: 22,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
