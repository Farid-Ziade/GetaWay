import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import 'package:getaway_app/app/app_routes.dart';
import 'package:getaway_app/features/auth/domain/user_auth_status.dart';

/// Sends the user to home when phone **and** (email/password or Google) are
/// linked; otherwise to the linking screen.
Future<void> navigateAfterAuth(BuildContext context) async {
  final user = FirebaseAuth.instance.currentUser;
  if (!context.mounted) return;

  if (user == null) {
    Navigator.pushReplacementNamed(context, AppRoutes.login);
    return;
  }

  await user.reload();
  final refreshed = FirebaseAuth.instance.currentUser;
  if (!context.mounted || refreshed == null) return;

  if (userAuthIsComplete(refreshed)) {
    Navigator.pushReplacementNamed(context, AppRoutes.home);
  } else {
    Navigator.pushReplacementNamed(context, AppRoutes.linkAccount);
  }
}
