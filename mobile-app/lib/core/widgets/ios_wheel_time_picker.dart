import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/app_theme.dart';

/// Wheel giờ/phút nhẹ — không dùng CupertinoDatePicker (lag trên Android).
class IosWheelTimePicker extends StatefulWidget {
  const IosWheelTimePicker({
    super.key,
    required this.time,
  });

  final TimeOfDay time;

  @override
  State<IosWheelTimePicker> createState() => IosWheelTimePickerState();
}

class IosWheelTimePickerState extends State<IosWheelTimePicker> {
  static const _itemExtent = 40.0;
  static const _visibleItems = 5;

  late FixedExtentScrollController _hourController;
  late FixedExtentScrollController _minuteController;
  FixedExtentScrollController? _periodController;

  late int _hour;
  late int _minute;
  late bool _use24h;
  bool _controllersReady = false;

  TimeOfDay get time => TimeOfDay(hour: _hour, minute: _minute);

  @override
  void initState() {
    super.initState();
    _hour = widget.time.hour;
    _minute = widget.time.minute;
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final use24h = MediaQuery.of(context).alwaysUse24HourFormat;
    if (_controllersReady && use24h == _use24h) return;

    _use24h = use24h;
    if (_controllersReady) {
      _disposeControllers();
    }
    _initControllers();
    _controllersReady = true;
  }

  @override
  void didUpdateWidget(IosWheelTimePicker oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.time.hour != widget.time.hour ||
        oldWidget.time.minute != widget.time.minute) {
      _hour = widget.time.hour;
      _minute = widget.time.minute;
      if (_controllersReady) {
        _jumpControllersToTime();
      }
    }
  }

  void _initControllers() {
    if (_use24h) {
      _hourController = FixedExtentScrollController(initialItem: _hour);
      _minuteController = FixedExtentScrollController(initialItem: _minute);
      _periodController = null;
      return;
    }

    final period = _hour >= 12 ? 1 : 0;
    final hour12 = _hour % 12 == 0 ? 11 : (_hour % 12) - 1;
    _hourController = FixedExtentScrollController(initialItem: hour12);
    _minuteController = FixedExtentScrollController(initialItem: _minute);
    _periodController = FixedExtentScrollController(initialItem: period);
  }

  void _jumpControllersToTime() {
    if (_use24h) {
      _hourController.jumpToItem(_hour);
      _minuteController.jumpToItem(_minute);
      return;
    }

    final period = _hour >= 12 ? 1 : 0;
    final hour12 = _hour % 12 == 0 ? 11 : (_hour % 12) - 1;
    _hourController.jumpToItem(hour12);
    _minuteController.jumpToItem(_minute);
    _periodController?.jumpToItem(period);
  }

  void _disposeControllers() {
    _hourController.dispose();
    _minuteController.dispose();
    _periodController?.dispose();
    _periodController = null;
  }

  void _onHourChanged(int index) {
    if (_use24h) {
      _hour = index;
      return;
    }

    final hour12 = index + 1;
    final isPm = (_periodController?.selectedItem ?? 0) == 1;
    _hour = hour12 % 12;
    if (isPm) _hour += 12;
  }

  void _onMinuteChanged(int index) {
    _minute = index;
  }

  void _onPeriodChanged(int index) {
    final hour12 = _hourController.selectedItem + 1;
    _hour = hour12 % 12;
    if (index == 1) _hour += 12;
  }

  @override
  void dispose() {
    if (_controllersReady) {
      _disposeControllers();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_controllersReady) {
      return SizedBox(height: _itemExtent * _visibleItems);
    }

    final gats = context.gatsColors;
    final textColor = gats.textPrimary;

    return RepaintBoundary(
      child: Container(
        height: _itemExtent * _visibleItems,
        decoration: BoxDecoration(
          color: gats.surface,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: gats.divider.withValues(alpha: 0.7)),
        ),
        clipBehavior: Clip.hardEdge,
        child: Stack(
          children: [
            Center(
              child: Container(
                height: _itemExtent,
                margin: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
              ),
            ),
            Row(
              children: [
                Expanded(
                  child: _WheelColumn(
                    controller: _hourController,
                    itemCount: _use24h ? 24 : 12,
                    itemExtent: _itemExtent,
                    labelBuilder: (index) => _use24h
                        ? index.toString().padLeft(2, '0')
                        : (index + 1).toString(),
                    onSelectedItemChanged: _onHourChanged,
                    textColor: textColor,
                  ),
                ),
                Text(
                  ':',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: textColor,
                    decoration: TextDecoration.none,
                  ),
                ),
                Expanded(
                  child: _WheelColumn(
                    controller: _minuteController,
                    itemCount: 60,
                    itemExtent: _itemExtent,
                    labelBuilder: (index) => index.toString().padLeft(2, '0'),
                    onSelectedItemChanged: _onMinuteChanged,
                    textColor: textColor,
                  ),
                ),
                if (!_use24h)
                  Expanded(
                    child: _WheelColumn(
                      controller: _periodController!,
                      itemCount: 2,
                      itemExtent: _itemExtent,
                      labelBuilder: (index) => index == 0 ? 'AM' : 'PM',
                      onSelectedItemChanged: _onPeriodChanged,
                      textColor: textColor,
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _WheelColumn extends StatelessWidget {
  const _WheelColumn({
    required this.controller,
    required this.itemCount,
    required this.itemExtent,
    required this.labelBuilder,
    required this.onSelectedItemChanged,
    required this.textColor,
  });

  final FixedExtentScrollController controller;
  final int itemCount;
  final double itemExtent;
  final String Function(int index) labelBuilder;
  final ValueChanged<int> onSelectedItemChanged;
  final Color textColor;

  @override
  Widget build(BuildContext context) {
    return ListWheelScrollView.useDelegate(
      controller: controller,
      itemExtent: itemExtent,
      diameterRatio: 1.4,
      perspective: 0.003,
      physics: const FixedExtentScrollPhysics(),
      onSelectedItemChanged: onSelectedItemChanged,
      childDelegate: ListWheelChildBuilderDelegate(
        childCount: itemCount,
        builder: (context, index) {
          return Center(
            child: Text(
              labelBuilder(index),
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w600,
                color: textColor,
                decoration: TextDecoration.none,
              ),
            ),
          );
        },
      ),
    );
  }
}
