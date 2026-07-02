import 'package:flutter/material.dart';
import 'package:gats_academy/features/routine/models/routine_workflow.dart';

class RoutineNodeTemplate {
  const RoutineNodeTemplate({
    required this.type,
    required this.label,
    required this.defaultSubtitle,
    required this.icon,
    required this.color,
    this.defaultConfig = const {},
  });

  final RoutineNodeType type;
  final String label;
  final String defaultSubtitle;
  final IconData icon;
  final Color color;
  final Map<String, String> defaultConfig;
}

abstract final class RoutineNodeCatalog {
  static const templates = [
    RoutineNodeTemplate(
      type: RoutineNodeType.trigger,
      label: 'Bắt đầu',
      defaultSubtitle: 'Theo lịch hàng ngày',
      icon: Icons.play_circle_outline_rounded,
      color: Color(0xFF0070EB),
      defaultConfig: {'time': '07:00'},
    ),
    RoutineNodeTemplate(
      type: RoutineNodeType.flashcard,
      label: 'Ôn flashcard',
      defaultSubtitle: '5 thẻ từ bài hôm qua',
      icon: Icons.style_outlined,
      color: Color(0xFF0070EB),
    ),
    RoutineNodeTemplate(
      type: RoutineNodeType.quiz,
      label: 'Quiz nhanh',
      defaultSubtitle: '5 câu ôn tập',
      icon: Icons.quiz_outlined,
      color: Color(0xFFFF7622),
    ),
    RoutineNodeTemplate(
      type: RoutineNodeType.readLesson,
      label: 'Đọc bài',
      defaultSubtitle: '15 phút module đang học',
      icon: Icons.menu_book_outlined,
      color: Color(0xFF0070EB),
    ),
    RoutineNodeTemplate(
      type: RoutineNodeType.aiCoach,
      label: 'AI Coach',
      defaultSubtitle: 'Tóm tắt & gợi ý học',
      icon: Icons.psychology_alt_outlined,
      color: Color(0xFFFF7622),
    ),
    RoutineNodeTemplate(
      type: RoutineNodeType.reminder,
      label: 'Nhắc nhở',
      defaultSubtitle: 'Push notification',
      icon: Icons.notifications_active_outlined,
      color: Color(0xFFFF7622),
      defaultConfig: {'time': '20:00'},
    ),
  ];

  static RoutineNodeTemplate? templateFor(RoutineNodeType type) {
    for (final t in templates) {
      if (t.type == type) return t;
    }
    return null;
  }

  static RoutineWorkflow defaultWorkflow() {
    return RoutineWorkflow(
      nodes: [
        const RoutineNode(
          id: 'n1',
          type: RoutineNodeType.trigger,
          title: 'Bắt đầu',
          subtitle: '07:00 mỗi ngày',
          position: Offset(24, 80),
          config: {'time': '07:00'},
        ),
        const RoutineNode(
          id: 'n2',
          type: RoutineNodeType.quiz,
          title: 'Ôn quiz',
          subtitle: '5 câu hỏi nhanh',
          position: Offset(240, 40),
        ),
        const RoutineNode(
          id: 'n3',
          type: RoutineNodeType.readLesson,
          title: 'Đọc bài',
          subtitle: '15 phút đọc module',
          position: Offset(240, 150),
        ),
        const RoutineNode(
          id: 'n4',
          type: RoutineNodeType.aiCoach,
          title: 'AI Coach',
          subtitle: 'Tóm tắt tiến độ',
          position: Offset(456, 110),
        ),
      ],
      connections: const [
        RoutineConnection(id: 'c1', fromNodeId: 'n1', toNodeId: 'n2'),
        RoutineConnection(id: 'c2', fromNodeId: 'n2', toNodeId: 'n3'),
        RoutineConnection(id: 'c3', fromNodeId: 'n3', toNodeId: 'n4'),
      ],
    );
  }
}
