import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:gats_academy/features/routine/data/routine_node_catalog.dart';
import 'package:gats_academy/features/routine/models/routine_workflow.dart';
import 'package:shared_preferences/shared_preferences.dart';

abstract final class RoutineWorkflowStore {
  static const _key = 'routine_workflow_json';

  static SharedPreferences? _prefs;
  static bool _memoryFallback = false;
  static RoutineWorkflow? _memoryWorkflow;

  static Future<void> init() async {
    try {
      _prefs = await SharedPreferences.getInstance();
    } on PlatformException {
      _memoryFallback = true;
    } catch (_) {
      _memoryFallback = true;
    }
  }

  static Future<RoutineWorkflow> load() async {
    if (_memoryFallback) {
      return _memoryWorkflow ?? RoutineNodeCatalog.defaultWorkflow();
    }
    try {
      final prefs = _prefs ?? await SharedPreferences.getInstance();
      final raw = prefs.getString(_key);
      if (raw == null || raw.isEmpty) {
        return RoutineNodeCatalog.defaultWorkflow();
      }
      return RoutineWorkflow.fromJsonString(raw);
    } catch (e) {
      debugPrint('RoutineWorkflowStore.load: $e');
      return RoutineNodeCatalog.defaultWorkflow();
    }
  }

  static Future<void> save(RoutineWorkflow workflow) async {
    if (_memoryFallback) {
      _memoryWorkflow = workflow;
      return;
    }
    try {
      final prefs = _prefs ?? await SharedPreferences.getInstance();
      await prefs.setString(_key, workflow.toJsonString());
    } catch (e) {
      debugPrint('RoutineWorkflowStore.save: $e');
      _memoryFallback = true;
      _memoryWorkflow = workflow;
    }
  }
}
