import 'package:flutter/material.dart';

import 'package:getaway_app/app/app_routes.dart';
import 'package:getaway_app/core/theme/app_theme.dart';
import 'package:getaway_app/features/auth/presentation/screens/link_account_screen.dart';
import 'package:getaway_app/features/auth/presentation/screens/login_screen.dart';
import 'package:getaway_app/features/home/presentation/screens/home_screen.dart';
import 'package:getaway_app/features/splash/presentation/screens/splash_screen.dart';

/// Root widget: theme, debug banner, and named routes for the shell flow.
class GetawayApp extends StatelessWidget {
  const GetawayApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GetaWay',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      home: const SplashScreen(),
      routes: {
        AppRoutes.login: (_) => const LoginScreen(),
        AppRoutes.linkAccount: (_) => const LinkAccountScreen(),
        AppRoutes.home: (_) => const HomeScreen(),
      },
    );
  }
}
