import { Link } from 'react-router-dom';
import styles from './AuthLayout.module.css';

export default function AuthLayout({ children }) {
  return (
    <div className={styles.root}>
      <div className={styles.panel}>
        <div className={styles.overlay} />
        <div className={styles.panelContent}>
          <Link to="/" className={styles.logo}>
            <img src="/assets/images/GetaWay_Logo.png" alt="GetaWay" width={44} />
            <span>GetaWay</span>
          </Link>
          <p className={styles.tagline}>
            Your AI-powered weekend planner. Pick a budget, share your location,
            and get a full 2-day itinerary in seconds.
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
