import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/section_card.dart';
import 'package:gats_academy/features/routine/models/routine_workflow.dart';
import 'package:gats_academy/features/routine/presentation/routine_editor_screen.dart';
import 'package:gats_academy/features/routine/presentation/widgets/workflow_connection_painter.dart';
import 'package:gats_academy/features/routine/presentation/widgets/workflow_node_widget.dart';

class RoutineWorkflowSection extends StatelessWidget {
  const RoutineWorkflowSection({
    super.key,
    required this.workflow,
    required this.onWorkflowChanged,
  });

  final RoutineWorkflow workflow;
  final ValueChanged<RoutineWorkflow> onWorkflowChanged;

  Future<void> _openEditor(BuildContext context) async {
    final result = await Navigator.of(context).push<RoutineWorkflow>(
      MaterialPageRoute<RoutineWorkflow>(
        builder: (_) => RoutineEditorScreen(initialWorkflow: workflow),
      ),
    );
    if (result != null) onWorkflowChanged(result);
  }

  @override
  Widget build(BuildContext context) {
    final ordered = workflow.orderedNodes;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(AppStrings.dailyRoutineTitle, style: Theme.of(context).textTheme.titleMedium),
            ),
            TextButton.icon(
              onPressed: () => _openEditor(context),
              icon: const Icon(Icons.account_tree_outlined, size: 18),
              label: Text(AppStrings.routineEdit),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(AppStrings.routinePreviewSubtitle, style: Theme.of(context).textTheme.bodySmall),
        const SizedBox(height: AppSpacing.md),
        SectionCard(
          padding: EdgeInsets.zero,
          child: Column(
            children: [
              SizedBox(
                height: 200,
                child: ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadius.md)),
                  child: Container(
                    color: AppColors.background,
                    child: InteractiveViewer(
                      minScale: 0.5,
                      maxScale: 1.2,
                      child: SizedBox(
                        width: 700,
                        height: 200,
                        child: Stack(
                          children: [
                            CustomPaint(
                              size: const Size(700, 200),
                              painter: WorkflowConnectionPainter(
                                connections: workflow.connections,
                                nodes: workflow.nodes,
                              ),
                            ),
                            ...workflow.nodes.map(
                              (node) => WorkflowNodeWidget(
                                node: node,
                                isSelected: false,
                                isConnectSource: false,
                                readOnly: true,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Column(
                  children: List.generate(ordered.length, (index) {
                    final node = ordered[index];
                    return Padding(
                      padding: EdgeInsets.only(bottom: index < ordered.length - 1 ? AppSpacing.sm : 0),
                      child: Row(
                        children: [
                          Text(
                            '${index + 1}',
                            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w700,
                                ),
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          const Icon(Icons.arrow_forward_rounded, size: 14, color: AppColors.textSecondary),
                          const SizedBox(width: AppSpacing.sm),
                          Expanded(
                            child: Text(
                              node.title,
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                            ),
                          ),
                          Text(node.subtitle, style: Theme.of(context).textTheme.bodySmall),
                        ],
                      ),
                    );
                  }),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
