/// Web OAuth client ID (Firebase `google-services.json` → `oauth_client` with
/// `client_type: 3`). Used by [GoogleSignIn] so Firebase receives a non-null
/// `idToken` on Android. This value is **not** a secret; rotate in Firebase if needed.
abstract final class GoogleOAuthConfig {
  static const String webClientId =
      '176542938705-r7jk5col2inar9dqd3g2t75fogtb1tfh.apps.googleusercontent.com';
}
