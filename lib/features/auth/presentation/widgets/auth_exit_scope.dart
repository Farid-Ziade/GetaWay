import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Android back: if this route is the **root** of the stack, ask before closing
/// the app; otherwise pop normally.
class AuthExitScope extends StatefulWidget {
  const AuthExitScope({super.key, required this.child});

  final Widget child;

  @override
  State<AuthExitScope> createState() => _AuthExitScopeState();
}

class _AuthExitScopeState extends State<AuthExitScope> {
  Future<void> _onPopInvoked(bool didPop, Object? result) async {
    if (didPop || !mounted) return;
    final navigator = Navigator.of(context);
    if (navigator.canPop()) {
      navigator.pop();
      return;
    }
    final leave = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Exit GetaWay?'),
        content: const Text('You are not signed in yet.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Stay'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Exit'),
          ),
        ],
      ),
    );
    if (leave == true && mounted) {
      SystemNavigator.pop();
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
