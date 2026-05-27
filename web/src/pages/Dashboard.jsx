import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/authService';
import { saveTrip, loadTrips, deleteTrip, updateTripTitle } from '../services/tripService';
import { generatePlan } from '../services/apiService';
import Button from '../components/Button';
import styles from './Dashboard.module.css';

const TYPE_LABELS = {
  food: '🍽 Food',
  sightseeing: '🏛 Sightseeing',
  adventure: '🚵 Adventure',
  activity: '🎯 Activity',
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // User display
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'there';
  const initial     = displayName.charAt(0).toUpperCase();

  // Location
  const [locationLabel,   setLocationLabel]   = useState('');
  const [coords,          setCoords]          = useState(null);
  const [countryCode,     setCountryCode]     = useState('');
  const [locLoading,      setLocLoading]      = useState(false);
  const [locError,        setLocError]        = useState('');
  const cityInputRef    = useRef(null);
  const suggestionsRef  = useRef(null);
  const suggestDebounce = useRef(null);

  // Autocomplete
  const [suggestions,     setSuggestions]     = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cityCoords,      setCityCoords]      = useState(null); // lat/lng from autocomplete selection

  // Radius (km) — only used when GPS coords are available
  const [radius, setRadius] = useState(10);

  // Budget
  const [budget, setBudget] = useState(200);


  // Plan
  const [planStatus, setPlanStatus] = useState('idle'); // idle | loading | success | error
  const [plan,       setPlan]       = useState(null);
  const [planError,  setPlanError]  = useState('');
  const [genError,   setGenError]   = useState('');
  const [saved,      setSaved]      = useState(false);

  const [savedTrips,    setSavedTrips]    = useState([]);
  const [tripsLoading,  setTripsLoading]  = useState(true);

  // Editable trip title
  const [savedTripId,    setSavedTripId]    = useState(null);
  const [planTitle,      setPlanTitle]      = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleVal,   setEditTitleVal]   = useState('');

  // ── Load trips on mount ────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.uid) return;
    loadTrips(user.uid)
      .then(setSavedTrips)
      .catch(() => {})
      .finally(() => setTripsLoading(false));
  }, [user?.uid]);

  // ── Auto-request location on first load ───────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      cityInputRef.current?.focus();
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoords({ lat, lng });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en', 'User-Agent': 'GetaWay-App/1.0' } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const city = addr.city || addr.town || addr.village || addr.county || '';
          const country = addr.country || '';
          setCountryCode((addr.country_code || '').toUpperCase());
          setLocationLabel(city && country ? `${city}, ${country}` : city || country || 'Current location');
        } catch {
          setLocationLabel('Current location');
        }
        setLocLoading(false);
      },
      () => {
        setLocLoading(false);
        setLocError('Location access denied. Type a city below instead.');
        setTimeout(() => cityInputRef.current?.focus(), 100);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function fetchSuggestions(query) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1&featuretype=city`,
        { headers: { 'Accept-Language': 'en', 'User-Agent': 'GetaWay-App/1.0' } }
      );
      const data = await res.json();
      const seen = new Set();
      const items = data
        .filter(item => item.address)
        .map(item => {
          const addr = item.address;
          const city = addr.city || addr.town || addr.village || addr.county || item.display_name.split(',')[0].trim();
          const country = addr.country || '';
          const label = city && country ? `${city}, ${country}` : city || country;
          return {
            label,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            countryCode: (addr.country_code || '').toUpperCase(),
          };
        })
        .filter(item => {
          if (!item.label || seen.has(item.label)) return false;
          seen.add(item.label);
          return true;
        })
        .slice(0, 5);
      setSuggestions(items);
      setShowSuggestions(items.length > 0);
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }

  function handleSelectSuggestion(item) {
    setLocationLabel(item.label);
    setCityCoords({ lat: item.lat, lng: item.lng, countryCode: item.countryCode });
    setSuggestions([]);
    setShowSuggestions(false);
  }

  async function handleUseLocation() {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      return;
    }
    setLocLoading(true);
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoords({ lat, lng });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en', 'User-Agent': 'GetaWay-App/1.0' } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const city = addr.city || addr.town || addr.village || addr.county || '';
          const country = addr.country || '';
          setCountryCode((addr.country_code || '').toUpperCase());
          setLocationLabel(city && country ? `${city}, ${country}` : city || country || 'Current location');
        } catch {
          setLocationLabel('Current location');
        }
        setLocLoading(false);
      },
      () => {
        setLocError('Location access denied. Type a city below instead.');
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  function handleManualLocation(e) {
    const val = e.target.value;
    setLocationLabel(val);
    setCoords(null);
    setCityCoords(null);
    setLocError('');
    clearTimeout(suggestDebounce.current);
    if (val.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    suggestDebounce.current = setTimeout(() => fetchSuggestions(val), 350);
  }

  async function handleGenerate() {
    if (!locationLabel.trim() && !coords) {
      setGenError('Please set your location first.');
      return;
    }
    setGenError('');
    setSaved(false);
    setSavedTripId(null);
    setPlanTitle('');
    setPlanStatus('loading');
    setPlan(null);

    try {
      const savedPlaces = [...new Set(
        savedTrips.slice(0, 10).flatMap(t =>
          t.plan?.days?.flatMap(d => d.activities?.map(a => {
            const raw = (a.title || '').startsWith('Revisiting: ')
              ? a.title.slice('Revisiting: '.length)
              : (a.title || '');
            return raw.replace(/^(lunch|dinner|breakfast|brunch|supper|visit|explore|discover|morning|evening|afternoon|night)\s+(at|to|the|a|an)?\s*/i, '').trim();
          }) || []) || []
        ).filter(Boolean)
      )].slice(0, 40);
      const payload = {
        budget,
        location: locationLabel,
        savedPlaces,
        ...(coords
          ? { lat: coords.lat, lng: coords.lng, radius, countryCode }
          : cityCoords
          ? { lat: cityCoords.lat, lng: cityCoords.lng, radius: 25, countryCode: cityCoords.countryCode }
          : {}),
      };
      const { plan: generatedPlan } = await generatePlan(payload);
      setPlan(generatedPlan);
      setPlanTitle(generatedPlan.title);
      setPlanStatus('success');
    } catch (err) {
      setPlanError(err.message || 'Could not generate your plan. Please try again.');
      setPlanStatus('error');
    }
  }

  function openInMaps(label) {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(label)}`,
      '_blank',
      'noopener,noreferrer'
    );
  }

  function stripActivityPrefix(title) {
    return title
      .replace(/^(lunch|dinner|breakfast|brunch|supper|visit|explore|discover|morning|evening|afternoon|night)\s+(at|to|the|a|an)?\s*/i, '')
      .trim();
  }

  function openDayInMaps(day) {
    const activities = day.activities || [];
    if (!activities.length) return;

    // Append country to each stop so Google Maps resolves the right location.
    // "Beirut, Lebanon" → "Lebanon"; plain label → use as-is.
    const country = locationLabel.includes(',')
      ? locationLabel.split(',').pop().trim()
      : locationLabel;

    const stops = activities.map(act => {
      const isRevisit = act.title?.startsWith('Revisiting: ');
      const raw = isRevisit ? act.title.slice('Revisiting: '.length) : act.title;
      const title = stripActivityPrefix(raw);
      return {
        label:   country ? `${title}, ${country}` : title,
        placeId: act.placeId || '',
      };
    });

    const last      = stops[stops.length - 1];
    const waypoints = stops.slice(0, -1);

    let url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(last.label)}`;
    if (last.placeId) url += `&destination_place_id=${last.placeId}`;

    if (waypoints.length) {
      url += `&waypoints=${waypoints.map(s => encodeURIComponent(s.label)).join('|')}`;
      url += `&waypoint_place_ids=${waypoints.map(s => s.placeId).join('|')}`;
    }
    if (coords) {
      url += `&origin=${coords.lat},${coords.lng}`;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  async function handleSave() {
    const title = planTitle || plan.title;
    setSaved(true);
    const entry = {
      title,
      location: locationLabel || 'Current location',
      budget:   `$${budget}`,
      plan: { ...plan, title },
    };
    try {
      const id = await saveTrip(user.uid, entry);
      setSavedTripId(id);
      setSavedTrips(prev => [{ ...entry, id, savedAt: new Date() }, ...prev]);
    } catch {
      setSaved(false);
    }
  }

  async function handleTitleSave(newTitle) {
    const trimmed = newTitle.trim();
    setIsEditingTitle(false);
    if (!trimmed || trimmed === planTitle) return;
    const prevTitle = planTitle;
    setPlanTitle(trimmed);
    if (savedTripId) {
      setSavedTrips(prev => prev.map(t => t.id === savedTripId ? { ...t, title: trimmed } : t));
      try {
        await updateTripTitle(user.uid, savedTripId, trimmed);
      } catch {
        setPlanTitle(prevTitle);
        setSavedTrips(prev => prev.map(t => t.id === savedTripId ? { ...t, title: prevTitle } : t));
      }
    }
  }

  function handleLoadSavedTrip(trip) {
    setPlan(trip.plan);
    setPlanTitle(trip.title);
    setSavedTripId(trip.id);
    setPlanStatus('success');
    setSaved(true);
  }

  async function handleDeleteTrip(e, tripId) {
    e.stopPropagation();
    setSavedTrips(prev => prev.filter(t => t.id !== tripId));
    try {
      await deleteTrip(user.uid, tripId);
    } catch {
      // re-load if delete failed
      loadTrips(user.uid).then(setSavedTrips).catch(() => {});
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.dashboard}>

      {/* ── Left panel ──────────────────────────────────────────────────── */}
      <aside className={styles.left}>

        {/* User bar */}
        <div className={styles.userBar}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{initial}</div>
            <span className={styles.userName}>{displayName}</span>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogoutIcon /> Log out
          </button>
        </div>

        {/* Form */}
        <div className={styles.formSection}>
          <h2 className={styles.formTitle}>Plan your weekend</h2>

          {/* Location */}
          <div className={styles.field}>
            <label className={styles.label}>
              <LocationIcon /> Location
            </label>
            <button
              className={`${styles.gpsBtn} ${locLoading ? styles.gpsBtnLoading : ''} ${coords ? styles.gpsBtnActive : ''}`}
              onClick={handleUseLocation}
              disabled={locLoading}
              type="button"
            >
              {locLoading ? <SpinnerIcon /> : <GpsIcon />}
              {locLoading ? 'Getting location…' : coords ? 'Using current location' : 'Use my location'}
            </button>
            <div className={styles.orDivider}>or</div>
            <div className={styles.cityInputWrap} ref={suggestionsRef}>
              <input
                ref={cityInputRef}
                type="text"
                className={styles.cityInput}
                placeholder="Type a city, e.g. Beirut"
                value={locationLabel}
                onChange={handleManualLocation}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className={styles.suggestList}>
                  {suggestions.map((item, i) => (
                    <li
                      key={i}
                      className={styles.suggestItem}
                      onMouseDown={() => handleSelectSuggestion(item)}
                    >
                      <span className={styles.suggestIcon}><LocationIcon /></span>
                      {item.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {locError && <span className={styles.fieldError}>{locError}</span>}
          </div>

          {/* Radius — only when GPS is active */}
          {coords && (
            <div className={styles.field}>
              <label className={styles.label}>
                <RadiusIcon /> Nearby radius
              </label>
              <div className={styles.radiusPresets}>
                {[10, 25, 50, 100].map(r => (
                  <button
                    key={r}
                    type="button"
                    className={`${styles.preset} ${styles.radiusPreset} ${radius === r ? styles.presetActive : ''}`}
                    onClick={() => setRadius(r)}
                  >
                    {r} km
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Budget */}
          <div className={styles.field}>
            <label className={styles.label}>
              <BudgetIcon /> Budget
            </label>
            <div className={styles.budgetRow}>
              <span className={styles.budgetValue}>${budget}</span>
              <div className={styles.budgetPresets}>
                {[100, 200, 500].map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`${styles.preset} ${budget === p ? styles.presetActive : ''}`}
                    onClick={() => setBudget(p)}
                  >
                    ${p}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="range"
              className={styles.slider}
              min={50}
              max={1000}
              step={10}
              value={budget}
              onChange={e => setBudget(Number(e.target.value))}
              style={{ '--progress': `${((budget - 50) / 950) * 100}%` }}
            />
            <div className={styles.sliderLabels}>
              <span>$50</span>
              <span>$1,000</span>
            </div>
          </div>

          {genError && <p className={styles.genError}>{genError}</p>}

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={planStatus === 'loading'}
            onClick={handleGenerate}
          >
            <GenerateIcon /> Generate My Weekend
          </Button>
        </div>

        {/* Saved trips */}
        <div className={styles.savedSection}>
          <h3 className={styles.savedTitle}>Saved Trips</h3>
          {tripsLoading ? (
            <p className={styles.tripsLoading}>Loading trips…</p>
          ) : savedTrips.length === 0 ? (
            <div className={styles.savedEmpty}>
              <BookmarkIcon />
              <p>No saved trips yet.<br />Generate a plan and save it here.</p>
            </div>
          ) : (
            <ul className={styles.savedList}>
              {savedTrips.map(t => (
                <li key={t.id} className={styles.savedItem} onClick={() => handleLoadSavedTrip(t)}>
                  <div className={styles.savedItemRow}>
                    <span className={styles.savedItemTitle}>{t.title}</span>
                    <button
                      className={styles.deleteBtn}
                      onClick={(e) => handleDeleteTrip(e, t.id)}
                      aria-label="Delete trip"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                  <span className={styles.savedItemMeta}>{t.location} · {t.budget}</span>
                  <span className={styles.savedItemDate}>
                    {t.savedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {' at '}
                    {t.savedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* ── Right panel ─────────────────────────────────────────────────── */}
      <main className={styles.right}>

        {planStatus === 'idle' && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><MapIcon /></div>
            <h2 className={styles.emptyTitle}>Ready to plan your weekend?</h2>
            <p className={styles.emptyDesc}>
              Set your location and budget on the left,<br />then hit <strong>Generate My Weekend</strong>.
            </p>
          </div>
        )}

        {planStatus === 'loading' && (
          <div className={styles.emptyState}>
            <div className={styles.loadingSpinner} />
            <h2 className={styles.emptyTitle}>Building your itinerary…</h2>
            <p className={styles.emptyDesc}>Checking the weather, finding nearby spots, calculating your budget.</p>
          </div>
        )}

        {planStatus === 'error' && (
          <div className={styles.emptyState}>
            <p className={styles.planError}>{planError}</p>
            <Button variant="primary" onClick={handleGenerate}>Try Again</Button>
          </div>
        )}

        {planStatus === 'success' && plan && (
          <div className={styles.planWrap}>
            {/* Plan header */}
            <div className={styles.planHeader}>
              <div>
                {isEditingTitle ? (
                  <input
                    className={styles.titleInput}
                    value={editTitleVal}
                    onChange={e => setEditTitleVal(e.target.value)}
                    onBlur={() => handleTitleSave(editTitleVal)}
                    onKeyDown={e => {
                      if (e.key === 'Enter')  { e.target.blur(); }
                      if (e.key === 'Escape') { setIsEditingTitle(false); setEditTitleVal(planTitle); }
                    }}
                    autoFocus
                  />
                ) : (
                  <div
                    className={styles.titleWrapper}
                    onClick={() => { setIsEditingTitle(true); setEditTitleVal(planTitle || plan.title); }}
                  >
                    <h2 className={styles.planTitle}>{planTitle || plan.title}</h2>
                    <span className={styles.titleEditHint}><PencilIcon /></span>
                  </div>
                )}
                <div className={styles.planMeta}>
                  {plan.weather && <span><WeatherIcon /> {plan.weather}</span>}
                  {plan.totalCost && <span><CostIcon /> Est. {plan.totalCost} total</span>}
                </div>
              </div>
              <div className={styles.planActions}>
                <button
                  className={`${styles.saveBtn} ${saved ? styles.saveBtnDone : ''}`}
                  onClick={handleSave}
                  disabled={saved}
                >
                  <BookmarkIcon /> {saved ? 'Saved!' : 'Save trip'}
                </button>
              </div>
            </div>

            {/* Days */}
            {plan.days.map((day, di) => (
              <div key={di} className={styles.daySection}>
                <div className={styles.dayLabelRow}>
                  <h3 className={styles.dayLabel}>{day.label}</h3>
                  <button
                    className={styles.mapsBtn}
                    onClick={() => openDayInMaps(day)}
                    type="button"
                  >
                    <MapsIcon /> Navigate
                  </button>
                </div>
                <div className={styles.timeline}>
                  {day.activities.map((act, ai) => {
                    const isRevisit = act.title?.startsWith('Revisiting: ');
                    const displayTitle = isRevisit ? act.title.slice('Revisiting: '.length) : act.title;
                    return (
                      <div key={ai} className={`${styles.activity} ${styles[`type_${act.type}`]}`}>
                        <div className={styles.activityLeft}>
                          <span className={styles.activityTime}>{act.time}</span>
                          <div className={styles.activityLine} />
                        </div>
                        <div className={styles.activityBody}>
                          <div className={styles.activityTop}>
                            <div className={styles.activityTitleRow}>
                              <h4 className={styles.activityTitle}>{displayTitle}</h4>
                              {isRevisit && <span className={styles.revisitBadge}>Revisiting</span>}
                            </div>
                            <div className={styles.activityTopRight}>
                              <span className={styles.activityCost}>{act.cost}</span>
                              <button
                                className={styles.activityMapsBtn}
                                onClick={() => {
                                const country = locationLabel.includes(',') ? locationLabel.split(',').pop().trim() : locationLabel;
                                const clean = stripActivityPrefix(displayTitle);
                                const label = country ? `${clean}, ${country}` : clean;
                                if (act.placeId) {
                                  window.open(
                                    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(label)}&destination_place_id=${act.placeId}`,
                                    '_blank', 'noopener,noreferrer'
                                  );
                                } else {
                                  openInMaps(label);
                                }
                              }}
                                title="Open in Google Maps"
                                type="button"
                              >
                                <MapsIcon />
                              </button>
                            </div>
                          </div>
                          <p className={styles.activityDesc}>{act.desc}</p>
                          <span className={styles.activityTag}>{TYPE_LABELS[act.type] || act.type}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function LocationIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}
function BudgetIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
}
function GpsIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="8" strokeDasharray="2 2"/></svg>;
}
function SpinnerIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" className="spin"/></svg>;
}
function GenerateIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
}
function LogoutIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}
function BookmarkIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;
}
function TrashIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
}
function MapIcon() {
  return <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
}
function WeatherIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
}
function CostIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
}
function RadiusIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9" strokeDasharray="3 3"/></svg>;
}
function PencilIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}
function MapsIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}
