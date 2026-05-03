import 'package:firebase_auth/firebase_auth.dart';

/// Firebase provider id for email + password accounts.
bool userHasEmailPassword(User user) {
  return user.providerData.any(
    (p) => p.providerId == EmailAuthProvider.PROVIDER_ID,
  );
}

/// Firebase provider id for Google accounts.
bool userHasGoogle(User user) {
  return user.providerData.any(
    (p) => p.providerId == GoogleAuthProvider.PROVIDER_ID,
  );
}

/// Email/password **or** Google satisfies the “email side” of the product rule.
bool userHasNonPhoneIdentity(User user) {
  return userHasEmailPassword(user) || userHasGoogle(user);
}

/// Firebase provider id for phone (SMS) accounts.
bool userHasPhone(User user) {
  return user.providerData.any(
    (p) => p.providerId == PhoneAuthProvider.PROVIDER_ID,
  );
}

/// Product rule: **phone** plus **(email/password or Google)** on one account.
bool userAuthIsComplete(User user) {
  return userHasNonPhoneIdentity(user) && userHasPhone(user);
}
