import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';

import 'package:getaway_app/app/getaway_app.dart';

/// App entry: bindings + Firebase, then the root widget from [lib/app/].
void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Firebase.initializeApp();

  runApp(const GetawayApp());
}
