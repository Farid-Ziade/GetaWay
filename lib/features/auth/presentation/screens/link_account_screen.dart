import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl_phone_field/intl_phone_field.dart';
import 'package:intl_phone_field/phone_number.dart';

import 'package:getaway_app/features/auth/data/services/auth_service.dart';
import 'package:getaway_app/features/auth/domain/user_auth_status.dart';
import 'package:getaway_app/features/auth/presentation/auth_navigation.dart';

/// After signing up with email, phone, or Google, the user must finish linking
/// so one Firebase account has **phone** plus **(email/password or Google)**.
class LinkAccountScreen extends StatefulWidget {
  const LinkAccountScreen({super.key});

  @override
  State<LinkAccountScreen> createState() => _LinkAccountScreenState();
}

class _LinkAccountScreenState extends State<LinkAccountScreen> {
  final _auth = AuthService();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _smsController = TextEditingController();

  String _phoneE164 = '';
  bool _phoneValid = false;
  String? _verificationId;
  bool _codeSent = false;
  bool _busy = false;

  bool _obscurePassword = true;
  bool _obscureConfirm = true;
  bool _passwordsMatch = false;

  @override
  void initState() {
    super.initState();
    _passwordController.addListener(_syncPasswordMatch);
    _confirmPasswordController.addListener(_syncPasswordMatch);
    WidgetsBinding.instance.addPostFrameCallback((_) => _skipIfAlreadyComplete());
  }

  Future<void> _skipIfAlreadyComplete() async {
    final u = FirebaseAuth.instance.currentUser;
    if (u == null || !mounted) return;
    await u.reload();
    final r = FirebaseAuth.instance.currentUser;
    if (!mounted || r == null) return;
    if (userAuthIsComplete(r)) {
      await navigateAfterAuth(context);
    }
  }

  void _syncPasswordMatch() {
    final a = _passwordController.text.trim();
    final b = _confirmPasswordController.text.trim();
    final match = a.isNotEmpty && b.isNotEmpty && a == b;
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

  bool _isValidEmail(String email) =>
      RegExp(r'^[^@]+@[^@]+\.[^@]+$').hasMatch(email);

  bool _isPasswordStrong() {
    final p = _passwordController.text.trim();
    return p.length >= 8 &&
        RegExp(r'[A-Z]').hasMatch(p) &&
        RegExp(r'\d').hasMatch(p) &&
        RegExp(r'[@#$%^&*()_+\-=\[\]{}|;:",.<>?/]').hasMatch(p);
  }

  String _normalizeE164(PhoneNumber phone) {
    final raw = phone.completeNumber.trim();
    if (raw.startsWith('+')) return raw;
    return '+$raw';
  }

  Future<void> _sendPhoneCode() async {
    if (!_phoneValid || _phoneE164.isEmpty) {
      _snack('Enter a valid phone number');
      return;
    }
    setState(() => _busy = true);
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
            _snack(r.errorMessage ?? 'Could not verify phone.');
          }
        },
      );
    } catch (_) {
      if (mounted) {
        setState(() => _busy = false);
        _snack('Could not start phone verification.');
      }
    }
  }

  Future<void> _verifyPhoneAndLink() async {
    final vid = _verificationId;
    if (vid == null) {
      _snack('Request a code first.');
      return;
    }
    final code = _smsController.text.trim();
    if (code.length < 6) {
      _snack('Enter the 6-digit code.');
      return;
    }
    setState(() => _busy = true);
    final r = await _auth.signInWithPhoneSms(vid, code);
    if (!mounted) return;
    setState(() => _busy = false);
    if (r.isSuccess) {
      await navigateAfterAuth(context);
    } else {
      _snack(r.errorMessage ?? 'Could not link phone.');
    }
  }

  Future<void> _linkGoogle() async {
    setState(() => _busy = true);
    final r = await _auth.linkWithGoogle();
    if (!mounted) return;
    setState(() => _busy = false);
    if (r.isSuccess) {
      await navigateAfterAuth(context);
    } else {
      _snack(r.errorMessage ?? 'Could not link Google.');
    }
  }

  Future<void> _linkEmail() async {
    final email = _emailController.text.trim();
    if (!_isValidEmail(email)) {
      _snack('Enter a valid email.');
      return;
    }
    if (!_isPasswordStrong()) {
      _snack('Password does not meet all requirements.');
      return;
    }
    if (!_passwordsMatch) {
      _snack('Passwords do not match.');
      return;
    }
    setState(() => _busy = true);
    final r = await _auth.linkEmailPassword(
      email,
      _passwordController.text.trim(),
    );
    if (!mounted) return;
    setState(() => _busy = false);
    if (r.isSuccess) {
      await navigateAfterAuth(context);
    } else {
      _snack(r.errorMessage ?? 'Could not link email.');
    }
  }

  void _snack(String msg) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(msg, style: GoogleFonts.poppins())));
  }

  Future<void> _signOut() async {
    await _auth.logout();
    if (!mounted) return;
    Navigator.pushReplacementNamed(context, '/login');
  }

  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          Navigator.pushReplacementNamed(context, '/login');
        }
      });
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final needPhone = !userHasPhone(user);
    final needIdentity = !userHasNonPhoneIdentity(user);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Complete your account'),
        actions: [
          TextButton(
            onPressed: _busy ? null : _signOut,
            child: const Text('Sign out'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          Text(
            'GetaWay needs a phone number and either Google or email/password '
            'on the same account. Add what is missing below.',
            style: GoogleFonts.poppins(fontSize: 15, height: 1.4),
          ),
          const SizedBox(height: 24),
          if (needPhone) ...[
            Text('Link your phone', style: GoogleFonts.poppins(fontSize: 18)),
            const SizedBox(height: 12),
            IntlPhoneField(
              controller: _phoneController,
              decoration: InputDecoration(
                labelText: 'Phone',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
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
            const SizedBox(height: 12),
            FilledButton(
              onPressed: _busy || _codeSent ? null : _sendPhoneCode,
              child: const Text('Send SMS code'),
            ),
            if (_codeSent) ...[
              const SizedBox(height: 16),
              TextField(
                controller: _smsController,
                keyboardType: TextInputType.number,
                maxLength: 6,
                decoration: InputDecoration(
                  labelText: 'SMS code',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 12),
              FilledButton(
                onPressed: _busy ? null : _verifyPhoneAndLink,
                child: const Text('Verify and link phone'),
              ),
            ],
          ],
          if (needPhone && needIdentity) const Divider(height: 48),
          if (needIdentity) ...[
            Text(
              'Link Google or email',
              style: GoogleFonts.poppins(fontSize: 18),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: _busy ? null : _linkGoogle,
              icon: Image.asset('assets/images/google_logo.png', height: 28),
              label: const Text('Continue with Google'),
            ),
            const SizedBox(height: 16),
            Text(
              'Or set email & password',
              style: GoogleFonts.poppins(fontSize: 14),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: InputDecoration(
                labelText: 'Email',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _passwordController,
              obscureText: _obscurePassword,
              decoration: InputDecoration(
                labelText: 'Password',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscurePassword ? Icons.visibility_off : Icons.visibility,
                  ),
                  onPressed: () =>
                      setState(() => _obscurePassword = !_obscurePassword),
                ),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _confirmPasswordController,
              obscureText: _obscureConfirm,
              decoration: InputDecoration(
                labelText: 'Confirm password',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscureConfirm ? Icons.visibility_off : Icons.visibility,
                  ),
                  onPressed: () =>
                      setState(() => _obscureConfirm = !_obscureConfirm),
                ),
              ),
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: _busy ? null : _linkEmail,
              child: const Text('Link email and password'),
            ),
          ],
          if (!needPhone && !needIdentity)
            Text(
              'Your account is complete. Redirecting…',
              style: GoogleFonts.poppins(),
            ),
        ],
      ),
    );
  }
}
