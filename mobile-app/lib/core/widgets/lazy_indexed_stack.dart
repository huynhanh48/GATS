import 'package:flutter/material.dart';

/// Chỉ build tab lần đầu được mở; tab ẩn tắt ticker (animation/timer).
class LazyIndexedStack extends StatefulWidget {
  const LazyIndexedStack({
    super.key,
    required this.index,
    required this.itemCount,
    required this.itemBuilder,
  });

  final int index;
  final int itemCount;
  final Widget Function(BuildContext context, int index) itemBuilder;

  @override
  State<LazyIndexedStack> createState() => _LazyIndexedStackState();
}

class _LazyIndexedStackState extends State<LazyIndexedStack> {
  late final List<Widget?> _cache;

  @override
  void initState() {
    super.initState();
    _cache = List<Widget?>.filled(widget.itemCount, null);
    _ensureBuilt(widget.index);
  }

  @override
  void didUpdateWidget(LazyIndexedStack oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.itemCount != oldWidget.itemCount) {
      _cache = List<Widget?>.filled(widget.itemCount, null);
    }
    _ensureBuilt(widget.index);
  }

  void _ensureBuilt(int index) {
    if (index < 0 || index >= widget.itemCount) return;
    _cache[index] ??= widget.itemBuilder(context, index);
  }

  @override
  Widget build(BuildContext context) {
    _ensureBuilt(widget.index);

    return IndexedStack(
      index: widget.index,
      sizing: StackFit.expand,
      children: List.generate(widget.itemCount, (i) {
        final child = _cache[i];
        if (child == null) {
          return const SizedBox.shrink();
        }
        return TickerMode(
          enabled: i == widget.index,
          child: RepaintBoundary(child: child),
        );
      }),
    );
  }
}

/// TabBarView chỉ build tab khi user mở lần đầu.
class LazyTabBarView extends StatefulWidget {
  const LazyTabBarView({
    super.key,
    required this.controller,
    required this.itemCount,
    required this.itemBuilder,
  });

  final TabController controller;
  final int itemCount;
  final Widget Function(BuildContext context, int index) itemBuilder;

  @override
  State<LazyTabBarView> createState() => _LazyTabBarViewState();
}

class _LazyTabBarViewState extends State<LazyTabBarView> {
  late final List<Widget?> _cache;
  late int _activeIndex;

  @override
  void initState() {
    super.initState();
    _cache = List<Widget?>.filled(widget.itemCount, null);
    _activeIndex = widget.controller.index;
    _ensureBuilt(_activeIndex);
    widget.controller.addListener(_onTabChanged);
  }

  @override
  void didUpdateWidget(LazyTabBarView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.controller != oldWidget.controller) {
      oldWidget.controller.removeListener(_onTabChanged);
      widget.controller.addListener(_onTabChanged);
      _activeIndex = widget.controller.index;
    }
    if (widget.itemCount != oldWidget.itemCount) {
      _cache = List<Widget?>.filled(widget.itemCount, null);
      _ensureBuilt(_activeIndex);
    }
  }

  @override
  void dispose() {
    widget.controller.removeListener(_onTabChanged);
    super.dispose();
  }

  void _onTabChanged() {
    if (!widget.controller.indexIsChanging) {
      _ensureBuilt(widget.controller.index);
    }
    if (_activeIndex != widget.controller.index) {
      setState(() => _activeIndex = widget.controller.index);
    }
  }

  void _ensureBuilt(int index) {
    if (index < 0 || index >= widget.itemCount) return;
    if (_cache[index] != null) return;
    _cache[index] = widget.itemBuilder(context, index);
  }

  @override
  Widget build(BuildContext context) {
    return TabBarView(
      controller: widget.controller,
      children: List.generate(widget.itemCount, (i) {
        _ensureBuilt(i);
        final child = _cache[i] ?? const SizedBox.shrink();
        return TickerMode(
          enabled: i == _activeIndex,
          child: RepaintBoundary(child: child),
        );
      }),
    );
  }
}
