import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/features/routine/data/routine_node_catalog.dart';
import 'package:gats_academy/features/routine/models/routine_workflow.dart';

class WorkflowNodeWidget extends StatelessWidget {
  const WorkflowNodeWidget({
    super.key,
    required this.node,
    required this.isSelected,
    required this.isConnectSource,
    this.onTap,
    this.onLongPress,
    this.onDragStart,
    this.onDragEnd,
    this.onDragDelta,
    this.onOutputTap,
    this.onInputTap,
    this.readOnly = false,
  });

  final RoutineNode node;
  final bool isSelected;
  final bool isConnectSource;
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;
  final VoidCallback? onDragStart;
  final VoidCallback? onDragEnd;
  final ValueChanged<Offset>? onDragDelta;
  final VoidCallback? onOutputTap;
  final VoidCallback? onInputTap;
  final bool readOnly;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final template = RoutineNodeCatalog.templateFor(node.type);
    final color = template?.color ?? AppColors.primary;

    return Positioned(
      left: node.position.dx,
      top: node.position.dy,
      child: GestureDetector(
        onTap: onTap,
        onLongPress: readOnly ? null : onLongPress,
        onPanStart: readOnly || onDragDelta == null ? null : (_) => onDragStart?.call(),
        onPanEnd: readOnly || onDragDelta == null ? null : (_) => onDragEnd?.call(),
        onPanCancel: readOnly || onDragDelta == null ? null : () => onDragEnd?.call(),
        onPanUpdate: readOnly || onDragDelta == null
            ? null
            : (details) => onDragDelta!(details.delta),
        child: SizedBox(
          width: RoutineNode.nodeWidth,
          height: RoutineNode.nodeHeight,
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Positioned.fill(
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
                  decoration: BoxDecoration(
                    color: gats.surface,
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    border: Border.all(
                      color: isSelected || isConnectSource ? color : gats.divider,
                      width: isSelected || isConnectSource ? 2 : 1,
                    ),
                    boxShadow: isSelected ? AppShadows.elevated : AppShadows.card,
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 34,
                        height: 34,
                        decoration: BoxDecoration(
                          color: color.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(AppRadius.sm),
                        ),
                        child: Icon(template?.icon ?? Icons.circle, color: color, size: 18),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              node.title,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context).textTheme.labelMedium?.copyWith(
                                    fontWeight: FontWeight.w700,
                                    color: gats.textPrimary,
                                  ),
                            ),
                            Text(
                              node.subtitle,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: gats.textSecondary,
                                    fontSize: 11,
                                  ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              if (!readOnly && node.type != RoutineNodeType.trigger)
                Positioned(
                  left: -8,
                  top: RoutineNode.nodeHeight / 2 - 8,
                  child: _PortDot(
                    color: color,
                    highlighted: isConnectSource,
                    onTap: onInputTap,
                  ),
                ),
              if (!readOnly)
                Positioned(
                  right: -8,
                  top: RoutineNode.nodeHeight / 2 - 8,
                  child: _PortDot(
                    color: color,
                    highlighted: isConnectSource,
                    onTap: onOutputTap,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PortDot extends StatelessWidget {
  const _PortDot({
    required this.color,
    required this.highlighted,
    this.onTap,
  });

  final Color color;
  final bool highlighted;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 16,
        height: 16,
        decoration: BoxDecoration(
          color: highlighted ? color : gats.surface,
          shape: BoxShape.circle,
          border: Border.all(color: color, width: 2),
        ),
      ),
    );
  }
}
