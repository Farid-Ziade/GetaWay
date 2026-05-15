const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { validateCoords } = require('../middleware/validate');

const router = express.Router();

// All places routes require authentication
router.use(verifyToken);

/**
 * GET /api/places/nearby?lat=&lng=&radius=
 * Proxies Google Places API — keeps the server-side key secret.
 */
router.get('/nearby', async (req, res, next) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;

    if (!validateCoords(lat, lng)) {
      return res.status(400).json({ error: 'Invalid coordinates.' });
    }

    const radiusNum = Math.min(Math.max(parseInt(radius, 10) || 5000, 100), 50000);
    const apiKey = process.env.GOOGLE_MAPS_SERVER_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Maps service not configured.' });
    }

    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
    url.searchParams.set('location', `${lat},${lng}`);
    url.searchParams.set('radius', radiusNum);
    url.searchParams.set('type', 'tourist_attraction|park|restaurant|lodging');
    url.searchParams.set('key', apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Places API request failed.');

    const data = await response.json();

    // Return only the fields the frontend needs (avoid leaking full API response)
    const places = (data.results || []).slice(0, 20).map((p) => ({
      place_id: p.place_id,
      name: p.name,
      rating: p.rating,
      types: p.types,
      vicinity: p.vicinity,
      geometry: p.geometry?.location,
    }));

    res.json({ places });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
