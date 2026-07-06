import 'dart:async';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/app_theme.dart';

/// Time picker kiểu iOS — state cục bộ, không rebuild parent mỗi frame.
class IosWheelTimePicker extends StatefulWidget {
  const IosWheelTimePicker({
    super.key,
    required this.time,
    this.onTimeChanged,
  });

  final TimeOfDay time;

  /// Gọi thưa (debounce) khi user cuộn — tránh lag rebuild cả quiz.
  final ValueChanged<TimeOfDay>? onTimeChanged;

  @override
  State<IosWheelTimePicker> createState() => IosWheelTimePickerState();
}

class IosWheelTimePickerState extends State<IosWheelTimePicker> {
  static const _epoch = 2020;

  late DateTime _selected;
  Timer? _debounce;

  TimeOfDay get time => TimeOfDay(hour: _selected.hour, minute: _selected.minute);

  @override
  void initState() {
    super.initState();
    _selected = _dateTimeFrom(widget.time);
  }

  @override
  void didUpdateWidget(IosWheelTimePicker oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.time.hour != widget.time.hour || oldWidget.time.minute != widget.time.minute) {
      _selected = _dateTimeFrom(widget.time);
    }
  }

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }

  DateTime _dateTimeFrom(TimeOfDay value) {
    return DateTime(_epoch, 1, 1, value.hour, value.minute);
  }

  void _onDateTimeChanged(DateTime value) {
    if (_selected.hour == value.hour && _selected.minute == value.minute) return;

    setState(() => _selected = value);

    final callback = widget.onTimeChanged;
    if (callback == null) return;

    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 280), () {
      if (!mounted) return;
      callback(TimeOfDay(hour: value.hour, minute: value.minute));
    });
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final use24h = MediaQuery.of(context).alwaysUse24HourFormat;

    return RepaintBoundary(
      child: Container(
        height: 200,
        decoration: BoxDecoration(
          color: gats.surface,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: gats.divider.withValues(alpha: 0.7)),
        ),
        clipBehavior: Clip.antiAlias,
        child: CupertinoTheme(
          data: CupertinoThemeData(
            brightness: Theme.of(context).brightness,
            textTheme: CupertinoTextThemeData(
              dateTimePickerTextStyle: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w600,
                color: gats.textPrimary,
                letterSpacing: 0.5,
              ),
            ),
          ),
          child: CupertinoDatePicker(
            key: const ValueKey('onboarding_reminder_time_picker'),
            mode: CupertinoDatePickerMode.time,
            use24hFormat: use24h,
            initialDateTime: _selected,
            onDateTimeChanged: _onDateTimeChanged,
          ),
        ),
      ),
    );
  }
}
