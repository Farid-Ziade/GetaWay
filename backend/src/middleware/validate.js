const ALLOWED_RADII = [10, 25, 50, 100];

function validateCoords(lat, lng) {
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  if (isNaN(latNum) || latNum < -90  || latNum > 90)  return false;
  if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) return false;
  return true;
}

function validateBudget(budget) {
  const num = parseFloat(budget);
  if (isNaN(num) || !isFinite(num)) return false;
  if (num < 0 || num > 10_000) return false;
  return true;
}

function validatePlannerRequest(req, res, next) {
  const { lat, lng, budget, location, radius, countryCode, savedPlaces } = req.body;

  const hasCoords   = lat !== undefined && lng !== undefined;
  const hasLocation = typeof location === 'string' && location.trim().length > 0;

  if (!hasCoords && !hasLocation) {
    return res.status(400).json({ error: 'Provide coordinates (lat, lng) or a location name.' });
  }
  if (hasCoords && !validateCoords(lat, lng)) {
    return res.status(400).json({ error: 'Invalid coordinates.' });
  }
  if (budget !== undefined && !validateBudget(budget)) {
    return res.status(400).json({ error: 'Invalid budget value.' });
  }
  if (location !== undefined && (typeof location !== 'string' || location.length > 200)) {
    return res.status(400).json({ error: 'Invalid location.' });
  }
  if (radius !== undefined && !ALLOWED_RADII.includes(parseInt(radius))) {
    return res.status(400).json({ error: `Invalid radius. Allowed values: ${ALLOWED_RADII.join(', ')} km.` });
  }
  if (countryCode !== undefined && (typeof countryCode !== 'string' || !/^[A-Z]{2}$/.test(countryCode))) {
    return res.status(400).json({ error: 'Invalid country code.' });
  }
  if (savedPlaces !== undefined && !Array.isArray(savedPlaces)) {
    return res.status(400).json({ error: 'savedPlaces must be an array.' });
  }

  next();
}

module.exports = { validatePlannerRequest };
