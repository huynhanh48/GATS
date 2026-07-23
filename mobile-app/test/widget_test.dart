import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:gats_academy/app.dart';
import 'package:gats_academy/core/services/app_locale_controller.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() async {
    SharedPreferences.setMockInitialValues({
      'app_locale': 'vi',
    });
    await AppLocaleController.instance.init();
  });

  testWidgets('Signed-out app renders the production entry flow', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(const GatsAcademyApp());
    // Home contains intentional looping animations, so pumpAndSettle can never
    // become idle. Advance through initialization with a bounded frame.
    await tester.pump(const Duration(seconds: 2));

    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
