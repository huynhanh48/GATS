import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:gats_academy/app.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/services/app_locale_controller.dart';
import 'package:gats_academy/core/services/onboarding_prefs.dart';
import 'package:gats_academy/data/mock/mock_data.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() async {
    SharedPreferences.setMockInitialValues({
      'onboarding_complete': true,
      'app_locale': 'vi',
    });
    await AppLocaleController.instance.init();
    await OnboardingPrefs.init();
  });

  testWidgets('App shell renders with bottom navigation', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(const GatsAcademyApp());
    await tester.pumpAndSettle();

    expect(find.text(AppStrings.navHome), findsWidgets);
    expect(find.text(AppStrings.navDaily), findsOneWidget);
    expect(find.text(AppStrings.navCoach), findsOneWidget);
    expect(find.text(AppStrings.navStore), findsOneWidget);
    expect(find.text('AI cho Dân văn phòng'), findsWidgets);
    expect(find.text(MockData.continueCourse), findsWidgets);
  });
}
