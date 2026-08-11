import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/features/routine/models/routine_workflow.dart';
import 'package:gats_academy/features/routine/presentation/widgets/workflow_canvas_layout.dart';
import 'package:gats_academy/features/routine/presentation/widgets/workflow_connection_painter.dart';
import 'package:gats_academy/features/routine/presentation/widgets/workflow_node_widget.dart';

class WorkflowCanvas extends StatelessWidget {
  const WorkflowCanvas({
    super.key,
    required this.workflow,
    required this.readOnly,
    this.selectedNodeId,
    this.connectingFromId,
    this.pendingPointer,
    this.onCanvasTap,
    this.onCanvasPanUpdate,
    this.onSelectNode,
    this.onConnectNode,
    this.onMoveNode,
    this.onDragStart,
    this.onDragEnd,
    this.minWidth = 700,
    this.minHeight = 220,
    this.useFittedBox = false,
  });

  final RoutineWorkflow workflow;
  final bool readOnly;
  final String? selectedNodeId;
  final String? connectingFromId;
  final Offset? pendingPointer;
  final VoidCallback? onCanvasTap;
  final GestureDragUpdateCallback? onCanvasPanUpdate;
  final ValueChanged<String?>? onSelectNode;
  /// Long-press / connect action for a node.
  final ValueChanged<String>? onConnectNode;
  final void Function(String nodeId, Offset delta)? onMoveNode;
  final VoidCallback? onDragStart;
  final VoidCallback? onDragEnd;
  final double minWidth;
  final double minHeight;
  final bool useFittedBox;

  RoutineNode? get _connectingFromNode {
    if (connectingFromId == null) return null;
    for (final node in workflow.nodes) {
      if (node.id == connectingFromId) return node;
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final canvasSize = WorkflowCanvasLayout.canvasSizeFor(workflow.nodes);
    final width = canvasSize.width < minWidth ? minWidth : canvasSize.width;
    final height = canvasSize.height < minHeight ? minHeight : canvasSize.height;

    final canvas = SizedBox(
      width: width,
      height: height,
      child: GestureDetector(
        behavior: HitTestBehavior.translucent,
        onTap: onCanvasTap,
        onPanUpdate: onCanvasPanUpdate,
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            Positioned.fill(
              child: CustomPaint(
                painter: WorkflowConnectionPainter(
                  connections: workflow.connections,
                  nodes: workflow.nodes,
                  pendingFrom: _connectingFromNode,
                  pendingTo: pendingPointer,
                ),
              ),
            ),
            ...workflow.nodes.map((node) {
              return WorkflowNodeWidget(
                key: ValueKey(node.id),
                node: node,
                isSelected: selectedNodeId == node.id,
                isConnectSource: connectingFromId == node.id,
                readOnly: readOnly,
                onTap:
                    onSelectNode == null ? null : () => onSelectNode!(node.id),
                onLongPress: onConnectNode == null
                    ? null
                    : () => onConnectNode!(node.id),
                onDragStart: onDragStart == null
                    ? null
                    : () {
                        onSelectNode?.call(node.id);
                        onDragStart!();
                      },
                onDragEnd: onDragEnd,
                onDragDelta: onMoveNode == null
                    ? null
                    : (delta) => onMoveNode!(node.id, delta),
              );
            }),
          ],
        ),
      ),
    );

    if (!useFittedBox) {
      return Container(color: gats.background, child: canvas);
    }

    return Container(
      color: gats.background,
      alignment: Alignment.centerLeft,
      child: FittedBox(
        fit: BoxFit.contain,
        alignment: Alignment.centerLeft,
        child: canvas,
      ),
    );
  }
}
