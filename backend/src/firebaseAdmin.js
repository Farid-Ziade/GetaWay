const admin = require('firebase-admin');
const path  = require('path');

// Initialize once — safe to require from multiple modules
if (!admin.apps.length) {
  const projectId   = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey  = process.env.FIREBASE_PRIVATE_KEY;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
                          || process.env.FIREBASE_SERVICE_ACCOUNT;
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (projectId && clientEmail && privateKey) {
    // Preferred for Railway: three separate vars — avoids JSON encoding issues
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  } else if (serviceAccountJson) {
    // Full JSON blob in one env var
    const parsed = JSON.parse(serviceAccountJson);
    if (parsed.private_key) {
      parsed.private_key = parsed.private_key.replace(/\\n/g, '\n').replace(/\\r/g, '');
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
    admin.initializeApp();
  }
}

module.exports = admin;
