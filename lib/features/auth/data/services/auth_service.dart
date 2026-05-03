import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:google_sign_in/google_sign_in.dart';

import 'package:getaway_app/features/auth/domain/user_auth_status.dart';

/// Result of an auth call — never surface raw [FirebaseAuthException] strings to users.
class AuthResult {
  const AuthResult.success(User this.user) : errorMessage = null;

  const AuthResult.failure(String this.errorMessage) : user = null;

  final User? user;
  final String? errorMessage;

  bool get isSuccess => user != null && errorMessage == null;
}

class AuthService {
  AuthService({FirebaseAuth? auth}) : _auth = auth ?? FirebaseAuth.instance;

  final FirebaseAuth _auth;

  Stream<User?> get authStateChanges => _auth.authStateChanges();

  User? get currentUser => _auth.currentUser;

  Future<void> logout() async {
    await GoogleSignIn.instance.signOut();
    await _auth.signOut();
  }

  /// Sign in or register with Google, then Firebase Auth.
  ///
  /// Requires [GoogleSignIn.instance.initialize] in `main.dart` (see project `main.dart`).
  Future<AuthResult> signInWithGoogle() async {
    try {
      final account = await GoogleSignIn.instance.authenticate(
        scopeHint: const ['email', 'profile'],
      );
      final googleAuth = account.authentication;
      if (googleAuth.idToken == null && kDebugMode) {
        debugPrint(
          'Google idToken was null — check serverClientId / SHA-1 in Firebase.',
        );
      }
      final credential = GoogleAuthProvider.credential(
        idToken: googleAuth.idToken,
      );
      final userCred = await _auth.signInWithCredential(credential);
      final u = userCred.user;
      if (u == null) {
        return const AuthResult.failure('Sign-in failed. Try again.');
      }
      await u.reload();
      return AuthResult.success(_auth.currentUser!);
    } on GoogleSignInException catch (e) {
      if (e.code == GoogleSignInExceptionCode.canceled ||
          e.code == GoogleSignInExceptionCode.interrupted) {
        return const AuthResult.failure('Sign in was cancelled.');
      }
      return AuthResult.failure(
        e.description ?? 'Google sign-in failed.',
      );
    } on FirebaseAuthException catch (e) {
      return AuthResult.failure(_mapAuthException(e));
    } on PlatformException catch (e) {
      return AuthResult.failure(e.message ?? 'Google sign-in failed.');
    } catch (_) {
      return const AuthResult.failure('Something went wrong. Try again.');
    }
  }

  /// Link Google to the current user (e.g. phone-only account completing profile).
  Future<AuthResult> linkWithGoogle() async {
    final user = _auth.currentUser;
    if (user == null) {
      return const AuthResult.failure('You need to be signed in first.');
    }
    if (userHasGoogle(user)) {
      return const AuthResult.failure('Google is already linked.');
    }
    try {
      final account = await GoogleSignIn.instance.authenticate(
        scopeHint: const ['email', 'profile'],
      );
      final googleAuth = account.authentication;
      final credential = GoogleAuthProvider.credential(
        idToken: googleAuth.idToken,
      );
      await user.linkWithCredential(credential);
      await user.reload();
      return AuthResult.success(_auth.currentUser!);
    } on GoogleSignInException catch (e) {
      if (e.code == GoogleSignInExceptionCode.canceled ||
          e.code == GoogleSignInExceptionCode.interrupted) {
        return const AuthResult.failure('Sign in was cancelled.');
      }
      return AuthResult.failure(e.description ?? 'Google link failed.');
    } on FirebaseAuthException catch (e) {
      return AuthResult.failure(_mapAuthException(e));
    } on PlatformException catch (e) {
      return AuthResult.failure(e.message ?? 'Google link failed.');
    } catch (_) {
      return const AuthResult.failure('Something went wrong. Try again.');
    }
  }

  Future<AuthResult> signUpWithEmail(String email, String password) async {
    try {
      final credential = await _auth.createUserWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );
      return AuthResult.success(credential.user!);
    } on FirebaseAuthException catch (e) {
      return AuthResult.failure(_mapAuthException(e));
    } catch (_) {
      return const AuthResult.failure('Something went wrong. Try again.');
    }
  }

  Future<AuthResult> signInWithEmail(String email, String password) async {
    try {
      final credential = await _auth.signInWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );
      return AuthResult.success(credential.user!);
    } on FirebaseAuthException catch (e) {
      return AuthResult.failure(_mapAuthException(e));
    } catch (_) {
      return const AuthResult.failure('Something went wrong. Try again.');
    }
  }

  /// Returns `null` on success, or a user-safe error message.
  Future<String?> sendPasswordResetEmail(String email) async {
    try {
      await _auth.sendPasswordResetEmail(email: email.trim());
      return null;
    } on FirebaseAuthException catch (e) {
      return _mapAuthException(e);
    } catch (_) {
      return 'Something went wrong. Try again.';
    }
  }

  /// Starts SMS verification. [phoneNumber] must be E.164 (e.g. +961…).
  Future<void> startPhoneVerification({
    required String phoneNumber,
    required void Function(String verificationId, int? resendToken) onCodeSent,
    required void Function(String message) onError,
    Future<void> Function(PhoneAuthCredential credential)? onAutoVerified,
  }) async {
    await _auth.verifyPhoneNumber(
      phoneNumber: phoneNumber,
      timeout: const Duration(seconds: 90),
      verificationCompleted: (credential) async {
        final handler = onAutoVerified;
        if (handler != null) {
          await handler(credential);
        }
      },
      verificationFailed: (e) {
        onError(_mapPhoneVerificationError(e));
      },
      codeSent: onCodeSent,
      codeAutoRetrievalTimeout: (_) {},
    );
  }

  /// Sign in with SMS (new or returning user). If a user is already signed in
  /// and still needs a phone, use [applyPhoneCredential] instead.
  Future<AuthResult> signInWithPhoneSms(
    String verificationId,
    String smsCode,
  ) async {
    final credential = PhoneAuthProvider.credential(
      verificationId: verificationId,
      smsCode: smsCode.trim(),
    );
    return applyPhoneCredential(credential);
  }

  /// Links phone to the current user, or signs in if nobody is signed in.
  Future<AuthResult> applyPhoneCredential(PhoneAuthCredential credential) async {
    try {
      final existing = _auth.currentUser;
      if (existing != null && !userHasPhone(existing)) {
        await existing.linkWithCredential(credential);
        await existing.reload();
        return AuthResult.success(_auth.currentUser!);
      }
      final userCred = await _auth.signInWithCredential(credential);
      final u = userCred.user;
      if (u == null) {
        return const AuthResult.failure('Sign-in failed. Try again.');
      }
      await u.reload();
      return AuthResult.success(_auth.currentUser!);
    } on FirebaseAuthException catch (e) {
      return AuthResult.failure(_mapAuthException(e));
    } catch (_) {
      return const AuthResult.failure('Something went wrong. Try again.');
    }
  }

  Future<AuthResult> linkEmailPassword(String email, String password) async {
    final user = _auth.currentUser;
    if (user == null) {
      return const AuthResult.failure('You need to be signed in first.');
    }
    if (userHasEmailPassword(user)) {
      return const AuthResult.failure('Email sign-in is already linked.');
    }
    final credential = EmailAuthProvider.credential(
      email: email.trim(),
      password: password,
    );
    try {
      await user.linkWithCredential(credential);
      await user.reload();
      return AuthResult.success(_auth.currentUser!);
    } on FirebaseAuthException catch (e) {
      return AuthResult.failure(_mapAuthException(e));
    } catch (_) {
      return const AuthResult.failure('Something went wrong. Try again.');
    }
  }

  String _mapPhoneVerificationError(FirebaseAuthException e) {
    return _mapAuthException(e);
  }

  String _mapAuthException(FirebaseAuthException e) {
    switch (e.code) {
      case 'email-already-in-use':
        return 'That email is already in use. Try signing in instead.';
      case 'credential-already-in-use':
        return 'That phone or email is already on another account. Sign in with it, or use a different one.';
      case 'provider-already-linked':
        return 'That sign-in method is already linked to this account.';
      case 'invalid-email':
        return 'That email does not look valid.';
      case 'wrong-password':
      case 'invalid-credential':
        return 'Incorrect email or password.';
      case 'user-disabled':
        return 'This account has been disabled.';
      case 'user-not-found':
        return 'No account found for that email.';
      case 'invalid-verification-code':
        return 'Invalid or expired code. Request a new code and try again.';
      case 'invalid-verification-id':
        return 'Verification expired. Send the code again.';
      case 'too-many-requests':
        return 'Too many attempts. Wait a bit and try again.';
      case 'network-request-failed':
        return 'Network error. Check your connection.';
      case 'invalid-phone-number':
        return 'That phone number is not valid.';
      case 'session-expired':
        return 'The SMS session expired. Send a new code.';
      case 'account-exists-with-different-credential':
        return 'An account already exists with this email. Sign in with email first, then link your phone from settings (coming soon) or contact support.';
      default:
        if (kDebugMode) {
          debugPrint('Auth error: ${e.code} ${e.message}');
        }
        return 'Could not complete that action. Try again.';
    }
  }
}
