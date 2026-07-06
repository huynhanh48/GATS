import 'package:flutter/material.dart';

abstract final class AppShadows {
  static const card = [
    BoxShadow(
      color: Color(0x140070EB),
      blurRadius: 16,
      offset: Offset(0, 4),
    ),
  ];

  static const elevated = [
    BoxShadow(
      color: Color(0x1F0070EB),
      blurRadius: 24,
      offset: Offset(0, 8),
    ),
  ];

  /// Subtle shadow for hover/press states.
  static const subtle = [
    BoxShadow(
      color: Color(0x0A000000),
      blurRadius: 8,
      offset: Offset(0, 2),
    ),
  ];

  /// Dark-mode variant — uses darker, less saturated shadows.
  static const cardDark = [
    BoxShadow(
      color: Color(0x40000000),
      blurRadius: 16,
      offset: Offset(0, 4),
    ),
  ];
}

