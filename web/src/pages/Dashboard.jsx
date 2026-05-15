import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/authService';
import Button from '../components/Button';
import styles from './Dashboard.module.css';

// ── Mock plan (Phase 11 replaces this with real OpenAI call) ──────────────────
const MOCK_PLAN = {
  title: 'Your Weekend Escape',
  totalCost: '$185',
  weather: 'Partly cloudy · 21°C',
  days: [
    {
      label: 'Day 1 · Saturday',
      activities: [
        { time: '9:00 AM',  title: 'Morning walk in the park',   desc: 'Start the day with a refreshing walk through the local park — great for clearing your head.', cost: 'Free',  type: 'activity' },
        { time: '11:00 AM', title: 'Brunch at a local café',      desc: 'Try the highly-rated brunch spot just 10 min away. Known for their eggs benedict.', cost: '~$18', type: 'food' },
        { time: '1:00 PM',  title: 'City museum tour',            desc: 'Explore the permanent and rotating exhibits at the main city museum.', cost: '~$15', type: 'sightseeing' },
        { time: '4:00 PM',  title: 'Afternoon kayaking',          desc: 'Rent a kayak at the river dock for 2 hours — no experience needed.', cost: '~$30', type: 'adventure' },
        { time: '7:30 PM',  title: 'Dinner at the waterfront',    desc: 'End the day with fresh seafood and great views at the riverside restaurant.', cost: '~$45', type: 'food' },
      ],
    },
    {
      label: 'Day 2 · Sunday',
      activities: [
        { time: '9:30 AM',  title: "Farmers' market",             desc: 'Browse the weekend market for fresh produce, local crafts, and street food.', cost: '~$20', type: 'activity' },
        { time: '11:30 AM', title: 'Botanical garden',            desc: 'A peaceful stroll through the gardens — free entry on Sundays.', cost: 'Free',  type: 'sightseeing' },
        { time: '1:30 PM',  title: 'Rooftop lunch',               desc: 'Casual lunch with great city views. Try the chicken wrap — staff favourite.', cost: '~$22', type: 'food' },
        { time: '3:30 PM',  title: 'Bike ride along the coast',   desc: 'Rent bikes from the station near the garden and explore the coastal path.', cost: '~$20', type: 'adventure' },
        { time: '6:00 PM',  title: 'Sunset drinks',               desc: 'Wrap up the weekend at the rooftop bar with great views of the sunset.', cost: '~$15', type: 'food' },
      ],
    },
  ],
};

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
  const [locLoading,      setLocLoading]      = useState(false);
  const [locError,        setLocError]        = useState('');

  // Budget
  const [budget, setBudget] = useState(200);

  // Plan
  const [planStatus, setPlanStatus] = useState('idle'); // idle | loading | success | error
  const [plan,       setPlan]       = useState(null);
  const [planError,  setPlanError]  = useState('');
  const [genError,   setGenError]   = useState('');
  const [saved,      setSaved]      = useState(false);

  // Saved trips (Phase 13 wires Firestore — for now, in-session memory)
  const [savedTrips, setSavedTrips] = useState([]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function handleUseLocation() {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      return;
    }
    setLocLoading(true);
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLabel('Current location');
        setLocLoading(false);
      },
      () => {
        setLocError('Location access denied. Type a city below instead.');
        setLocLoading(false);
      },
      { timeout: 8000 }
    );
  }

  function handleManualLocation(e) {
    setLocationLabel(e.target.value);
    setCoords(null);
    setLocError('');
  }

  async function handleGenerate() {
    if (!locationLabel.trim() && !coords) {
      setGenError('Please set your location first.');
      return;
    }
    setGenError('');
    setSaved(false);
    setPlanStatus('loading');
    setPlan(null);

    // Phase 11: replace with → generatePlan({ lat: coords?.lat, lng: coords?.lng, budget, location: locationLabel })
    try {
      await new Promise(r => setTimeout(r, 2200));
      setPlan(MOCK_PLAN);
      setPlanStatus('success');
    } catch {
      setPlanError('Could not generate your plan. Please try again.');
      setPlanStatus('error');
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  function handleSave() {
    const entry = {
      id: Date.now(),
      title: plan.title,
      location: locationLabel || 'Current location',
      budget: `$${budget}`,
      savedAt: new Date(),
      plan,
    };
    setSavedTrips(prev => [entry, ...prev]);
    setSaved(true);
    // Phase 13: also persist entry to Firestore here
  }

  function handleLoadSavedTrip(trip) {
    setPlan(trip.plan);
    setPlanStatus('success');
    setSaved(true);
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
            <input
              type="text"
              className={styles.cityInput}
              placeholder="Type a city, e.g. London"
              value={coords ? '' : locationLabel}
              onChange={handleManualLocation}
              disabled={!!coords}
            />
            {locError && <span className={styles.fieldError}>{locError}</span>}
          </div>

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
          {savedTrips.length === 0 ? (
            <div className={styles.savedEmpty}>
              <BookmarkIcon />
              <p>No saved trips yet.<br />Generate a plan and save it here.</p>
            </div>
          ) : (
            <ul className={styles.savedList}>
              {savedTrips.map(t => (
                <li key={t.id} className={styles.savedItem} onClick={() => handleLoadSavedTrip(t)}>
                  <span className={styles.savedItemTitle}>{t.title}</span>
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
                <h2 className={styles.planTitle}>{plan.title}</h2>
                <div className={styles.planMeta}>
                  <span><WeatherIcon /> {plan.weather}</span>
                  <span><CostIcon /> Est. {plan.totalCost} total</span>
                </div>
              </div>
              <button
                className={`${styles.saveBtn} ${saved ? styles.saveBtnDone : ''}`}
                onClick={handleSave}
                disabled={saved}
              >
                <BookmarkIcon /> {saved ? 'Saved!' : 'Save trip'}
              </button>
            </div>

            {/* Days */}
            {plan.days.map((day, di) => (
              <div key={di} className={styles.daySection}>
                <h3 className={styles.dayLabel}>{day.label}</h3>
                <div className={styles.timeline}>
                  {day.activities.map((act, ai) => (
                    <div key={ai} className={`${styles.activity} ${styles[`type_${act.type}`]}`}>
                      <div className={styles.activityLeft}>
                        <span className={styles.activityTime}>{act.time}</span>
                        <div className={styles.activityLine} />
                      </div>
                      <div className={styles.activityBody}>
                        <div className={styles.activityTop}>
                          <h4 className={styles.activityTitle}>{act.title}</h4>
                          <span className={styles.activityCost}>{act.cost}</span>
                        </div>
                        <p className={styles.activityDesc}>{act.desc}</p>
                        <span className={styles.activityTag}>{TYPE_LABELS[act.type] || act.type}</span>
                      </div>
                    </div>
                  ))}
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
function MapIcon() {
  return <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
}
function WeatherIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
}
function CostIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
}
