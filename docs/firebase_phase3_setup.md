# Firebase setup for Phase 3 (email + phone + linking)

Do these steps in the [Firebase Console](https://console.firebase.google.com/) for the **same project** as your Android app (`google-services.json` / `firebase_options.dart`).

You are **not** adding iOS yet—Android only.

---

## 1. Open the correct project

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Select your GetaWay project (the one whose `projectId` matches `lib/firebase_options.dart`).

---

## 2. Turn on sign-in providers

1. In the left menu, open **Build** → **Authentication**.
2. Open the **Sign-in method** tab.
3. Enable **Email/Password**:
   - Click **Email/Password**.
   - Turn **Enable** on (first toggle).
   - You can leave **Email link (passwordless sign-in)** off unless you want it later.
   - **Save**.
4. Enable **Phone**:
   - Click **Phone**.
   - Turn **Enable** on.
   - **Save**.

5. Enable **Google**:
   - Click **Google**.
   - Turn **Enable** on.
   - Set a **Project support email** if prompted.
   - **Save**.

Phone auth may ask you to verify billing or quotas on new projects—follow the console prompts if shown.

---

## 3. Google Sign-In on Android (id token)

The app passes your **Web client** OAuth id (`client_type: 3` in `android/app/google-services.json`) into `GoogleSignIn` so Firebase receives an `idToken`. That value is also in `lib/core/config/google_oauth_client.dart` — if you regenerate Firebase Android config, update **both** places if the Web client id changes.

---

## 4. Android app fingerprints (required for Phone on real devices)

Phone SMS + Play Integrity / reCAPTCHA need your app’s **SHA certificates** registered.

1. In Firebase Console: **Project settings** (gear) → **Your apps** → select your **Android** app.
2. Under **SHA certificate fingerprints**, add:
   - **Debug** (for `flutter run` on your PC):  
     From your project folder run:
     ```bash
     cd android
     ./gradlew signingReport
     ```
     On Windows (PowerShell):
     ```powershell
     cd android; .\gradlew.bat signingReport
     ```
     Copy **SHA-1** (and **SHA-256** if the console asks for it) from the **`debug`** `Variant` line under `app`.
   - **Release** (when you ship): add the SHA-1/SHA-256 from your **release** keystore the same way once you use a release key.

3. Click **Save** if the console offers it.

Without debug SHA, phone verification often **fails** on a physical device or emulator with generic errors.

---

## 5. Optional: test phone numbers (emulator / QA)

1. **Authentication** → **Sign-in method** → **Phone** → scroll to **Phone numbers for testing** (if available in your console).
2. Add a test number and a fixed 6-digit code Firebase gives you.
3. Use only for development—**do not** ship test numbers to production users.

---

## 6. Authorized domains (mostly for web)

For Flutter **Android**, defaults are usually enough. If you later add **web** auth, add your domain under **Authentication** → **Settings** → **Authorized domains**.

---

## 7. Firestore (not required for Phase 3 auth alone)

You do **not** need Firestore enabled just to sign users in. When you save trips (later), apply the rules sketch in [`firestore_rules_sketch.md`](firestore_rules_sketch.md).

---

## 8. Quick verification checklist

| Check | Done? |
|--------|--------|
| Email/Password enabled | ☐ |
| Phone enabled | ☐ |
| Google enabled | ☐ |
| Debug SHA-1 added to Android app | ☐ |
| `flutter run` on a device/emulator after `flutter pub get` | ☐ |

---

## 9. What the app expects (behavior)

- Sign up or sign in with **either** email or phone (one at a time on the login screen), or use **Google** from the login screen.
- After the first method succeeds, if the account is missing **phone** or missing **(email/password or Google)**, the app opens **Complete your account** and **links** the missing pieces to the **same** Firebase user (`linkWithCredential`).
- Same email or same phone cannot belong to two different Firebase accounts for the same provider (Firebase enforces this); linking errors are shown in plain language.

If something still fails, check Android **Logcat** for `FirebaseAuth` messages and confirm SHA and provider toggles above.

---

## 10. Phone SMS: “Could not complete…” / generic failures

1. **SHA-1 / SHA-256 must match the APK you run**  
   Run `cd android` then `.\gradlew.bat signingReport` (Windows) and copy the **debug** SHA-1 under `app` → add it in Firebase **Project settings** → your **Android** app → SHA fingerprints.  
   After any change, download a new **google-services.json** into `android/app/`, run `flutter clean`, then `flutter run`.  
   A mismatch often surfaces as `invalid-app-credential` (debug builds now show the Firebase **error code** in parentheses on screen).

2. **Package name** must match Firebase (`applicationId` / `namespace` in Gradle vs Firebase Android app).

3. **Test phone numbers** (Authentication → Sign-in method → Phone)  
   Use **E.164** in the console (e.g. `+15555550123`) and the **fixed test code** Firebase shows. The app must send the **same** full international number (with `+`).

4. **After Google sign-in, then linking phone**  
   If you see `requires-recent-login`, sign out, sign in with Google again, then complete phone linking immediately.

5. **Emulator**  
   Use an image **with Google Play**. Phone auth often fails on “Google APIs” / AOSP images without Play.

6. **Logcat**  
   Filter `FirebaseAuth` or search for `Auth error:` (debug) to see the exact `code` Firebase returns.
