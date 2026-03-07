import 'package:flutter/material.dart';
import 'dart:async';
import 'dart:math';
import 'package:google_fonts/google_fonts.dart';
import 'screens/login_screen.dart';
import 'package:firebase_core/firebase_core.dart';

// Import this if you ran flutterfire configure
// import 'firebase_options.dart';   // ← uncomment when ready

void main() async {
  WidgetsFlutterBinding.ensureInitialized(); // ← MUST be first

  await Firebase.initializeApp();

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
      initialRoute: '/splash',
      routes: {
        '/splash': (context) => const SplashScreen(),
        '/login': (context) => const LoginScreen(),
        // Add more routes later (e.g., permission, map, chat)
        // '/permission': (context) => const PermissionScreen(),
      },
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

  late List<String> shuffledTexts;
  int currentTextIndex = 0;
  Timer? _timer;
  bool _isPreloaded = false; // track if image is preloaded

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

    // Move to login screen after 2 seconds
    Timer(const Duration(seconds: 2), () {
      _timer?.cancel();
      if (mounted) {
        Navigator.pushReplacementNamed(context, '/login');
      }
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    // Safe place to use context for inherited widgets (MediaQuery, etc.)
    if (!_isPreloaded) {
      _isPreloaded = true;
      precacheImage(
        const AssetImage('assets/images/Login.png'),
        context,
        onError: (e, s) {
          debugPrint('Preload failed: $e');
        },
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
