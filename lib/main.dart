import 'package:flutter/material.dart';
import 'dart:async';
import 'dart:math';
import 'package:google_fonts/google_fonts.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';

import 'screens/login_screen.dart';
// import 'firebase_options.dart'; // Uncomment after flutterfire configure

import 'services/auth_service.dart'; // Your AuthService

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Firebase.initializeApp(
    // options: DefaultFirebaseOptions.currentPlatform,
  );

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GetaWay',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.blue,
        textTheme: GoogleFonts.poppinsTextTheme(),
      ),
      home: const SplashScreen(), // ← Start directly with SplashScreen
    );
  }
}

// ────────────────────────────────────────────────
// SplashScreen now handles initial auth check
// ────────────────────────────────────────────────
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  final List<String> baseLoadingTexts = [
    "Crafting your perfect escape...",
    "Unlocking weekend wonders...",
    "Planning your ideal getaway...",
    "Discovering nearby adventures...",
    "Curating your dream weekend...",
    "Mapping out magical moments...",
    "Preparing personalized paths...",
    "Finding your next retreat...",
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

    // Start auth check + navigation after a minimum display time
    _checkAuthAndNavigate();
  }

  Future<void> _checkAuthAndNavigate() async {
    // Give splash at least 2-3 seconds to feel natural (adjust as needed)
    await Future.delayed(const Duration(seconds: 6));

    // Get current user synchronously (fast, uses cached token if available)
    final user = FirebaseAuth.instance.currentUser;

    if (!mounted) return;

    _timer?.cancel();

    if (user != null) {
      // Optional: reload to ensure token is fresh (rarely needed)
      // await user.reload();
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const HomeScreen()),
      );
    } else {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
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
                  color: Colors.blue[800],
                  height: 1.4,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 60),
            const CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Colors.blue),
              strokeWidth: 5,
            ),
          ],
        ),
      ),
    );
  }
}

// Temporary HomeScreen placeholder
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Welcome to GetaWay'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await AuthService().logout();
              // After logout, user will need to restart app or add auto-redirect
              // For now: just show message or navigate manually
              Navigator.pushReplacementNamed(
                context,
                '/login',
              ); // Or use a global navigator key
            },
          ),
        ],
      ),
      body: const Center(
        child: Text(
          'You are logged in!\n(Coming soon: Map + AI Chat)',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 24),
        ),
      ),
    );
  }
}
