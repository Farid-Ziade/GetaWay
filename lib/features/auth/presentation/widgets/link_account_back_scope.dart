import 'dart:async';

import 'package:flutter/material.dart';

/// Back on “Complete your account”: confirm; user can sign out to switch accounts.
class LinkAccountBackScope extends StatefulWidget {
  const LinkAccountBackScope({
    super.key,
    required this.onSignOut,
    required this.child,
  });

  final Future<void> Function() onSignOut;
  final Widget child;

  @override
  State<LinkAccountBackScope> createState() => _LinkAccountBackScopeState();
}

class _LinkAccountBackScopeState extends State<LinkAccountBackScope> {
  Future<void> _onPopInvoked(bool didPop, Object? result) async {
    if (didPop || !mounted) return;
    final navigator = Navigator.of(context);
    if (navigator.canPop()) {
      navigator.pop();
      return;
    }
    final signOut = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Finish setup?'),
        content: const Text(
          'You still need to link your phone or sign-in method. '
          'Sign out to use a different account?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Stay'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Sign out'),
          ),
        ],
      ),
    );
    if (signOut == true && mounted) {
      await widget.onSignOut();
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        unawaited(_onPopInvoked(didPop, result));
      },
      child: widget.child,
    );
  }
}
