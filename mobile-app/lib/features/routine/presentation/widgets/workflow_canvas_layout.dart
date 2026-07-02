import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:gats_academy/features/routine/models/routine_workflow.dart';

abstract final class WorkflowCanvasLayout {
  static const padding = 20.0;
  static const minWidth = 320.0;
  static const minHeight = 160.0;

  static Rect boundsFor(Iterable<RoutineNode> nodes) {
    if (nodes.isEmpty) {
      return const Rect.fromLTWH(0, 0, minWidth, minHeight);
    }

    var minX = double.infinity;
    var minY = double.infinity;
    var maxX = double.negativeInfinity;
    var maxY = double.negativeInfinity;

    for (final node in nodes) {
      minX = math.min(minX, node.position.dx);
      minY = math.min(minY, node.position.dy);
      maxX = math.max(maxX, node.position.dx + RoutineNode.nodeWidth);
      maxY = math.max(maxY, node.position.dy + RoutineNode.nodeHeight);
    }

    final width = math.max(minWidth, maxX - minX + padding * 2);
    final height = math.max(minHeight, maxY - minY + padding * 2);
    return Rect.fromLTWH(minX - padding, minY - padding, width, height);
  }

  static Size canvasSizeFor(Iterable<RoutineNode> nodes) {
    final bounds = boundsFor(nodes);
    return Size(bounds.width, bounds.height);
  }
}
