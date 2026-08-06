import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
  bool _isDraggingNode = false;
  int _idCounter = 100;

  @override
  void initState() {
    super.initState();
    _workflow = widget.initialWorkflow;
    _idCounter = _workflow.nodes.length + 100;
  }

  String _nextId() => 'n${_idCounter++}';

  RoutineNode? _nodeById(String id) {
    for (final n in _workflow.nodes) {
      if (n.id == id) return n;
    }
    return null;
  }

  void _selectNode(String? id) {
    setState(() => _selectedNodeId = id);
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

  void _connectNodes(String fromId, String toId) {
    if (fromId == toId) return;
    final to = _nodeById(toId);
    if (to == null || to.type == RoutineNodeType.trigger) return;
    final exists = _workflow.connections.any(
      (c) => c.fromNodeId == fromId && c.toNodeId == toId,
    );
    if (exists) return;
    setState(() {
      _workflow = _workflow.copyWith(
        connections: [
          ..._workflow.connections,
          RoutineConnection(
            id: 'c${_idCounter++}',
            fromNodeId: fromId,
            toNodeId: toId,
          ),
        ],
      );
      _selectedNodeId = fromId;
    });
  }

  void _disconnectNodes(String fromId, String toId) {
    setState(() {
      _workflow = _workflow.copyWith(
        connections: _workflow.connections
            .where((c) => !(c.fromNodeId == fromId && c.toNodeId == toId))
            .toList(),
      );
    });
  }

  Future<void> _showConnectSheet(String fromId) async {
    final from = _nodeById(fromId);
    if (from == null) return;

    HapticFeedback.mediumImpact();
    setState(() => _selectedNodeId = fromId);

    final gats = context.gatsColors;
    final targets = _workflow.nodes
        .where(
          (n) => n.id != fromId && n.type != RoutineNodeType.trigger,
        )
        .toList();

    await showModalBottomSheet<void>(
      context: context,
      backgroundColor: gats.surface,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.lg)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg,
              AppSpacing.md,
              AppSpacing.lg,
              AppSpacing.lg,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 36,
                    height: 4,
                    margin: const EdgeInsets.only(bottom: AppSpacing.md),
                    decoration: BoxDecoration(
                      color: gats.divider,
                      borderRadius: BorderRadius.circular(AppRadius.pill),
                    ),
                  ),
                ),
                Text(
                  AppStrings.routineConnectFrom(from.title),
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  AppStrings.routineConnectToHint,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: gats.textSecondary,
                      ),
                ),
                const SizedBox(height: AppSpacing.md),
                if (targets.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: AppSpacing.xl),
                    child: Center(
                      child: Text(
                        AppStrings.routineConnectEmpty,
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: gats.textSecondary,
                            ),
                      ),
                    ),
                  )
                else
                  ConstrainedBox(
                    constraints: BoxConstraints(
                      maxHeight: MediaQuery.sizeOf(context).height * 0.45,
                    ),
                    child: ListView.separated(
                      shrinkWrap: true,
                      itemCount: targets.length,
                      separatorBuilder: (_, _) =>
                          const SizedBox(height: AppSpacing.sm),
                      itemBuilder: (context, index) {
                        final target = targets[index];
                        final template =
                            RoutineNodeCatalog.templateFor(target.type);
                        final color = template?.color ?? AppColors.primary;
                        final connected = _workflow.connections.any(
                          (c) =>
                              c.fromNodeId == fromId &&
                              c.toNodeId == target.id,
                        );
                        return ListTile(
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(AppRadius.md),
                            side: BorderSide(
                              color: connected
                                  ? color.withValues(alpha: 0.5)
                                  : gats.divider,
                            ),
                          ),
                          leading: CircleAvatar(
                            backgroundColor: color.withValues(alpha: 0.15),
                            child: Icon(
                              template?.icon ?? Icons.circle,
                              color: color,
                              size: 20,
                            ),
                          ),
                          title: Text(target.title),
                          subtitle: Text(
                            connected
                                ? AppStrings.routineDisconnect
                                : target.subtitle,
                          ),
                          trailing: Icon(
                            connected
                                ? Icons.link_off_rounded
                                : Icons.arrow_forward_rounded,
                            color: connected ? AppColors.accent : color,
                          ),
                          onTap: () {
                            Navigator.pop(context);
                            if (connected) {
                              _disconnectNodes(fromId, target.id);
                            } else {
                              _connectNodes(fromId, target.id);
                            }
                          },
                        );
                      },
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
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
                Text(
                  AppStrings.routineAddNode,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: AppSpacing.md),
                Wrap(
                  spacing: AppSpacing.sm,
                  runSpacing: AppSpacing.sm,
                  children: RoutineNodeCatalog.templates.map((template) {
                    final hasTrigger = _workflow.nodes
                        .any((n) => n.type == RoutineNodeType.trigger);
                    if (template.type == RoutineNodeType.trigger &&
                        hasTrigger) {
                      return const SizedBox.shrink();
                    }
                    return ActionChip(
                      avatar: Icon(
                        template.icon,
                        size: 18,
                        color: template.color,
                      ),
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
      bounds.top +
          24 +
          (_workflow.nodes.length * 36) %
              math.max(bounds.height - RoutineNode.nodeHeight - 48, 80),
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

  @override
  Widget build(BuildContext context) {
    final canvasSize = WorkflowCanvasLayout.canvasSizeFor(_workflow.nodes);
    final editorWidth = canvasSize.width < 900 ? 900.0 : canvasSize.width + 120;
    final editorHeight =
        canvasSize.height < 600 ? 600.0 : canvasSize.height + 120;

    return GatsThemedScaffold(
      appBar: AppBar(
        title: Text(AppStrings.routineEditorTitle),
        actions: [
          if (_selectedNodeId != null) ...[
            IconButton(
              tooltip: AppStrings.routineConnectAction,
              icon: const Icon(Icons.link_rounded),
              onPressed: () => _showConnectSheet(_selectedNodeId!),
            ),
            IconButton(
              tooltip: MaterialLocalizations.of(context).deleteButtonTooltip,
              icon: const Icon(Icons.delete_outline_rounded),
              onPressed: () => _deleteNode(_selectedNodeId!),
            ),
          ],
          TextButton(onPressed: _save, child: Text(AppStrings.routineSave)),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: InteractiveViewer(
              boundaryMargin: const EdgeInsets.all(120),
              minScale: 0.6,
              maxScale: 1.6,
              panEnabled: !_isDraggingNode,
              child: WorkflowCanvas(
                workflow: _workflow,
                readOnly: false,
                selectedNodeId: _selectedNodeId,
                minWidth: editorWidth,
                minHeight: editorHeight,
                onCanvasTap: () => _selectNode(null),
                onSelectNode: _selectNode,
                onConnectNode: _showConnectSheet,
                onMoveNode: _moveNode,
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
