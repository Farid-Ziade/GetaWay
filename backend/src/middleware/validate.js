/**
 * Validates lat/lng are real numeric coordinates.
 */
function validateCoords(lat, lng) {
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  if (isNaN(latNum) || latNum < -90 || latNum > 90) return false;
  if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) return false;
  return true;
}

/**
 * Validates budget is a positive finite number within an acceptable range.
 */
function validateBudget(budget) {
  const num = parseFloat(budget);
  if (isNaN(num) || !isFinite(num)) return false;
  if (num < 0 || num > 1_000_000) return false;
  return true;
}

/**
 * Express middleware: validates planner request body.
 */
function validatePlannerRequest(req, res, next) {
  const { lat, lng, budget } = req.body;

  if (lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'Location (lat, lng) is required.' });
  }
  if (!validateCoords(lat, lng)) {
    return res.status(400).json({ error: 'Invalid coordinates.' });
  }
  if (budget !== undefined && !validateBudget(budget)) {
    return res.status(400).json({ error: 'Invalid budget value.' });
  }

  next();
}

module.exports = { validatePlannerRequest, validateCoords, validateBudget };
