import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_core_platform_interface/test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:getaway_app/app/getaway_app.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    setupFirebaseCoreMocks();
    await Firebase.initializeApp();
  });

  testWidgets('GetaWay shows splash then login when not signed in', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const GetawayApp());
    await tester.pump();
    expect(find.byType(CircularProgressIndicator), findsOneWidget);

    // Splash waits ~4.5s before navigating; advance fake time so no timers leak.
    await tester.pump(const Duration(seconds: 5));
    await tester.pumpAndSettle();

    expect(find.text('Welcome Back'), findsOneWidget);
  });
}
