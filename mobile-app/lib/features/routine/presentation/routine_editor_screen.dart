import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/features/routine/data/routine_node_catalog.dart';
import 'package:gats_academy/features/routine/data/routine_workflow_store.dart';
import 'package:gats_academy/features/routine/models/routine_workflow.dart';
import 'package:gats_academy/features/routine/presentation/widgets/workflow_connection_painter.dart';
import 'package:gats_academy/features/routine/presentation/widgets/workflow_node_widget.dart';

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

  void _moveNode(String id, Offset delta) {
    setState(() {
      _workflow = _workflow.copyWith(
        nodes: _workflow.nodes.map((n) {
          if (n.id != id) return n;
          return n.copyWith(position: n.position + delta);
        }).toList(),
      );
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

  void _deleteSelected() {
    final id = _selectedNodeId;
    if (id == null) return;
    setState(() {
      _workflow = _workflow.copyWith(
        nodes: _workflow.nodes.where((n) => n.id != id).toList(),
        connections: _workflow.connections
            .where((c) => c.fromNodeId != id && c.toNodeId != id)
            .toList(),
      );
      _selectedNodeId = null;
    });
  }

  Future<void> _save() async {
    await RoutineWorkflowStore.save(_workflow);
    if (!mounted) return;
    Navigator.of(context).pop(_workflow);
  }

  void _showPalette() {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: AppColors.surface,
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
    final offset = Offset(40 + (_workflow.nodes.length * 24) % 200, 60 + (_workflow.nodes.length * 40) % 280);
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
    });
  }

  RoutineNode? get _connectingFromNode {
    if (_connectingFromId == null) return null;
    for (final n in _workflow.nodes) {
      if (n.id == _connectingFromId) return n;
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(AppStrings.routineEditorTitle),
        actions: [
          if (_selectedNodeId != null)
            IconButton(
              icon: const Icon(Icons.delete_outline_rounded),
              onPressed: _deleteSelected,
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
            child: Container(
              color: AppColors.background,
              child: InteractiveViewer(
                boundaryMargin: const EdgeInsets.all(200),
                minScale: 0.6,
                maxScale: 1.6,
                child: GestureDetector(
                  onTap: () => _selectNode(null),
                  onPanUpdate: _connectingFromId != null
                      ? (details) => setState(() => _pendingPointer = details.localPosition)
                      : null,
                  child: SizedBox(
                    width: 900,
                    height: 600,
                    child: Stack(
                      children: [
                        CustomPaint(
                          size: const Size(900, 600),
                          painter: WorkflowConnectionPainter(
                            connections: _workflow.connections,
                            nodes: _workflow.nodes,
                            pendingFrom: _connectingFromNode,
                            pendingTo: _pendingPointer,
                          ),
                        ),
                        ..._workflow.nodes.map((node) {
                          return WorkflowNodeWidget(
                            key: ValueKey(node.id),
                            node: node,
                            isSelected: _selectedNodeId == node.id,
                            isConnectSource: _connectingFromId == node.id,
                            onTap: () => _selectNode(node.id),
                            onLongPress: () {
                              _selectNode(node.id);
                              _deleteSelected();
                            },
                            onDragDelta: (d) => _moveNode(node.id, d),
                            onOutputTap: () => _onOutputTap(node.id),
                            onInputTap: () => _onInputTap(node.id),
                          );
                        }),
                      ],
                    ),
                  ),
                ),
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
