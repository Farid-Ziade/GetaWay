import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl_phone_field/intl_phone_field.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool _isLogin = true;
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  String _phoneNumber = '';
  bool _phoneValid = false;
  bool _passwordsMatch = false;

  // Visibility toggles
  bool _obscurePassword = true;
  bool _obscureConfirm = true;

  @override
  void initState() {
    super.initState();
    _passwordController.addListener(_checkPasswordMatch);
    _confirmPasswordController.addListener(_checkPasswordMatch);
  }

  void _checkPasswordMatch() {
    final pass = _passwordController.text.trim();
    final confirm = _confirmPasswordController.text.trim();
    final match = pass.isNotEmpty && confirm.isNotEmpty && pass == confirm;
    setState(() {
      _passwordsMatch = match;
    });
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _handleForgotPassword() {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Enter your email first', style: GoogleFonts.poppins()),
        ),
      );
      return;
    }
    // TODO: Firebase sendPasswordResetEmail
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Reset link sent to $email',
          style: GoogleFonts.poppins(),
        ),
      ),
    );
  }

  bool _isValidEmail(String email) =>
      RegExp(r'^[^@]+@[^@]+\.[^@]+$').hasMatch(email);

  bool _isPasswordStrong() {
    final p = _passwordController.text.trim();
    return p.length >= 8 &&
        RegExp(r'[A-Z]').hasMatch(p) &&
        RegExp(r'\d').hasMatch(p) &&
        RegExp(r'[@#$%^&*()_+\-=\[\]{}|;:",.<>?/]').hasMatch(p);
  }

  String? _validateSignup() {
    final phoneText = _phoneController.text.trim();
    final email = _emailController.text.trim();

    if (_isLogin) {
      if (phoneText.isEmpty && email.isEmpty) return 'Provide phone or email';
      return null;
    }

    // Signup validations
    if (_phoneNumber.isEmpty) {
      return 'Enter a phone number';
    }
    if (!_phoneValid) {
      return 'Enter a valid phone number';
    }
    if (email.isNotEmpty && !_isValidEmail(email)) {
      return 'Enter a valid email address';
    }
    if (!_isPasswordStrong()) {
      return 'Password does not meet all requirements';
    }
    if (!_passwordsMatch) {
      return 'Passwords do not match';
    }
    return null;
  }

  Widget _buildPasswordStrengthBar() {
    final password = _passwordController.text.trim();

    // Check requirements independently — no confirm password involved
    bool hasLength = password.length >= 8;
    bool hasUpper = RegExp(r'(?=.*[A-Z])').hasMatch(password);
    bool hasNumber = RegExp(r'(?=.*\d)').hasMatch(password);
    bool hasSpecial = RegExp(
      r'(?=.*[@#$%^&*()_+\-=\[\]{}|;:",.<>?/])',
    ).hasMatch(password);

    // Count how many are satisfied
    int satisfied = 0;
    if (hasLength) satisfied++;
    if (hasUpper) satisfied++;
    if (hasNumber) satisfied++;
    if (hasSpecial) satisfied++;

    double progress = satisfied / 4.0;

    Color barColor = satisfied == 4
        ? Colors.green
        : (satisfied >= 2 ? Colors.orange : Colors.red);

    // Dynamic message that removes items as they are satisfied
    List<String> missing = [];
    if (!hasLength) missing.add('at least 8 characters');
    if (!hasUpper) missing.add('one uppercase letter');
    if (!hasNumber) missing.add('one number');
    if (!hasSpecial) missing.add('one special character');

    String feedbackText;
    if (satisfied == 4) {
      feedbackText = 'Strong password!';
    } else if (missing.isEmpty) {
      feedbackText = 'Password is improving...';
    } else if (missing.length == 1) {
      feedbackText = 'Password must contain ${missing[0]}';
    } else if (missing.length == 2) {
      feedbackText = 'Password must contain ${missing[0]} and ${missing[1]}';
    } else if (missing.length == 3) {
      feedbackText =
          'Password must contain ${missing[0]}, ${missing[1]} and ${missing[2]}';
    } else {
      feedbackText =
          'Password must contain at least one uppercase letter, one number and one special character';
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: LinearProgressIndicator(
            value: progress,
            backgroundColor: Colors.grey[300],
            valueColor: AlwaysStoppedAnimation<Color>(barColor),
            minHeight: 10,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          feedbackText,
          style: GoogleFonts.poppins(
            fontSize: 12,
            color: barColor,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: true,
      body: Stack(
        children: [
          Container(
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: AssetImage('assets/images/Login.png'),
                fit: BoxFit.cover,
                colorFilter: ColorFilter.mode(Colors.black38, BlendMode.darken),
              ),
            ),
          ),
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(
                horizontal: 32.0,
                vertical: 20.0,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    _isLogin ? 'Welcome Back' : 'Create Account',
                    style: GoogleFonts.poppins(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _isLogin
                        ? 'Sign in with phone or email'
                        : 'Sign up with phone or email',
                    style: GoogleFonts.poppins(
                      fontSize: 16,
                      color: Colors.white70,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 40),

                  IntlPhoneField(
                    controller: _phoneController,
                    keyboardType: TextInputType.phone,
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: Colors.white.withOpacity(0.9),
                      hintText: 'Phone Number',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      counterText: '',
                    ),
                    initialCountryCode: 'LB',
                    onChanged: (phone) => setState(() {
                      _phoneNumber = phone.number;
                      _phoneValid = phone.isValidNumber();
                    }),
                  ),
                  const SizedBox(height: 24),

                  Row(
                    children: [
                      Expanded(child: Divider(color: Colors.white70)),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Text(
                          'OR',
                          style: GoogleFonts.poppins(color: Colors.white70),
                        ),
                      ),
                      Expanded(child: Divider(color: Colors.white70)),
                    ],
                  ),
                  const SizedBox(height: 24),

                  TextField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: Colors.white.withOpacity(0.9),
                      hintText: _isLogin ? 'Email' : 'Email (optional)',
                      prefixIcon: const Icon(Icons.email_outlined),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Password field
                  TextField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: Colors.white.withOpacity(0.9),
                      hintText: _isLogin ? 'Password' : 'Password',
                      prefixIcon: const Icon(Icons.lock_outline),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePassword
                              ? Icons.visibility_off
                              : Icons.visibility,
                          color: Colors.grey[700],
                        ),
                        onPressed: () {
                          setState(() {
                            _obscurePassword = !_obscurePassword;
                          });
                        },
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(
                          color: _isLogin || _passwordController.text.isEmpty
                              ? Colors.transparent
                              : (_passwordsMatch ? Colors.blue : Colors.red),
                          width: 2,
                        ),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(
                          color: _passwordsMatch ? Colors.blue : Colors.red,
                          width: 2.5,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Password strength bar + dynamic message (only in signup, only when password has content)
                  if (!_isLogin && _passwordController.text.isNotEmpty) ...[
                    _buildPasswordStrengthBar(),
                    const SizedBox(height: 16),
                  ],

                  if (_isLogin)
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton(
                        onPressed: _handleForgotPassword,
                        child: Text(
                          'Forgot Password?',
                          style: GoogleFonts.poppins(
                            color: Colors.white,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ),

                  // Confirm Password field
                  AnimatedOpacity(
                    opacity: _isLogin ? 0.0 : 1.0,
                    duration: const Duration(milliseconds: 300),
                    child: _isLogin
                        ? const SizedBox.shrink()
                        : Padding(
                            padding: const EdgeInsets.only(top: 8.0),
                            child: TextField(
                              controller: _confirmPasswordController,
                              obscureText: _obscureConfirm,
                              decoration: InputDecoration(
                                filled: true,
                                fillColor: Colors.white.withOpacity(0.9),
                                hintText: 'Confirm Password',
                                prefixIcon: const Icon(Icons.lock_outline),
                                suffixIcon: IconButton(
                                  icon: Icon(
                                    _obscureConfirm
                                        ? Icons.visibility_off
                                        : Icons.visibility,
                                    color: Colors.grey[700],
                                  ),
                                  onPressed: () {
                                    setState(() {
                                      _obscureConfirm = !_obscureConfirm;
                                    });
                                  },
                                ),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: BorderSide.none,
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: BorderSide(
                                    color:
                                        _confirmPasswordController.text.isEmpty
                                        ? Colors.transparent
                                        : (_passwordsMatch
                                              ? Colors.blue
                                              : Colors.red),
                                    width: 2,
                                  ),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: BorderSide(
                                    color: _passwordsMatch
                                        ? Colors.blue
                                        : Colors.red,
                                    width: 2.5,
                                  ),
                                ),
                              ),
                            ),
                          ),
                  ),

                  const SizedBox(height: 32),

                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: () {
                        final error = _validateSignup();
                        if (error != null) {
                          ScaffoldMessenger.of(
                            context,
                          ).showSnackBar(SnackBar(content: Text(error)));
                          return;
                        }
                        // TODO: Firebase auth
                        Navigator.pushReplacementNamed(context, '/permission');
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue[700],
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Text(
                        _isLogin ? 'Sign In' : 'Sign Up',
                        style: GoogleFonts.poppins(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        // TODO: Google sign-in
                      },
                      icon: Image.asset(
                        'assets/images/google_logo.png',
                        height: 40,
                      ),
                      label: Text(
                        'Sign in with Google',
                        style: GoogleFonts.poppins(
                          fontSize: 16,
                          color: Colors.white,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Colors.white),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        _isLogin
                            ? "Don't have an account?"
                            : 'Already have an account?',
                        style: GoogleFonts.poppins(color: Colors.white70),
                      ),
                      TextButton(
                        onPressed: () => setState(() => _isLogin = !_isLogin),
                        child: Text(
                          _isLogin ? 'Sign Up' : 'Login',
                          style: GoogleFonts.poppins(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
