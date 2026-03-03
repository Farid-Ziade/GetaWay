import 'package:flutter/material.dart';
import 'dart:async';
import 'dart:math'; // for Random shuffle
import 'package:google_fonts/google_fonts.dart';

void main() {
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
      home: const SplashScreen(),
    );
  }
}

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

  late List<String> shuffledTexts; // randomized order
  int currentTextIndex = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();

    // Shuffle once per app launch
    shuffledTexts = List.from(baseLoadingTexts)..shuffle(Random());

    // Change text every 2 seconds
    _timer = Timer.periodic(const Duration(seconds: 2), (timer) {
      setState(() {
        currentTextIndex = (currentTextIndex + 1) % shuffledTexts.length;
      });
    });

    // Move to login screen after 8 seconds
    Timer(const Duration(seconds: 8), () {
      _timer?.cancel();
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
    });
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
            // No logo here anymore

            // Rotating quote – centered and prominent
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32.0),
              child: Text(
                shuffledTexts[currentTextIndex],
                style: GoogleFonts.poppins(
                  fontSize: 24, // slightly larger
                  fontWeight: FontWeight.w600,
                  color: Colors.blue[800],
                  height: 1.4,
                ),
                textAlign: TextAlign.center,
              ),
            ),

            const SizedBox(height: 60),

            // Loading spinner
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

// Placeholder for next screen
class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Text(
          'Login / Signup Screen\n(Next step: mountain background + fields)',
          style: GoogleFonts.poppins(fontSize: 24, color: Colors.blueGrey),
          textAlign: TextAlign.center,
        ),
      ),
    );
  }
}
