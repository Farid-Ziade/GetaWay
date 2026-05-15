const admin = require('../firebaseAdmin');

/**
 * Verifies the Firebase ID token sent in the Authorization header.
 * Attaches decoded token (uid, email) to req.user on success.
 */
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: missing token.' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email || null };
    next();
  } catch {
    // Do not forward raw Firebase error to client
    return res.status(401).json({ error: 'Unauthorized: invalid or expired token.' });
  }
}

module.exports = { verifyToken };
