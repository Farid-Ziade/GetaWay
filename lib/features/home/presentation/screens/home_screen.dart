import 'dart:async';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:getaway_app/app/app_routes.dart';
import 'package:getaway_app/features/auth/data/services/auth_service.dart';

/// Signed-in landing screen. Map, weather, and AI planner arrive in later phases.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _auth = AuthService();
  StreamSubscription<User?>? _authSub;

  @override
  void initState() {
    super.initState();
    _authSub = _auth.authStateChanges.listen((user) {
      if (!mounted) return;
      if (user == null) {
        Navigator.of(context).pushNamedAndRemoveUntil(
          AppRoutes.login,
          (_) => false,
        );
      }
    });
  }

  @override
  void dispose() {
    _authSub?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(
        title: const Text('GetaWay'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Log out',
            onPressed: () async {
              await _auth.logout();
              if (!context.mounted) return;
              Navigator.pushReplacementNamed(context, AppRoutes.login);
            },
          ),
        ],
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.map_outlined, size: 72, color: scheme.primary),
              const SizedBox(height: 24),
              Text(
                'You are all set',
                style: GoogleFonts.poppins(
                  fontSize: 22,
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                'Maps, weather, and your AI weekend planner will show up here in upcoming steps.',
                style: GoogleFonts.poppins(
                  fontSize: 15,
                  height: 1.45,
                  color: scheme.onSurfaceVariant,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
