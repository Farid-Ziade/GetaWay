import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl_phone_field/intl_phone_field.dart';
import 'package:intl_phone_field/phone_number.dart';

import 'package:getaway_app/features/auth/data/services/auth_service.dart';
import 'package:getaway_app/features/auth/presentation/auth_navigation.dart';
import 'package:getaway_app/features/auth/presentation/widgets/auth_exit_scope.dart';

enum _AuthIdentifier { email, phone }

/// Sign in or sign up with **email** or **phone** (one at a time), or Google.
/// After signup, the app routes to [LinkAccountScreen] until phone and identity
/// (email/password or Google) are linked on one account.
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _auth = AuthService();
  bool _isLogin = true;
  _AuthIdentifier _identifier = _AuthIdentifier.email;

  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _smsController = TextEditingController();

  String _phoneE164 = '';
  bool _phoneValid = false;
  bool _passwordsMatch = false;

  String? _verificationId;
  bool _codeSent = false;
  bool _busy = false;

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
    setState(() => _passwordsMatch = match);
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _smsController.dispose();
    super.dispose();
  }

  void _resetPhoneFlow() {
    _verificationId = null;
    _codeSent = false;
    _smsController.clear();
  }

  void _onIdentifierChanged(_AuthIdentifier v) {
    setState(() {
      _identifier = v;
      _resetPhoneFlow();
    });
  }

  void _onLoginSignupToggled() {
    setState(() {
      _isLogin = !_isLogin;
      _resetPhoneFlow();
    });
  }

  String _normalizeE164(PhoneNumber phone) {
    final raw = phone.completeNumber.trim();
    if (raw.startsWith('+')) return raw;
    return '+$raw';
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

  String? _validate() {
    if (_identifier == _AuthIdentifier.email) {
      final email = _emailController.text.trim();
      if (!_isValidEmail(email)) return 'Enter a valid email address';
      if (_isLogin) {
        if (_passwordController.text.isEmpty) return 'Enter your password';
        return null;
      }
      if (!_isPasswordStrong()) {
        return 'Password does not meet all requirements';
      }
      if (!_passwordsMatch) return 'Passwords do not match';
      return null;
    }

    // Phone path
    if (!_phoneValid || _phoneE164.isEmpty) {
      return 'Enter a valid phone number';
    }
    if (_codeSent) {
      if (_smsController.text.trim().length < 6) {
        return 'Enter the 6-digit SMS code';
      }
    }
    return null;
  }

  Future<void> _handleForgotPassword() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      _snack('Enter your email first');
      return;
    }
    if (!_isValidEmail(email)) {
      _snack('Enter a valid email address');
      return;
    }
    setState(() => _busy = true);
    final err = await _auth.sendPasswordResetEmail(email);
    if (!mounted) return;
    setState(() => _busy = false);
    if (err == null) {
      _snack('If an account exists for that email, a reset link was sent.');
    } else {
      _snack(err);
    }
  }

  Future<void> _onGooglePressed() async {
    setState(() => _busy = true);
    try {
      final r = await _auth.signInWithGoogle();
      if (!mounted) return;
      if (r.isSuccess) {
        await navigateAfterAuth(context);
      } else {
        _snack(r.errorMessage ?? 'Google sign-in failed.');
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  void _snack(String msg) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(msg, style: GoogleFonts.poppins())));
  }

  Widget _buildPasswordStrengthBar() {
    final password = _passwordController.text.trim();
    bool hasLength = password.length >= 8;
    bool hasUpper = RegExp(r'(?=.*[A-Z])').hasMatch(password);
    bool hasNumber = RegExp(r'(?=.*\d)').hasMatch(password);
    bool hasSpecial = RegExp(
      r'(?=.*[@#$%^&*()_+\-=\[\]{}|;:",.<>?/])',
    ).hasMatch(password);
    int satisfied = 0;
    if (hasLength) satisfied++;
    if (hasUpper) satisfied++;
    if (hasNumber) satisfied++;
    if (hasSpecial) satisfied++;
    double progress = satisfied / 4.0;
    Color barColor = satisfied == 4
        ? Colors.green
        : (satisfied >= 2 ? Colors.orange : Colors.red);
    List<String> missing = [];
    if (!hasLength) missing.add('at least 8 characters');
    if (!hasUpper) missing.add('one uppercase letter');
    if (!hasNumber) missing.add('one number');
    if (!hasSpecial) missing.add('one special character');
    String feedbackText;
    if (satisfied == 4) {
      feedbackText = 'Strong password!';
    } else if (missing.length == 1) {
      feedbackText = 'Password must contain ${missing[0]}';
    } else if (missing.length == 2) {
      feedbackText = 'Password must contain ${missing[0]} and ${missing[1]}';
    } else if (missing.length == 3) {
      feedbackText =
          'Password must contain ${missing[0]}, ${missing[1]} and ${missing[2]}';
    } else {
      feedbackText =
          'Password must contain uppercase, number, and special character';
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

  String _primaryButtonLabel() {
    if (_identifier == _AuthIdentifier.email) {
      return _isLogin ? 'Sign In' : 'Sign Up';
    }
    if (_codeSent) {
      return _isLogin ? 'Verify & Sign In' : 'Verify & Sign Up';
    }
    return 'Send SMS code';
  }

  Future<void> _onPrimaryPressed() async {
    final err = _validate();
    if (err != null) {
      _snack(err);
      return;
    }

    setState(() => _busy = true);

    if (_identifier == _AuthIdentifier.email) {
      try {
        final email = _emailController.text.trim();
        final password = _passwordController.text.trim();
        if (_isLogin) {
          final r = await _auth.signInWithEmail(email, password);
          if (!mounted) return;
          if (r.isSuccess) {
            await navigateAfterAuth(context);
          } else {
            _snack(r.errorMessage ?? 'Sign in failed');
          }
        } else {
          final r = await _auth.signUpWithEmail(email, password);
          if (!mounted) return;
          if (r.isSuccess) {
            await navigateAfterAuth(context);
          } else {
            _snack(r.errorMessage ?? 'Sign up failed');
          }
        }
      } finally {
        if (mounted) setState(() => _busy = false);
      }
      return;
    }

    // Phone: first tap sends SMS — keep _busy until callbacks run.
    if (!_codeSent) {
      try {
        await _auth.startPhoneVerification(
          phoneNumber: _phoneE164,
          onCodeSent: (vid, _) {
            if (!mounted) return;
            setState(() {
              _verificationId = vid;
              _codeSent = true;
              _busy = false;
            });
            _snack('Code sent. Check your SMS.');
          },
          onError: (msg) {
            if (!mounted) return;
            setState(() => _busy = false);
            _snack(msg);
          },
          onAutoVerified: (credential) async {
            final r = await _auth.applyPhoneCredential(credential);
            if (!mounted) return;
            setState(() => _busy = false);
            if (r.isSuccess) {
              await navigateAfterAuth(context);
            } else {
              _snack(r.errorMessage ?? 'Verification failed');
            }
          },
        );
      } catch (_) {
        if (mounted) {
          setState(() => _busy = false);
          _snack('Could not start phone verification.');
        }
      }
      return;
    }

    final vid = _verificationId;
    if (vid == null) {
      if (mounted) setState(() => _busy = false);
      _snack('Request a new code.');
      return;
    }
    try {
      final r = await _auth.signInWithPhoneSms(vid, _smsController.text);
      if (!mounted) return;
      if (r.isSuccess) {
        await navigateAfterAuth(context);
      } else {
        _snack(r.errorMessage ?? 'Verification failed');
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  InputDecoration _fieldDecoration({
    required String hint,
    Widget? prefix,
    Widget? suffix,
    Color? borderSide,
  }) {
    return InputDecoration(
      filled: true,
      fillColor: Colors.white.withValues(alpha: 0.9),
      hintText: hint,
      prefixIcon: prefix,
      suffixIcon: suffix,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: borderSide ?? Colors.transparent, width: 2),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(
          color: borderSide ?? Theme.of(context).colorScheme.primary,
          width: 2.5,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AuthExitScope(
      child: Scaffold(
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
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 20),
              child: Column(
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
                        ? 'Sign in with email or phone'
                        : 'Sign up with email or phone (you will link the other next)',
                    style: GoogleFonts.poppins(
                      fontSize: 14,
                      color: Colors.white70,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 20),
                  SegmentedButton<_AuthIdentifier>(
                    segments: const [
                      ButtonSegment(
                        value: _AuthIdentifier.email,
                        label: Text('Email'),
                        icon: Icon(Icons.email_outlined, size: 18),
                      ),
                      ButtonSegment(
                        value: _AuthIdentifier.phone,
                        label: Text('Phone'),
                        icon: Icon(Icons.phone_android, size: 18),
                      ),
                    ],
                    selected: {_identifier},
                    onSelectionChanged: (s) => _onIdentifierChanged(s.first),
                    style: ButtonStyle(
                      foregroundColor: WidgetStateProperty.resolveWith((states) {
                        if (states.contains(WidgetState.selected)) {
                          return Colors.white;
                        }
                        return Colors.white70;
                      }),
                    ),
                  ),
                  const SizedBox(height: 24),

                  if (_identifier == _AuthIdentifier.phone) ...[
                    IntlPhoneField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      decoration: _fieldDecoration(hint: 'Phone number'),
                      initialCountryCode: 'LB',
                      onChanged: (phone) {
                        bool valid = false;
                        try {
                          valid = phone.isValidNumber();
                        } catch (_) {
                          valid = false;
                        }
                        setState(() {
                          _phoneE164 = _normalizeE164(phone);
                          _phoneValid = valid;
                        });
                      },
                    ),
                    if (_codeSent) ...[
                      const SizedBox(height: 16),
                      TextField(
                        controller: _smsController,
                        keyboardType: TextInputType.number,
                        maxLength: 6,
                        style: GoogleFonts.poppins(color: Colors.black87),
                        decoration: _fieldDecoration(
                          hint: 'SMS code',
                        ).copyWith(counterText: ''),
                      ),
                    ],
                  ] else ...[
                    TextField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      style: GoogleFonts.poppins(color: Colors.black87),
                      decoration: _fieldDecoration(
                        hint: 'Email',
                        prefix: const Icon(Icons.email_outlined),
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      style: GoogleFonts.poppins(color: Colors.black87),
                      decoration: _fieldDecoration(
                        hint: 'Password',
                        prefix: const Icon(Icons.lock_outline),
                        suffix: IconButton(
                          icon: Icon(
                            _obscurePassword
                                ? Icons.visibility_off
                                : Icons.visibility,
                            color: Colors.grey[700],
                          ),
                          onPressed: () => setState(
                            () => _obscurePassword = !_obscurePassword,
                          ),
                        ),
                        borderSide: _isLogin || _passwordController.text.isEmpty
                            ? Colors.transparent
                            : (_passwordsMatch ? Colors.blue : Colors.red),
                      ),
                    ),
                    if (!_isLogin && _passwordController.text.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      _buildPasswordStrengthBar(),
                    ],
                    if (_isLogin)
                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton(
                          onPressed: _busy ? null : _handleForgotPassword,
                          child: Text(
                            'Forgot Password?',
                            style: GoogleFonts.poppins(
                              color: Colors.white,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ),
                    if (!_isLogin) ...[
                      const SizedBox(height: 8),
                      TextField(
                        controller: _confirmPasswordController,
                        obscureText: _obscureConfirm,
                        style: GoogleFonts.poppins(color: Colors.black87),
                        decoration: _fieldDecoration(
                          hint: 'Confirm password',
                          prefix: const Icon(Icons.lock_outline),
                          suffix: IconButton(
                            icon: Icon(
                              _obscureConfirm
                                  ? Icons.visibility_off
                                  : Icons.visibility,
                              color: Colors.grey[700],
                            ),
                            onPressed: () => setState(
                              () => _obscureConfirm = !_obscureConfirm,
                            ),
                          ),
                          borderSide:
                              _confirmPasswordController.text.isEmpty
                              ? Colors.transparent
                              : (_passwordsMatch ? Colors.blue : Colors.red),
                        ),
                      ),
                    ],
                  ],

                  const SizedBox(height: 28),
                  SizedBox(
                    height: 56,
                    child: FilledButton(
                      onPressed: _busy ? null : _onPrimaryPressed,
                      style: FilledButton.styleFrom(
                        backgroundColor: Colors.blue[700],
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: _busy
                          ? const SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : Text(
                              _primaryButtonLabel(),
                              style: GoogleFonts.poppins(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              ),
                            ),
                    ),
                  ),
                  if (_identifier == _AuthIdentifier.phone && _codeSent) ...[
                    const SizedBox(height: 8),
                    TextButton(
                      onPressed: _busy
                          ? null
                          : () => setState(_resetPhoneFlow),
                      child: Text(
                        'Use a different number',
                        style: GoogleFonts.poppins(color: Colors.white),
                      ),
                    ),
                  ],
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 56,
                    child: OutlinedButton.icon(
                      onPressed: _busy ? null : _onGooglePressed,
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
                  const SizedBox(height: 20),
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
                        onPressed: _onLoginSignupToggled,
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
    ),
    );
  }
}
