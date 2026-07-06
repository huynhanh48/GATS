import 'package:flutter/material.dart';
import 'package:gats_academy/features/home/presentation/my_courses_screen.dart';

/// @deprecated Dùng [MyCoursesScreen] — giữ để tương thích import cũ.
class LibraryScreen extends StatelessWidget {
  const LibraryScreen({super.key});

  @override
  Widget build(BuildContext context) => const MyCoursesScreen();
}
