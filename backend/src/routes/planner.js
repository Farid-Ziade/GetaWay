const express = require('express');
const rateLimit = require('express-rate-limit');
const { verifyToken } = require('../middleware/auth');
const { validatePlannerRequest } = require('../middleware/validate');

const router = express.Router();

const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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


const PLACE_CATEGORY_GROUPS = [
  ['restaurant', 'cafe', 'bar', 'bakery', 'ice_cream_shop'],
  ['park', 'beach', 'marina', 'hiking_area'],
  ['museum', 'art_gallery', 'movie_theater', 'tourist_attraction', 'night_club', 'shopping_mall', 'market'],
  ['lodging', 'ski_resort', 'campground'],
];

// Google Places API hard radius cap
const PLACES_MAX_RADIUS_M = 50000;
// ~111.32 km per degree of latitude
const KM_PER_DEG = 111.32;

// Returns an array of {lat, lng} circle centres whose combined coverage fills the requested radius.
// Each circle is 50 km — the Google Places API maximum.
function getSearchCenters(lat, lng, radiusKm) {
  if (radiusKm <= 50) return [{ lat, lng, zone: 'Center' }];

  const lngScale = Math.cos((lat * Math.PI) / 180);
  const outerKm  = radiusKm <= 100 ? 65 : 130;
  const dLat     = outerKm / KM_PER_DEG;
  const dLng     = outerKm / (KM_PER_DEG * lngScale);

  const centers = [
    { lat,          lng,          zone: 'Center' },
    { lat: lat + dLat, lng,       zone: 'North'  },
    { lat: lat - dLat, lng,       zone: 'South'  },
    { lat,          lng: lng + dLng, zone: 'East' },
    { lat,          lng: lng - dLng, zone: 'West' },
  ];

  if (radiusKm > 100) {
    const d2    = dLat * 0.707;
    const d2Lng = dLng * 0.707;
    centers.push(
      { lat: lat + d2, lng: lng + d2Lng, zone: 'Northeast' },
      { lat: lat + d2, lng: lng - d2Lng, zone: 'Northwest' },
      { lat: lat - d2, lng: lng + d2Lng, zone: 'Southeast' },
      { lat: lat - d2, lng: lng - d2Lng, zone: 'Southwest' },
    );
  }

  return centers;
}

async function fetchPlaceGroup(key, lat, lng, radiusMeters, types, zone = 'Center') {
  const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
    method:  'POST',
    headers: {
      'Content-Type':     'application/json',
      'X-Goog-Api-Key':   key,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.primaryTypeDisplayName,places.rating,places.editorialSummary,places.addressComponents',
    },
    body: JSON.stringify({
      includedTypes: types,
      maxResultCount: 20,
      locationRestriction: {
        circle: { center: { latitude: lat, longitude: lng }, radius: radiusMeters },
      },
    }),
    signal: AbortSignal.timeout(10000),
  });
  const data = await res.json();
  if (data.error) {
    console.error(`[Places] API error for types [${types.join(',')}]:`, data.error.message);
    return [];
  }
  return (data.places || []).map(p => {
    const countryComponent = (p.addressComponents || []).find(c => c.types?.includes('country'));
    return {
      name:        p.displayName?.text || '',
      type:        p.primaryTypeDisplayName?.text || '',
      rating:      p.rating ? `${p.rating}★` : '',
      summary:     p.editorialSummary?.text || '',
      countryCode: (countryComponent?.shortText || '').toUpperCase(),
      placeId:     p.id || '',
      zone,
    };
  }).filter(p => p.name);
}

async function fetchNearbyPlaces(lat, lng, radiusKm, countryCode) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) { console.warn('[Places] GOOGLE_PLACES_API_KEY not set'); return []; }

  const centers      = getSearchCenters(lat, lng, radiusKm);
  const circleRadius = Math.min(radiusKm * 1000, PLACES_MAX_RADIUS_M);
  console.log(`[Places] ${radiusKm}km radius → ${centers.length} circle(s) × ${PLACE_CATEGORY_GROUPS.length} groups (${circleRadius / 1000}km each) countryFilter=${countryCode || 'none'}`);

  try {
    const allResults = await Promise.all(
      centers.flatMap(c =>
        PLACE_CATEGORY_GROUPS.map(types => fetchPlaceGroup(key, c.lat, c.lng, circleRadius, types, c.zone))
      )
    );
    const seen   = new Set();
    const merged = allResults.flat().filter(p => {
      if (!p.name || seen.has(p.name)) return false;
      // Filter to user's country when a country code is provided
      if (countryCode && p.countryCode && p.countryCode !== countryCode) return false;
      seen.add(p.name);
      return true;
    });
    // Group by zone, randomly sample from a quality pool per zone for variety
    const byZone = {};
    for (const p of merged) {
      if (!byZone[p.zone]) byZone[p.zone] = [];
      byZone[p.zone].push(p);
    }

    const zoneNames   = Object.keys(byZone);
    const perZoneCap  = Math.max(10, Math.floor(60 / zoneNames.length));
    const selected    = [];

    for (const zone of zoneNames) {
      // Sort by rating to build a quality pool, then randomly pick from the top portion
      const sorted    = byZone[zone].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
      const poolSize  = Math.min(sorted.length, perZoneCap * 2); // quality pool = 2x target
      const pool      = sorted.slice(0, poolSize);

      // Fisher-Yates shuffle the pool
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      selected.push(...pool.slice(0, perZoneCap));
    }

    console.log(`[Places] Got ${merged.length} unique places → sampled ${selected.length} across ${zoneNames.length} zone(s): ${zoneNames.join(', ')}`);
    return selected;
  } catch (err) {
    console.error('[Places] Fetch failed:', err.message);
    return [];
  }
}

function parseCost(costStr) {
  const match = String(costStr || '').match(/\$?([\d,]+)/);
  return match ? parseFloat(match[1].replace(',', '')) : 0;
}

function calcTotalCost(plan) {
  let total = 0;
  for (const day of plan.days || []) {
    for (const act of day.activities || []) total += parseCost(act.cost);
  }
  return total > 0 ? `$${total}` : null;
}

function enforceBudget(plan, budgetNum) {
  if (!budgetNum) return;

  // Build a flat list of all activities with their costs
  const flat = [];
  for (let di = 0; di < (plan.days || []).length; di++) {
    for (let ai = 0; ai < (plan.days[di].activities || []).length; ai++) {
      flat.push({ di, ai, cost: parseCost(plan.days[di].activities[ai].cost) });
    }
  }

  let total = flat.reduce((s, a) => s + a.cost, 0);
  if (total <= budgetNum) return;

  // Sort most expensive first, skip free activities
  flat.sort((a, b) => b.cost - a.cost);

  const removed = new Set();
  for (const item of flat) {
    if (total <= budgetNum) break;
    if (item.cost === 0) continue;

    // Keep at least 3 activities per day
    const dayCount = plan.days[item.di].activities.length -
      [...removed].filter(k => k.startsWith(`${item.di}-`)).length;
    if (dayCount <= 3) continue;

    removed.add(`${item.di}-${item.ai}`);
    total -= item.cost;
  }

  // Apply removals in reverse index order so splice indices stay valid
  for (let di = 0; di < plan.days.length; di++) {
    const toRemove = [...removed]
      .filter(k => k.startsWith(`${di}-`))
      .map(k => parseInt(k.split('-')[1]))
      .sort((a, b) => b - a);
    for (const ai of toRemove) plan.days[di].activities.splice(ai, 1);
  }
}

function normalizeTitle(title) {
  return title
    .replace(/^(lunch|dinner|breakfast|brunch|supper|visit|explore|discover|morning|evening|afternoon|night)\s+(at|to|the|a|an)?\s*/i, '')
    .trim()
    .toLowerCase();
}

function attachPlaceIds(plan, nearbyPlaces) {
  if (!nearbyPlaces.length) return;

  for (const day of plan.days || []) {
    for (const act of day.activities || []) {
      const isRevisit = act.title?.startsWith('Revisiting: ');
      const raw = isRevisit ? act.title.slice('Revisiting: '.length) : (act.title || '');
      const normalized = normalizeTitle(raw);

      const match =
        nearbyPlaces.find(p => p.name.toLowerCase() === normalized) ||
        nearbyPlaces.find(p => normalized.includes(p.name.toLowerCase()) && p.name.length > 3) ||
        nearbyPlaces.find(p => p.name.toLowerCase().includes(normalized) && normalized.length > 3);

      if (match) {
        // Snap to the exact Google Places name (preserves "Lunch at" / "Revisiting:" prefixes)
        if (raw !== match.name) act.title = act.title.replace(raw, match.name);
        if (match.placeId) act.placeId = match.placeId;
      } else if (nearbyPlaces.length > 0) {
        // AI invented a venue name not in the approved list — flag it
        console.warn(`[Planner] Invented venue stripped: "${act.title}"`);
        act.invented = true;
      }
    }
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
    const main = data.weather[0].main; // Rain, Snow, Clear, Clouds, Thunderstorm, etc.
    const temp = Math.round(data.main.temp);
    return {
      display: `${desc.charAt(0).toUpperCase() + desc.slice(1)} · ${temp}°C`,
      main,
      temp,
    };
  } catch {
    return null;
  }
}

function weatherActivityHint(main, temp) {
  if (!main) return '';
  if (main === 'Thunderstorm')
    return 'WEATHER RULE: There is a thunderstorm. Suggest ONLY indoor activities (museums, restaurants, cafes, galleries, shopping). Do NOT suggest any outdoor activities.';
  if (main === 'Rain' || main === 'Drizzle')
    return 'WEATHER RULE: It is raining. Heavily favour indoor activities (museums, restaurants, cafes, indoor attractions). Avoid beaches, hikes, and open-air markets. If an outdoor activity is included, note it may be wet.';
  if (main === 'Snow')
    return 'WEATHER RULE: It is snowing. Prioritise winter activities — ski resorts, snow hikes, cosy mountain lodges, hot drinks at cafes. Avoid beach and water activities entirely.';
  if (main === 'Mist' || main === 'Fog' || main === 'Haze' || main === 'Dust' || main === 'Sand')
    return 'WEATHER RULE: Visibility is poor (mist/fog/haze). Avoid scenic viewpoints and long drives. Prefer indoor venues and short local walks.';
  if ((main === 'Clear' || main === 'Clouds') && temp >= 26)
    return 'WEATHER RULE: It is hot and sunny. Prioritise beaches, swimming, parks, and shaded outdoor dining. Include at least one beach or water activity if available.';
  if ((main === 'Clear' || main === 'Clouds') && temp <= 8)
    return 'WEATHER RULE: It is cold but dry. Suggest scenic walks, cosy cafes, museums, and indoor attractions. Avoid water activities.';
  return '';
}

router.post('/generate', validatePlannerRequest, async (req, res, next) => {
  try {
    const { lat, lng, budget, location, radius, countryCode, savedPlaces = [] } = req.body;

    const radiusKm = radius ? parseInt(radius) : null;
    console.log(`[Planner] location="${location}" lat=${lat} lng=${lng} radius=${radiusKm}km country=${countryCode || '?'} budget=${budget}`);

    const [weather, nearbyPlaces] = await Promise.all([
      fetchWeather(lat, lng, location),
      (lat != null && radiusKm) ? fetchNearbyPlaces(lat, lng, radiusKm, countryCode || '') : Promise.resolve([]),
    ]);
    console.log(`[Planner] weather="${weather?.display}" nearbyPlaces=${nearbyPlaces.length}`);
    const budgetLabel  = budget ? `$${parseFloat(budget).toFixed(0)}` : 'flexible';
    const locationLine = location
      ? `The user is in or near: ${location}.${lat != null ? ` Coordinates: (${lat}, ${lng}).` : ''}`
      : `The user is near coordinates (${lat}, ${lng}).`;
    const radiusLine  = radiusKm
      ? `RADIUS: ${radiusKm} km from (${lat}, ${lng}). Only use places from the verified list below — do not invent or add venues outside it.`
      : '';
    const weatherLine    = weather ? `Current weather: ${weather.display}.` : '';
    const weatherHint    = weather ? weatherActivityHint(weather.main, weather.temp) : '';
    // Pre-assign zones server-side so the AI has no choice to make
    let day1Zone = null, day2Zone = null;
    if (radiusKm && radiusKm > 25 && nearbyPlaces.length > 0) {
      const zoneCounts = {};
      for (const p of nearbyPlaces) zoneCounts[p.zone] = (zoneCounts[p.zone] || 0) + 1;
      const ranked = Object.entries(zoneCounts).sort((a, b) => b[1] - a[1]).map(([z]) => z);
      day1Zone = ranked[0] || 'Center';
      day2Zone = ranked[1] || ranked[0] || 'Center';
      console.log(`[Planner] Zone assignment: Day1=${day1Zone}(${zoneCounts[day1Zone]}) Day2=${day2Zone}(${zoneCounts[day2Zone]})`);
    }
    const zoneRule = day1Zone
      ? `\nDAY ZONE ASSIGNMENT — THIS IS MANDATORY, NOT A SUGGESTION:\n` +
        `Day 1 (Saturday): use ONLY venues tagged [${day1Zone}]. Every single activity must be from the [${day1Zone}] zone.\n` +
        `Day 2 (Sunday): use ONLY venues tagged [${day2Zone}]. Every single activity must be from the [${day2Zone}] zone.\n` +
        `Using a venue from ANY other zone is forbidden and makes your response invalid.\n` +
        `Within each day, order the venues to minimise travel — move in one direction, no backtracking.\n`
      : '';
    const placesDesc  = nearbyPlaces.length > 0
      ? zoneRule +
        `APPROVED VENUE LIST — the ONLY venue names you are allowed to use (copy them EXACTLY, character for character):\n` +
        nearbyPlaces.map((p, i) => `${i + 1}. [${p.zone}] ${p.name}${p.type ? ' | ' + p.type : ''}${p.rating ? ' | ' + p.rating : ''}${p.summary ? ' | ' + p.summary : ''}`).join('\n') +
        `\n\nCRITICAL: When naming a venue in the "title" field you MUST use one of the exact names from the numbered list above. ` +
        `Copy the name verbatim — no abbreviations, no translations, no made-up names. ` +
        `If no suitable venue exists in the list for an activity slot, use a generic description (e.g. "Morning coastal walk", "Local market browse") instead. ` +
        `Using any venue name that does NOT appear in the numbered list above is strictly forbidden.`
      : radiusKm
        ? `No named venues were found nearby. Do NOT invent any specific venue or restaurant names. Use only generic activity descriptions (e.g. "Morning walk", "Seafront stroll", "Local café visit").`
        : '';
    const avoidDesc = savedPlaces.length > 0
      ? `PREVIOUSLY VISITED PLACES (do NOT suggest these again unless no other options exist within the radius): ${savedPlaces.slice(0, 40).join(', ')}.\n` +
        `If you absolutely must reuse one of these because no alternatives exist, prefix its "title" value with exactly "Revisiting: " (e.g. "Revisiting: Swiss Butter").`
      : '';

    const budgetNum  = budget ? parseFloat(budget) : null;
    const budgetMin  = budgetNum ? `$${Math.round(budgetNum * 0.85)}` : null;
    const actCount   = 9; // 4-5 per day × 2 days
    const budgetRule = budgetNum
      ? `BUDGET CONSTRAINT: Total budget is ${budgetLabel} for the full weekend (~${actCount} activities).\n` +
        `REAL-WORLD COST RULES — costs must reflect actual prices, never invented low numbers:\n` +
        `  • Free: walks, beaches, parks, scenic viewpoints, markets (browsing only)\n` +
        `  • $5-15: street food, bakery snack, coffee shop\n` +
        `  • $15-35: casual sit-down restaurant meal per person\n` +
        `  • $35-70: upscale restaurant or hotel dining per person\n` +
        `  • $10-25: museum, gallery, or attraction entry\n` +
        `  • $20-50: guided tour, wine tasting, cooking class, boat trip\n` +
        `A restaurant meal is NEVER $8 unless it is explicitly a fast-food or street-food stall.\n` +
        `Use the budget to choose the RIGHT TIER of activity, not to invent fake low prices.\n` +
        `A ${budgetLabel} budget means: ` +
        (budgetNum <= 100
          ? `mostly free activities + cheap eats (street food, cafes). Avoid expensive restaurants and paid attractions.`
          : budgetNum <= 200
          ? `2-3 sit-down restaurant meals ($20-35 each), 2 paid attractions ($15-25 each), and at most 1-2 free activities. You MUST fill the budget — mostly free plans are wrong.`
          : budgetNum <= 400
          ? `casual to mid-range dining, several paid attractions, a couple of upscale meals.`
          : `upscale dining, premium attractions, guided experiences. This is a comfortable budget.`) + `\n` +
        `The SUM of all "cost" fields MUST land between ${budgetMin} and ${budgetLabel}. ` +
        `Going below ${budgetMin} is a FAILURE. If activities are cheap, add more paid ones or upgrade to a higher tier. Never pad with free activities to avoid spending.`
      : '';

    const prompt = `You are a weekend getaway planner. ${locationLine}
${radiusLine}
${weatherLine}
${weatherHint}
${budgetRule}
${placesDesc}
${avoidDesc}

Generate a practical, enjoyable 2-day weekend itinerary with 4-5 activities per day.
STRICT RULES — violating any of these is not allowed:
1. COUNTRY: Every single activity MUST be located in ${location || 'the same country as the user'}. Do NOT suggest places in other countries under any circumstances.
2. RADIUS: ${radiusKm ? `Every single activity MUST be within ${radiusKm} km of (${lat}, ${lng}). Do NOT include anything farther.` : 'Keep all activities within a reasonable travel distance.'}
3. BUDGET: ${budgetNum ? `Costs must reflect real-world prices (see BUDGET CONSTRAINT above). Never write $8 for a restaurant. The SUM of all costs MUST be between ${budgetMin} and ${budgetLabel}. A plan under ${budgetMin} is INVALID — add paid activities or upgrade tiers instead of padding with free ones.` : 'Keep costs reasonable and realistic.'}
4. ROUTING: ${day1Zone ? `Day 1 = [${day1Zone}] venues ONLY. Day 2 = [${day2Zone}] venues ONLY. This is already decided — do not deviate. Within each day order venues to minimise travel.` : 'Order activities to minimise travel. Never zigzag.'}
5. VENUES: ${nearbyPlaces.length > 0 ? `Every venue "title" MUST be copied verbatim from the APPROVED VENUE LIST numbered above. If you use a name not in that list, your response is invalid. For activities with no matching venue, write a generic description — never a made-up name.` : 'Do not use any specific venue or restaurant names — generic activity descriptions only.'}
6. SCHEDULE: Meals at logical times (breakfast 7-10am, lunch 11am-2pm, dinner 6-9pm). No 9am dinners.
7. DESCRIPTIONS: For each "desc", write 2 vivid sentences explaining WHY it's worth visiting — the atmosphere, a signature dish, a view, what makes it special. Never write "enjoy a meal at a restaurant".
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
          "desc": "Two vivid sentences describing why this is worth visiting.",
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
The "type" field must be one of: food, sightseeing, adventure, activity.`;

    const countryName = location ? location.split(',').pop().trim() : 'the user\'s country';
    const systemMessage = radiusKm && radiusKm <= 10
      ? `You are a hyperlocal weekend planner based in ${countryName}. Your two absolute rules: ` +
        `(1) ONLY suggest places inside ${countryName} — never another country. ` +
        `(2) ONLY suggest activities within ${radiusKm} km of the user's location — neighbourhood-level only. ` +
        `If genuine local options are limited, suggest pleasant generic local activities rather than violating either rule.`
      : `You are a practical weekend getaway planner. All suggestions MUST be inside ${countryName}. ` +
        `Keep all activities within ${radiusKm ? radiusKm + ' km of the user' : 'a reasonable travel distance'}.` +
        (day1Zone
          ? ` ROUTING IS PRE-ASSIGNED: Day 1 uses ONLY [${day1Zone}] venues. Day 2 uses ONLY [${day2Zone}] venues. This is fixed — do not mix zones.`
          : '');

    const response = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user',   content: prompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
      temperature: 0.7,
    });
    const plan = JSON.parse(response.choices[0].message.content);
    if (weather) plan.weather = weather.display;
    attachPlaceIds(plan, nearbyPlaces);
    enforceBudget(plan, budgetNum);
    const actualTotal = calcTotalCost(plan);
    if (actualTotal) plan.totalCost = actualTotal;
    res.json({ plan });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
