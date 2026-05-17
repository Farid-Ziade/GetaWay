const express = require('express');
const rateLimit = require('express-rate-limit');
const { verifyToken } = require('../middleware/auth');
const { validatePlannerRequest } = require('../middleware/validate');

const router = express.Router();

// Stricter rate limit for AI endpoint (costly calls)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI request limit reached. Please wait before trying again.' },
});

// All planner routes require authentication
router.use(verifyToken);
router.use(aiLimiter);


async function fetchNearbyPlaces(lat, lng, radiusMeters) {
  try {
    const query = `
[out:json][timeout:12];
(
  node["amenity"~"^(restaurant|cafe|bar|museum|cinema|theatre|fast_food|pub|nightclub|food_court|ice_cream|bakery)$"](around:${radiusMeters},${lat},${lng});
  node["tourism"~"^(attraction|museum|viewpoint|gallery|artwork)$"](around:${radiusMeters},${lat},${lng});
  node["leisure"~"^(park|garden|beach_resort|fitness_centre|sports_centre|swimming_pool|playground|marina)$"](around:${radiusMeters},${lat},${lng});
  node["natural"~"^(beach|cliff|water)$"](around:${radiusMeters},${lat},${lng});
  node["shop"~"^(mall|market|bakery|supermarket)$"](around:${radiusMeters},${lat},${lng});
);
out body 30;`;

    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    `data=${encodeURIComponent(query)}`,
      signal:  AbortSignal.timeout(13000),
    });
    const data = await res.json();

    return data.elements
      .filter(el => el.tags?.name)
      .map(el => ({
        name: el.tags.name,
        type: el.tags.amenity || el.tags.tourism || el.tags.leisure || el.tags.natural || el.tags.shop,
      }))
      .slice(0, 25);
  } catch {
    return [];
  }
}

async function fetchWeather(lat, lng, cityName) {
  const key = process.env.OPENWEATHERMAP_API_KEY;
  if (!key) return null;
  try {
    const query = (lat != null && lng != null)
      ? `lat=${lat}&lon=${lng}`
      : `q=${encodeURIComponent(cityName)}`;
    const res  = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?${query}&appid=${key}&units=metric`
    );
    const data = await res.json();
    if (data.cod !== 200) return null;
    const desc = data.weather[0].description;
    const temp = Math.round(data.main.temp);
    return `${desc.charAt(0).toUpperCase() + desc.slice(1)} · ${temp}°C`;
  } catch {
    return null;
  }
}

router.post('/generate', validatePlannerRequest, async (req, res, next) => {
  try {
    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const { lat, lng, budget, location, radius, savedTrips = [] } = req.body;

    const radiusKm     = radius ? parseInt(radius) : null;
    const radiusMeters = radiusKm ? radiusKm * 1000 : null;

    const [weather, nearbyPlaces] = await Promise.all([
      fetchWeather(lat, lng, location),
      (lat != null && radiusMeters) ? fetchNearbyPlaces(lat, lng, radiusMeters) : Promise.resolve([]),
    ]);
    const budgetLabel  = budget ? `$${parseFloat(budget).toFixed(0)}` : 'flexible';
    const locationLine = location
      ? `The user is in or near: ${location}.${lat != null ? ` Coordinates: (${lat}, ${lng}).` : ''}`
      : `The user is near coordinates (${lat}, ${lng}).`;
    const radiusLine  = radiusKm
      ? `RADIUS: ${radiusKm} km from (${lat}, ${lng}). Only use places from the verified list below — do not invent or add venues outside it.`
      : '';
    const weatherLine = weather ? `Current weather: ${weather}.` : '';
    const placesDesc  = nearbyPlaces.length > 0
      ? `VERIFIED real places within ${radiusKm} km (from OpenStreetMap): ${nearbyPlaces.map(p => `${p.name} (${p.type})`).join(', ')}.\nBuild the itinerary using ONLY these real venues. You may add generic filler activities (morning walk, seafront stroll) but every named venue MUST come from this list.`
      : radiusKm
        ? `No named venues were found within ${radiusKm} km. Suggest pleasant hyperlocal activities appropriate for the neighborhood (walks, seafront, local cafés) without naming specific places.`
        : '';
    const avoidDesc   = savedTrips.length > 0
      ? `Avoid repeating these past trips: ${savedTrips.slice(0, 5).join(', ')}.`
      : '';

    const prompt = `You are a weekend getaway planner. ${locationLine}
${radiusLine}
${weatherLine}
Budget: ${budgetLabel}.
${placesDesc}
${avoidDesc}

Generate a practical, enjoyable 2-day weekend itinerary with 4-5 activities per day.
Rules:
- Activities must flow logically — nearby places grouped together, realistic travel times between them
- Schedule must make sense (breakfast before lunch, no 9 AM dinners)
- Costs must be realistic for the actual location
- Suggest real, specific venue types (not generic "a local café" — say "a seafront café" or "a rooftop restaurant")
- If weather is bad, prefer indoor activities
- Each day should feel like a coherent experience, not a random list
Return ONLY valid JSON in this exact structure — no markdown, no extra keys:
{
  "title": "Short descriptive trip title",
  "totalCost": "Estimated total e.g. $185",
  "days": [
    {
      "label": "Day 1 · Saturday",
      "activities": [
        {
          "time": "9:00 AM",
          "title": "Activity name",
          "desc": "One to two sentence description.",
          "cost": "~$20 or Free",
          "type": "food"
        }
      ]
    },
    {
      "label": "Day 2 · Sunday",
      "activities": []
    }
  ]
}
The "type" field must be one of: food, sightseeing, adventure, activity.
Keep the sum of all activity costs within the budget of ${budgetLabel}.`;

    const systemMessage = radiusKm && radiusKm <= 10
      ? `You are a hyperlocal weekend planner. Your single most important rule: ONLY suggest activities within ${radiusKm} km of the user's location. ` +
        `This means neighborhood-level suggestions only — local cafés, nearby parks, the closest beach or waterfront, restaurants on nearby streets, local markets. ` +
        `Famous landmarks, tourist attractions, and places in other towns or cities are strictly forbidden at this radius. ` +
        `If genuine local options are limited, suggest pleasant generic local activities (morning walk, seafront café, neighbourhood market) rather than violating the distance rule.`
      : `You are a practical weekend getaway planner. Keep all suggestions within ${radiusKm ? radiusKm + ' km of the user' : 'a reasonable travel distance'}.`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user',   content: prompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
      temperature: 0.7,
    });
    const plan = JSON.parse(response.choices[0].message.content);
    if (weather) plan.weather = weather;
    res.json({ plan });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
