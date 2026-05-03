import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';

import 'package:getaway_app/app/getaway_app.dart';
import 'package:getaway_app/core/config/google_oauth_client.dart';
import 'package:getaway_app/firebase_options.dart';

/// App entry: bindings + Firebase, then the root widget from [lib/app/].
///
/// Uses [DefaultFirebaseOptions.currentPlatform] so the same entrypoint
/// matches FlutterFire-generated config. **Android is configured**; iOS and
/// desktop targets are not—run `flutterfire configure` when you add them.
void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  await GoogleSignIn.instance.initialize(
    serverClientId: GoogleOAuthConfig.webClientId,
  );

  runApp(const GetawayApp());
}
