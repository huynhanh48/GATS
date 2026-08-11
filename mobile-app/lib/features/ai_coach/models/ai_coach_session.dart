import 'dart:convert';

class AiChatMessage {
  AiChatMessage({
    required this.id,
    required this.text,
    required this.isUser,
    required this.timestamp,
  });

  factory AiChatMessage.create({
    required String text,
    required bool isUser,
  }) {
    return AiChatMessage(
      id: '${DateTime.now().microsecondsSinceEpoch}_${isUser ? "u" : "a"}',
      text: text,
      isUser: isUser,
      timestamp: DateTime.now(),
    );
  }

  factory AiChatMessage.fromJson(Map<String, dynamic> json) {
    return AiChatMessage(
      id: json['id'] as String? ?? '',
      text: json['text'] as String? ?? '',
      isUser: json['isUser'] as bool? ?? false,
      timestamp: json['timestamp'] != null
          ? DateTime.tryParse(json['timestamp'] as String) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  final String id;
  final String text;
  final bool isUser;
  final DateTime timestamp;

  Map<String, dynamic> toJson() => {
        'id': id,
        'text': text,
        'isUser': isUser,
        'timestamp': timestamp.toIso8601String(),
      };
}

class AiCoachSession {
  AiCoachSession({
    required this.id,
    required this.userId,
    required this.title,
    required this.createdAt,
    required this.updatedAt,
    required this.messages,
  });

  factory AiCoachSession.create({
    required String userId,
    String? title,
    List<AiChatMessage>? initialMessages,
  }) {
    final now = DateTime.now();
    return AiCoachSession(
      id: 'session_${now.microsecondsSinceEpoch}',
      userId: userId,
      title: title ?? 'Cuộc trò chuyện mới',
      createdAt: now,
      updatedAt: now,
      messages: initialMessages ?? [],
    );
  }

  factory AiCoachSession.fromJson(Map<String, dynamic> json) {
    final rawMessages = json['messages'] as List<dynamic>? ?? [];
    return AiCoachSession(
      id: json['id'] as String? ?? '',
      userId: json['userId'] as String? ?? 'guest',
      title: json['title'] as String? ?? 'Cuộc trò chuyện',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String) ?? DateTime.now()
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'] as String) ?? DateTime.now()
          : DateTime.now(),
      messages: rawMessages
          .map((m) => AiChatMessage.fromJson(m as Map<String, dynamic>))
          .toList(),
    );
  }

  final String id;
  final String userId;
  final String title;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<AiChatMessage> messages;

  AiCoachSession copyWith({
    String? title,
    DateTime? updatedAt,
    List<AiChatMessage>? messages,
  }) {
    return AiCoachSession(
      id: id,
      userId: userId,
      title: title ?? this.title,
      createdAt: createdAt,
      updatedAt: updatedAt ?? DateTime.now(),
      messages: messages ?? this.messages,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'userId': userId,
        'title': title,
        'createdAt': createdAt.toIso8601String(),
        'updatedAt': updatedAt.toIso8601String(),
        'messages': messages.map((m) => m.toJson()).toList(),
      };

  String toJsonString() => jsonEncode(toJson());

  factory AiCoachSession.fromJsonString(String source) =>
      AiCoachSession.fromJson(jsonDecode(source) as Map<String, dynamic>);
}
