import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import 'package:getaway_app/features/auth/domain/user_auth_status.dart';

/// Sends the user to home only when email **and** phone are linked; otherwise
/// to the linking screen.
Future<void> navigateAfterAuth(BuildContext context) async {
  final user = FirebaseAuth.instance.currentUser;
  if (!context.mounted) return;

  if (user == null) {
    Navigator.pushReplacementNamed(context, '/login');
    return;
  }

  await user.reload();
  final refreshed = FirebaseAuth.instance.currentUser;
  if (!context.mounted || refreshed == null) return;

  if (userAuthIsComplete(refreshed)) {
    Navigator.pushReplacementNamed(context, '/home');
  } else {
    Navigator.pushReplacementNamed(context, '/link-account');
  }
}
