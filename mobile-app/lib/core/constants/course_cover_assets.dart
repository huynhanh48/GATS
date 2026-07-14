/// Ảnh bìa khóa học tạm — luân phiên theo [seed] (thường `course.id.hashCode`).
abstract final class CourseCoverAssets {
  static const paths = <String>[
    'assets/images/images.jpg',
    'assets/images/images (1).jpg',
    'assets/images/images (2).jpg',
  ];

  static String pathForSeed(int seed) => paths[seed.abs() % paths.length];

  static String pathForIndex(int index) => paths[index % paths.length];
}
