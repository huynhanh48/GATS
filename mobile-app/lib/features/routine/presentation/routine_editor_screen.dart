import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/starry_sky_background.dart';
import 'package:gats_academy/features/routine/data/routine_node_catalog.dart';
import 'package:gats_academy/features/routine/data/routine_workflow_store.dart';
import 'package:gats_academy/features/routine/models/routine_workflow.dart';
import 'package:gats_academy/features/routine/presentation/widgets/workflow_canvas.dart';
import 'package:gats_academy/features/routine/presentation/widgets/workflow_canvas_layout.dart';

class RoutineEditorScreen extends StatefulWidget {
  const RoutineEditorScreen({super.key, required this.initialWorkflow});

  final RoutineWorkflow initialWorkflow;

  @override
  State<RoutineEditorScreen> createState() => _RoutineEditorScreenState();
}

class _RoutineEditorScreenState extends State<RoutineEditorScreen> {
  late RoutineWorkflow _workflow;
  String? _selectedNodeId;
  String? _connectingFromId;
  Offset? _pendingPointer;
  bool _isDraggingNode = false;
  int _idCounter = 100;

  @override
  void initState() {
    super.initState();
    _workflow = widget.initialWorkflow;
    _idCounter = _workflow.nodes.length + 100;
  }

  String _nextId() => 'n${_idCounter++}';

  void _selectNode(String? id) {
    setState(() {
      _selectedNodeId = id;
      _connectingFromId = null;
      _pendingPointer = null;
    });
  }

  void _moveNode(String nodeId, Offset delta) {
    setState(() {
      _workflow = _workflow.copyWith(
        nodes: _workflow.nodes.map((n) {
          if (n.id != nodeId) return n;
          return n.copyWith(position: n.position + delta);
        }).toList(),
      );
      _selectedNodeId = nodeId;
    });
  }

  void _onOutputTap(String nodeId) {
    setState(() {
      _connectingFromId = nodeId;
      _selectedNodeId = nodeId;
      _pendingPointer = _workflow.nodes.firstWhere((n) => n.id == nodeId).outputPort;
    });
  }

  void _onInputTap(String nodeId) {
    if (_connectingFromId == null || _connectingFromId == nodeId) return;
    final exists = _workflow.connections.any(
      (c) => c.fromNodeId == _connectingFromId && c.toNodeId == nodeId,
    );
    if (exists) {
      setState(() {
        _connectingFromId = null;
        _pendingPointer = null;
      });
      return;
    }
    setState(() {
      _workflow = _workflow.copyWith(
        connections: [
          ..._workflow.connections,
          RoutineConnection(
            id: 'c${_idCounter++}',
            fromNodeId: _connectingFromId!,
            toNodeId: nodeId,
          ),
        ],
      );
      _connectingFromId = null;
      _pendingPointer = null;
    });
  }

  void _deleteNode(String id) {
    setState(() {
      _workflow = _workflow.copyWith(
        nodes: _workflow.nodes.where((n) => n.id != id).toList(),
        connections: _workflow.connections
            .where((c) => c.fromNodeId != id && c.toNodeId != id)
            .toList(),
      );
      if (_selectedNodeId == id) _selectedNodeId = null;
      if (_connectingFromId == id) {
        _connectingFromId = null;
        _pendingPointer = null;
      }
    });
  }

  Future<void> _save() async {
    await RoutineWorkflowStore.save(_workflow);
    if (!mounted) return;
    Navigator.of(context).pop(_workflow);
  }

  void _showPalette() {
    final gats = context.gatsColors;
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: gats.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.lg)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(AppStrings.routineAddNode, style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: AppSpacing.md),
                Wrap(
                  spacing: AppSpacing.sm,
                  runSpacing: AppSpacing.sm,
                  children: RoutineNodeCatalog.templates.map((template) {
                    final hasTrigger = _workflow.nodes.any((n) => n.type == RoutineNodeType.trigger);
                    if (template.type == RoutineNodeType.trigger && hasTrigger) {
                      return const SizedBox.shrink();
                    }
                    return ActionChip(
                      avatar: Icon(template.icon, size: 18, color: template.color),
                      label: Text(template.label),
                      onPressed: () {
                        Navigator.pop(context);
                        _addNode(template);
                      },
                    );
                  }).toList(),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _addNode(RoutineNodeTemplate template) {
    final bounds = WorkflowCanvasLayout.boundsFor(_workflow.nodes);
    final offset = Offset(
      bounds.left + 24 + (_workflow.nodes.length * 20) % 180,
      bounds.top + 24 + (_workflow.nodes.length * 36) % math.max(bounds.height - RoutineNode.nodeHeight - 48, 80),
    );
    setState(() {
      _workflow = _workflow.copyWith(
        nodes: [
          ..._workflow.nodes,
          RoutineNode(
            id: _nextId(),
            type: template.type,
            title: template.label,
            subtitle: template.defaultSubtitle,
            position: offset,
            config: Map.of(template.defaultConfig),
          ),
        ],
      );
      _selectedNodeId = _workflow.nodes.last.id;
    });
  }

  bool get _canvasPanEnabled => !_isDraggingNode && _connectingFromId == null;

  @override
  Widget build(BuildContext context) {
    final canvasSize = WorkflowCanvasLayout.canvasSizeFor(_workflow.nodes);
    final editorWidth = canvasSize.width < 900 ? 900.0 : canvasSize.width + 120;
    final editorHeight = canvasSize.height < 600 ? 600.0 : canvasSize.height + 120;

    return GatsThemedScaffold(
      appBar: AppBar(
        title: Text(AppStrings.routineEditorTitle),
        actions: [
          if (_selectedNodeId != null)
            IconButton(
              icon: const Icon(Icons.delete_outline_rounded),
              onPressed: () => _deleteNode(_selectedNodeId!),
            ),
          TextButton(onPressed: _save, child: Text(AppStrings.routineSave)),
        ],
      ),
      body: Column(
        children: [
          if (_connectingFromId != null)
            Material(
              color: AppColors.accent.withValues(alpha: 0.12),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
                child: Row(
                  children: [
                    const Icon(Icons.link_rounded, color: AppColors.accent, size: 18),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: Text(
                        AppStrings.routineConnectHint,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.accent),
                      ),
                    ),
                    TextButton(
                      onPressed: () => setState(() {
                        _connectingFromId = null;
                        _pendingPointer = null;
                      }),
                      child: Text(AppStrings.routineCancelConnect),
                    ),
                  ],
                ),
              ),
            ),
          Expanded(
            child: InteractiveViewer(
              boundaryMargin: const EdgeInsets.all(120),
              minScale: 0.6,
              maxScale: 1.6,
              panEnabled: _canvasPanEnabled,
              scaleEnabled: _connectingFromId == null,
              child: WorkflowCanvas(
                workflow: _workflow,
                readOnly: false,
                selectedNodeId: _selectedNodeId,
                connectingFromId: _connectingFromId,
                pendingPointer: _pendingPointer,
                minWidth: editorWidth,
                minHeight: editorHeight,
                onCanvasTap: () => _selectNode(null),
                onCanvasPanUpdate: _connectingFromId != null
                    ? (details) => setState(() => _pendingPointer = details.localPosition)
                    : null,
                onSelectNode: _selectNode,
                onDeleteNode: _deleteNode,
                onMoveNode: _moveNode,
                onOutputTap: _onOutputTap,
                onInputTap: _onInputTap,
                onDragStart: () => setState(() => _isDraggingNode = true),
                onDragEnd: () => setState(() => _isDraggingNode = false),
              ),
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      AppStrings.routineEditorHint,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ),
                  FilledButton.icon(
                    onPressed: _showPalette,
                    icon: const Icon(Icons.add_rounded),
                    label: Text(AppStrings.routineAddNode),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
