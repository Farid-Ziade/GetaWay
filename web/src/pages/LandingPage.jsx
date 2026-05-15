import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import styles from './LandingPage.module.css';

const TAGLINES = [
  'Crafting your perfect escape...',
  'Unlocking weekend wonders...',
  'Planning your ideal getaway...',
  'Discovering nearby adventures...',
  'Curating your dream weekend...',
];

const FEATURES = [
  {
    icon: '🤖',
    title: 'AI-Powered Planning',
    desc: 'Tell us your budget and location. Our AI builds a full 2-day itinerary — activities, timings, and estimated costs included.',
  },
  {
    icon: '🌤️',
    title: 'Weather-Smart Suggestions',
    desc: 'No more rain on your parade. Every plan is checked against the forecast so you always get weather-appropriate activities.',
  },
  {
    icon: '💰',
    title: 'Budget-Aware',
    desc: 'Set your budget once. Every recommendation — from dining to day trips — is tailored to stay within what you can afford.',
  },
  {
    icon: '📍',
    title: 'Local & Nearby',
    desc: "Discover hidden gems around you. We surface the best spots within reach so your weekend doesn't start with a long drive.",
  },
  {
    icon: '✈️',
    title: 'Always Fresh',
    desc: "GetaWay remembers every trip you've saved. You'll never get the same recommendation twice.",
  },
  {
    icon: '💾',
    title: 'Save & Revisit',
    desc: 'Love a plan? Save it to your collection. Your trips are stored securely and accessible anytime.',
  },
];

export default function LandingPage() {
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setTaglineIndex(i => (i + 1) % TAGLINES.length);
        setFade(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.page}>
      <Navbar transparent />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <img
            src="/assets/images/GetaWay_Logo.png"
            alt="GetaWay"
            className={styles.heroLogo}
          />
          <h1 className={styles.heroTitle}>GetaWay</h1>
          <p className={`${styles.heroTagline} ${fade ? styles.fadeIn : styles.fadeOut}`}>
            {TAGLINES[taglineIndex]}
          </p>
          <p className={styles.heroSub}>
            Your AI-powered weekend planner. Pick a budget, share your location,
            and get a full 2-day itinerary in seconds.
          </p>
          <div className={styles.heroCtas}>
            <Button to="/signup" variant="white" size="lg">
              Start Planning Free
            </Button>
            <Button to="/login" variant="ghost" size="lg">
              Log In
            </Button>
          </div>
        </div>
        <div className={styles.scrollHint}><span /></div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className={styles.howSection}>
        <div className={styles.container}>
          <span className={styles.badge}>How It Works</span>
          <h2 className={styles.sectionTitle}>Your perfect weekend in 3 steps</h2>
          <div className={styles.steps}>
            {[
              { n: '01', title: 'Share your location', desc: "Allow location access so we know what's nearby. We never store your exact position." },
              { n: '02', title: 'Set your budget',     desc: 'Tell us how much you want to spend. Plans are automatically adjusted to fit.' },
              { n: '03', title: 'Get your plan',       desc: 'Hit Generate. Our AI returns a full weather-aware 2-day itinerary instantly.' },
            ].map(s => (
              <div key={s.n} className={styles.step}>
                <span className={styles.stepNum}>{s.n}</span>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <span className={styles.badge}>Features</span>
          <h2 className={styles.sectionTitle}>Everything you need for the perfect escape</h2>
          <div className={styles.featuresGrid}>
            {FEATURES.map(f => (
              <div key={f.title} className={styles.featureCard}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>Ready for your next adventure?</h2>
          <p className={styles.ctaSub}>Join GetaWay and start planning better weekends today.</p>
          <Button to="/signup" variant="white" size="lg">
            Get Started — It's Free
          </Button>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerLogo}>
            <img src="/assets/images/GetaWay_Logo.png" alt="GetaWay" width={28} />
            <span>GetaWay</span>
          </div>
          <p className={styles.footerCopy}>© 2026 GetaWay. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
