function validationMiddleware(_req, _res, next) {
  // Phase 6: add schema validation for body/query params.
  next();
}

module.exports = { validationMiddleware };
