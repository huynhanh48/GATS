import 'package:flutter/foundation.dart';
import 'package:gats_academy/data/mock/mock_accounts.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';

class MockGroupChatStore extends ChangeNotifier {
  MockGroupChatStore._();
  static final MockGroupChatStore instance = MockGroupChatStore._();

  final Map<String, List<GroupChatMessage>> _rooms = _seedRooms();
  int _messageCounter = 100;

  List<GroupChatMessage> messagesFor(String groupChatId) {
    return List.unmodifiable(_rooms[groupChatId] ?? const []);
  }

  void sendMessage({
    required String groupChatId,
    required String senderId,
    required String senderName,
    required String text,
    bool isMentor = false,
  }) {
    final trimmed = text.trim();
    if (trimmed.isEmpty) return;
    final room = _rooms.putIfAbsent(groupChatId, () => []);
    room.add(
      GroupChatMessage(
        id: 'msg-${_messageCounter++}',
        groupChatId: groupChatId,
        senderId: senderId,
        senderName: senderName,
        text: trimmed,
        sentAt: DateTime.now(),
        isMentor: isMentor,
      ),
    );
    notifyListeners();
  }

  void pinMessage(String groupChatId, String messageId) {
    final room = _rooms[groupChatId];
    if (room == null) return;
    for (var i = 0; i < room.length; i++) {
      final msg = room[i];
      room[i] = GroupChatMessage(
        id: msg.id,
        groupChatId: msg.groupChatId,
        senderId: msg.senderId,
        senderName: msg.senderName,
        text: msg.text,
        sentAt: msg.sentAt,
        isPinned: msg.id == messageId,
        isMentor: msg.isMentor,
      );
    }
    notifyListeners();
  }

  static Map<String, List<GroupChatMessage>> _seedRooms() {
    final now = DateTime.now();
    return {
      'gc-course-1': [
        GroupChatMessage(
          id: 'msg-1',
          groupChatId: 'gc-course-1',
          senderId: MockAccounts.mentor.id,
          senderName: MockAccounts.mentor.displayName,
          text: 'Chào cả lớp! Tuần này tập trung vào prompt cho email nhé.',
          sentAt: now.subtract(const Duration(hours: 5)),
          isMentor: true,
          isPinned: true,
        ),
        GroupChatMessage(
          id: 'msg-2',
          groupChatId: 'gc-course-1',
          senderId: MockAccounts.user.id,
          senderName: MockAccounts.user.displayName,
          text: 'Em đã xem bài 2, có ví dụ template email không ạ?',
          sentAt: now.subtract(const Duration(hours: 4)),
        ),
        GroupChatMessage(
          id: 'msg-3',
          groupChatId: 'gc-course-1',
          senderId: MockAccounts.mentor.id,
          senderName: MockAccounts.mentor.displayName,
          text: 'Có nhé — mình gửi trong tab Tài liệu, mục Bài 2.',
          sentAt: now.subtract(const Duration(hours: 3, minutes: 45)),
          isMentor: true,
        ),
      ],
      'gc-course-2': [
        GroupChatMessage(
          id: 'msg-10',
          groupChatId: 'gc-course-2',
          senderId: MockAccounts.mentor.id,
          senderName: MockAccounts.mentor.displayName,
          text: 'Khóa Prompt Engineering mở miễn phí — enroll để vào nhóm chat.',
          sentAt: now.subtract(const Duration(days: 1)),
          isMentor: true,
          isPinned: true,
        ),
      ],
    };
  }
}
