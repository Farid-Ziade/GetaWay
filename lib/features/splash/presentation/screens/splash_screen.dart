import 'dart:async';
import 'dart:math';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:getaway_app/app/app_routes.dart';
import 'package:getaway_app/features/auth/presentation/auth_navigation.dart';

/// Shows branding while Firebase Auth state is checked once.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  final List<String> baseLoadingTexts = [
    'Crafting your perfect escape...',
    'Unlocking weekend wonders...',
    'Planning your ideal getaway...',
    'Discovering nearby adventures...',
    'Curating your dream weekend...',
    'Mapping out magical moments...',
    'Preparing personalized paths...',
    'Finding your next retreat...',
  ];

  late List<String> shuffledTexts;
  int currentTextIndex = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();

    shuffledTexts = List.from(baseLoadingTexts)..shuffle(Random());

    _timer = Timer.periodic(const Duration(milliseconds: 1500), (timer) {
      if (mounted) {
        setState(() {
          currentTextIndex = (currentTextIndex + 1) % shuffledTexts.length;
        });
      }
    });

    _checkAuthAndNavigate();
  }

  Future<void> _checkAuthAndNavigate() async {
    await Future.delayed(const Duration(milliseconds: 4500));

    if (!mounted) return;

    _timer?.cancel();

    final user = FirebaseAuth.instance.currentUser;

    if (user != null) {
      await navigateAfterAuth(context);
    } else if (mounted) {
      Navigator.pushReplacementNamed(context, AppRoutes.login);
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final primary = Theme.of(context).colorScheme.primary;
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32.0),
              child: Text(
                shuffledTexts[currentTextIndex],
                style: GoogleFonts.poppins(
                  fontSize: 24,
                  fontWeight: FontWeight.w600,
                  color: primary,
                  height: 1.4,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 60),
            CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(primary),
              strokeWidth: 5,
            ),
          ],
        ),
      ),
    );
  }
}
