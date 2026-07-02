import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/app_theme.dart';

/// Wraps tab content for [NestedScrollView] with overlap injection.
class NestedTabScrollView extends StatelessWidget {
  const NestedTabScrollView({
    super.key,
    required this.storageKey,
    required this.slivers,
  });

  final String storageKey;
  final List<Widget> slivers;

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      key: PageStorageKey<String>(storageKey),
      slivers: [
        SliverOverlapInjector(
          handle: NestedScrollView.sliverOverlapAbsorberHandleFor(context),
        ),
        ...slivers,
      ],
    );
  }
}

class HomeTabBarDelegate extends SliverPersistentHeaderDelegate {
  HomeTabBarDelegate({required this.child});

  final Widget child;

  static const extent = 56.0;

  @override
  double get minExtent => extent;

  @override
  double get maxExtent => extent;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return ColoredBox(
      color: context.gatsColors.background,
      child: child,
    );
  }

  @override
  bool shouldRebuild(covariant HomeTabBarDelegate oldDelegate) =>
      oldDelegate.child != child;
}
