import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./AuthLayout.module.css";

const PHRASES = [
  "Plan your perfect weekend.",
  "Plan your perfect escape.",
  "Discover hidden adventures.",
  "Find your next GetaWay.",
  "Create unforgettable memories.",
];

function useTypewriter(phrases) {
  const [displayed, setDisplayed] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIdx];

    if (!isDeleting) {
      if (displayed.length < current.length) {
        const t = setTimeout(
          () => setDisplayed(current.slice(0, displayed.length + 1)),
          65,
        );
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setIsDeleting(true), 2200);
        return () => clearTimeout(t);
      }
    } else {
      if (displayed.length > 0) {
        const t = setTimeout(
          () => setDisplayed(current.slice(0, displayed.length - 1)),
          32,
        );
        return () => clearTimeout(t);
      } else {
        setIsDeleting(false);
        setPhraseIdx((i) => (i + 1) % phrases.length);
      }
    }
  }, [displayed, isDeleting, phraseIdx, phrases]);

  return displayed;
}

export default function AuthLayout({ children }) {
  const text = useTypewriter(PHRASES);

  return (
    <div className={styles.root}>
      <div className={styles.panel}>
        <div className={styles.overlay} />

        <Link to="/" className={styles.logo}>
          <img src="/assets/images/GetaWay_Logo.png" alt="GetaWay" width={40} />
          <span>GetaWay</span>
        </Link>

        <div className={styles.panelBottom}>
          <h2 className={styles.panelHeadline}>
            {text}
            <span className={styles.cursor}>|</span>
          </h2>
        </div>
      </div>

      <div className={styles.formPanel}>
        <div className={styles.formWrap}>{children}</div>
      </div>
    </div>
  );
}
