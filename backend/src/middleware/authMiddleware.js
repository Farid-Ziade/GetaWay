function authMiddleware(_req, res, next) {
  // Phase 2/6: Verify Firebase ID token or backend JWT.
  // For now, this placeholder keeps route structure simple.
  next();
}

module.exports = { authMiddleware };
