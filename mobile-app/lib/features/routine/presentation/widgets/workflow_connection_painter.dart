import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/features/routine/models/routine_workflow.dart';

class WorkflowConnectionPainter extends CustomPainter {
  WorkflowConnectionPainter({
    required this.connections,
    required this.nodes,
    this.pendingFrom,
    this.pendingTo,
  });

  final List<RoutineConnection> connections;
  final List<RoutineNode> nodes;
  final RoutineNode? pendingFrom;
  final Offset? pendingTo;

  RoutineNode? _nodeById(String id) {
    for (final n in nodes) {
      if (n.id == id) return n;
    }
    return null;
  }

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.primary.withValues(alpha: 0.55)
      ..strokeWidth = 2.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    for (final conn in connections) {
      final from = _nodeById(conn.fromNodeId);
      final to = _nodeById(conn.toNodeId);
      if (from == null || to == null) continue;
      _drawCurve(canvas, paint, from.outputPort, to.inputPort);
    }

    if (pendingFrom != null && pendingTo != null) {
      final dashPaint = Paint()
        ..color = AppColors.accent
        ..strokeWidth = 2.5
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round;
      _drawCurve(canvas, dashPaint, pendingFrom!.outputPort, pendingTo!);
    }
  }

  void _drawCurve(Canvas canvas, Paint paint, Offset from, Offset to) {
    final dx = (to.dx - from.dx).abs();
    final control = math.max(48.0, dx * 0.45);
    final path = Path()
      ..moveTo(from.dx, from.dy)
      ..cubicTo(from.dx + control, from.dy, to.dx - control, to.dy, to.dx, to.dy);
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant WorkflowConnectionPainter oldDelegate) {
    return oldDelegate.connections != connections ||
        oldDelegate.nodes != nodes ||
        oldDelegate.pendingFrom != pendingFrom ||
        oldDelegate.pendingTo != pendingTo;
  }
}
