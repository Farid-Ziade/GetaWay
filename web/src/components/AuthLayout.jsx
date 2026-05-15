import { Link } from 'react-router-dom';
import styles from './AuthLayout.module.css';

export default function AuthLayout({ children }) {
  return (
    <div className={styles.root}>
      <div className={styles.panel}>
        <div className={styles.overlay} />

        {/* Logo — top left */}
        <Link to="/" className={styles.logo}>
          <img src="/assets/images/GetaWay_Logo.png" alt="GetaWay" width={40} />
          <span>GetaWay</span>
        </Link>

        {/* Tagline — bottom left */}
        <div className={styles.panelBottom}>
          <h2 className={styles.panelHeadline}>Plan your perfect weekend.</h2>
          <p className={styles.tagline}>
            Tell us your budget and location — we'll build a full 2-day
            itinerary in seconds.
          </p>
        </div>
      </div>

      <div className={styles.formPanel}>
        <div className={styles.formWrap}>
          {children}
        </div>
      </div>
    </div>
  );
}
