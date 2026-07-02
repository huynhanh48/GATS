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
}
