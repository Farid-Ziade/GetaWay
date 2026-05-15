import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import styles from './Navbar.module.css';

export default function Navbar({ transparent = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!transparent) return;
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [transparent]);

  // Close mobile menu on route change
  useEffect(() => setMenuOpen(false), [location]);

  const navClass = [
    styles.navbar,
    transparent && !scrolled && !menuOpen ? styles.transparent : styles.solid,
    menuOpen && styles.menuOpen,
  ].filter(Boolean).join(' ');

  return (
    <nav className={navClass}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <img src="/assets/images/GetaWay_Logo.png" alt="GetaWay" className={styles.logoImg} />
          <span className={styles.logoText}>GetaWay</span>
        </Link>

        {/* Desktop actions */}
        <div className={styles.actions}>
          {user ? (
            <Button to="/dashboard" variant="primary" size="sm">Dashboard</Button>
          ) : (
            <>
              <Button to="/login" variant={transparent && !scrolled ? 'ghost' : 'secondary'} size="sm">
                Log In
              </Button>
              <Button to="/signup" variant={transparent && !scrolled ? 'white' : 'primary'} size="sm">
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {user ? (
            <Button to="/dashboard" variant="primary" fullWidth>Dashboard</Button>
          ) : (
            <>
              <Button to="/login"  variant="secondary" fullWidth>Log In</Button>
              <Button to="/signup" variant="primary"   fullWidth>Get Started</Button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
