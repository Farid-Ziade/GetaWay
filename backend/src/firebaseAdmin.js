const admin = require('firebase-admin');
const path  = require('path');

// Initialize once — safe to require from multiple modules
if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (serviceAccountJson) {
    // Production: single-line JSON string in env var
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
    });
  } else if (serviceAccountPath) {
    // Local dev: path to a serviceAccount.json file (gitignored)
    const serviceAccount = require(path.resolve(__dirname, '..', serviceAccountPath));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    // Falls back to Application Default Credentials (Cloud Functions, Cloud Run)
    admin.initializeApp();
  }
}

module.exports = admin;
