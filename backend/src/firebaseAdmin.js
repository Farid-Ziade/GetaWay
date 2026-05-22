const admin = require('firebase-admin');
const path  = require('path');

// Initialize once — safe to require from multiple modules
if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (serviceAccountJson) {
    // Production: single-line JSON string in env var
    // Railway may escape \n in the private key — unescape it
    const parsed = JSON.parse(serviceAccountJson);
    if (parsed.private_key) {
      parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
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
