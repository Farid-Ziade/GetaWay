const admin = require('firebase-admin');

// Initialize once — safe to require from multiple modules
if (!admin.apps.length) {
  // In production, supply GOOGLE_APPLICATION_CREDENTIALS env var pointing to
  // your service account JSON, or set FIREBASE_SERVICE_ACCOUNT_JSON as a
  // JSON string in your deployment environment.
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    // Falls back to Application Default Credentials (e.g. Cloud Functions, Cloud Run)
    admin.initializeApp();
  }
}

module.exports = admin;
