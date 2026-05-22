const admin = require('firebase-admin');
const path  = require('path');

// Initialize once — safe to require from multiple modules
if (!admin.apps.length) {
  // Accept either FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
                          || process.env.FIREBASE_SERVICE_ACCOUNT;
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (serviceAccountJson) {
    // Production: JSON string in env var
    // Normalise private_key newlines — Railway/other hosts may double-escape them
    const parsed = JSON.parse(serviceAccountJson);
    if (parsed.private_key) {
      parsed.private_key = parsed.private_key
        .replace(/\\n/g, '\n')   // literal \n → newline
        .replace(/\\r/g, '');    // strip stray \r
    }
    admin.initializeApp({
      credential: admin.credential.cert(parsed),
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
