import 'dart:convert';
import 'dart:ui';

enum RoutineNodeType {
  trigger,
  flashcard,
  readLesson,
  aiCoach,
  quiz,
  reminder,
}

class RoutineNode {
  const RoutineNode({
    required this.id,
    required this.type,
    required this.title,
    required this.subtitle,
    required this.position,
    this.config = const {},
  });

  final String id;
  final RoutineNodeType type;
  final String title;
  final String subtitle;
  final Offset position;
  final Map<String, String> config;

  static const nodeWidth = 168.0;
  static const nodeHeight = 88.0;

  Offset get inputPort => Offset(position.dx, position.dy + nodeHeight / 2);
  Offset get outputPort => Offset(position.dx + nodeWidth, position.dy + nodeHeight / 2);

  RoutineNode copyWith({
    String? id,
    RoutineNodeType? type,
    String? title,
    String? subtitle,
    Offset? position,
    Map<String, String>? config,
  }) {
    return RoutineNode(
      id: id ?? this.id,
      type: type ?? this.type,
      title: title ?? this.title,
      subtitle: subtitle ?? this.subtitle,
      position: position ?? this.position,
      config: config ?? this.config,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type.name,
        'title': title,
        'subtitle': subtitle,
        'x': position.dx,
        'y': position.dy,
        'config': config,
      };

  factory RoutineNode.fromJson(Map<String, dynamic> json) {
    return RoutineNode(
      id: json['id'] as String,
      type: RoutineNodeType.values.byName(json['type'] as String),
      title: json['title'] as String,
      subtitle: json['subtitle'] as String,
      position: Offset((json['x'] as num).toDouble(), (json['y'] as num).toDouble()),
      config: Map<String, String>.from(json['config'] as Map? ?? {}),
    );
  }
}

class RoutineConnection {
  const RoutineConnection({
    required this.id,
    required this.fromNodeId,
    required this.toNodeId,
  });

  final String id;
  final String fromNodeId;
  final String toNodeId;

  Map<String, dynamic> toJson() => {
        'id': id,
        'from': fromNodeId,
        'to': toNodeId,
      };

  factory RoutineConnection.fromJson(Map<String, dynamic> json) {
    return RoutineConnection(
      id: json['id'] as String,
      fromNodeId: json['from'] as String,
      toNodeId: json['to'] as String,
    );
  }
}

class RoutineWorkflow {
  const RoutineWorkflow({
    required this.nodes,
    required this.connections,
  });

  final List<RoutineNode> nodes;
  final List<RoutineConnection> connections;

  RoutineWorkflow copyWith({
    List<RoutineNode>? nodes,
    List<RoutineConnection>? connections,
  }) {
    return RoutineWorkflow(
      nodes: nodes ?? this.nodes,
      connections: connections ?? this.connections,
    );
  }

  List<RoutineNode> get orderedNodes {
    if (nodes.isEmpty) return [];
    final triggers = nodes.where((n) => n.type == RoutineNodeType.trigger).toList();
    final start = triggers.isNotEmpty ? triggers.first : nodes.first;
    final ordered = <RoutineNode>[start];
    final visited = {start.id};

    while (ordered.length < nodes.length) {
      final last = ordered.last;
      final nextConn = connections.where((c) => c.fromNodeId == last.id).toList();
      if (nextConn.isEmpty) break;
      RoutineNode? next;
      for (final n in nodes) {
        if (n.id == nextConn.first.toNodeId) {
          next = n;
          break;
        }
      }
      if (next == null || visited.contains(next.id)) break;
      ordered.add(next);
      visited.add(next.id);
    }

    for (final node in nodes) {
      if (!visited.contains(node.id)) ordered.add(node);
    }
    return ordered;
  }

  Map<String, dynamic> toJson() => {
        'nodes': nodes.map((n) => n.toJson()).toList(),
        'connections': connections.map((c) => c.toJson()).toList(),
      };

  factory RoutineWorkflow.fromJson(Map<String, dynamic> json) {
    return RoutineWorkflow(
      nodes: (json['nodes'] as List)
          .map((e) => RoutineNode.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList(),
      connections: (json['connections'] as List)
          .map((e) => RoutineConnection.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList(),
    );
  }

  String toJsonString() => jsonEncode(toJson());

  factory RoutineWorkflow.fromJsonString(String raw) {
    return RoutineWorkflow.fromJson(jsonDecode(raw) as Map<String, dynamic>);
  }
}
