import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { applyActionCode, confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../services/firebase';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/Button';
import s from '../styles/auth.module.css';

const REDIRECT_SECONDS = 4;

// ─── Email verification ───────────────────────────────────────────────────────

function VerifyEmailHandler({ oobCode }) {
  const navigate  = useNavigate();
  const [status,    setStatus]    = useState('loading');
  const [error,     setError]     = useState('');
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    applyActionCode(auth, oobCode)
      .then(() => setStatus('success'))
      .catch((err) => {
        if (err.code === 'auth/invalid-action-code') {
          // Firebase already processed this code server-side before redirecting
          // to our custom action URL — the email IS verified.
          setStatus('success');
        } else if (err.code === 'auth/expired-action-code') {
          setError('This verification link has expired. Request a new one from the login page.');
          setStatus('error');
        } else if (err.code === 'auth/user-disabled') {
          setError('This account has been disabled. Please contact support.');
          setStatus('error');
        } else {
          setError('Something went wrong. Please try again.');
          setStatus('error');
        }
      });
  }, [oobCode]);

  useEffect(() => {
    if (status !== 'success') return;
    if (countdown <= 0) { navigate('/login'); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown, navigate]);

  return (
    <div className={s.verifyBox}>
      {status === 'loading' && (
        <>
          <div className={s.verifyIcon}>⏳</div>
          <h1 className={s.title}>Verifying your email…</h1>
          <p className={s.subtitle}>Just a moment.</p>
        </>
      )}
      {status === 'success' && (
        <>
          <div className={s.verifyIcon}>✅</div>
          <h1 className={s.title}>Email verified!</h1>
          <p className={s.subtitle}>
            Your account is now active.<br />
            Redirecting to login in {countdown}…
          </p>
          <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/login')}>
            Go to login now
          </Button>
        </>
      )}
      {status === 'error' && (
        <>
          <div className={s.verifyIcon}>❌</div>
          <h1 className={s.title}>Verification failed</h1>
          <p className={s.subtitle}>{error}</p>
          <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/login')}>
            Back to login
          </Button>
        </>
      )}
    </div>
  );
}

// ─── Password reset ───────────────────────────────────────────────────────────

const REQUIREMENTS = [
  { label: '8+ characters',     test: pw => pw.length >= 8 },
  { label: 'Uppercase letter',  test: pw => /[A-Z]/.test(pw) },
  { label: 'Number',            test: pw => /[0-9]/.test(pw) },
  { label: 'Special character', test: pw => /[^A-Za-z0-9]/.test(pw) },
];

function getStrength(pw) {
  if (!pw) return null;
  const met = REQUIREMENTS.filter(r => r.test(pw)).length;
  if (met <= 1) return { level: 1, label: 'Weak',   cls: s.strengthWeak };
  if (met === 2) return { level: 2, label: 'Fair',   cls: s.strengthFair };
  if (met === 3) return { level: 3, label: 'Good',   cls: s.strengthGood };
  return              { level: 4, label: 'Strong', cls: s.strengthStrong };
}

function ResetPasswordHandler({ oobCode }) {
  const navigate = useNavigate();
  const [codeValid, setCodeValid] = useState(null); // null=checking, true, false
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [showCf,    setShowCf]    = useState(false);
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  const strength = getStrength(password);

  useEffect(() => {
    verifyPasswordResetCode(auth, oobCode)
      .then(() => setCodeValid(true))
      .catch(() => setCodeValid(false));
  }, [oobCode]);

  useEffect(() => {
    if (!done) return;
    if (countdown <= 0) { navigate('/login'); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [done, countdown, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setDone(true);
    } catch (err) {
      if (err.code === 'auth/expired-action-code' || err.code === 'auth/invalid-action-code') {
        setError('This reset link has expired or already been used. Request a new one from the login page.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (codeValid === null) {
    return (
      <div className={s.verifyBox}>
        <div className={s.verifyIcon}>⏳</div>
        <h1 className={s.title}>Checking your link…</h1>
      </div>
    );
  }

  if (codeValid === false) {
    return (
      <div className={s.verifyBox}>
        <div className={s.verifyIcon}>❌</div>
        <h1 className={s.title}>Link expired</h1>
        <p className={s.subtitle}>This password reset link has expired or already been used.</p>
        <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/login')}>
          Back to login
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className={s.verifyBox}>
        <div className={s.verifyIcon}>✅</div>
        <h1 className={s.title}>Password updated!</h1>
        <p className={s.subtitle}>
          You can now log in with your new password.<br />
          Redirecting in {countdown}…
        </p>
        <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/login')}>
          Go to login now
        </Button>
      </div>
    );
  }

  return (
    <div className={s.verifyBox}>
      <h1 className={s.title}>Set a new password</h1>
      <p className={s.subtitle}>Choose a strong password for your account.</p>

      {error && <div className={`${s.alert} ${s.alertError}`}>{error}</div>}

      <form className={s.form} onSubmit={handleSubmit} noValidate>
        <div className={s.field}>
          <label className={s.label} htmlFor="pw">New password</label>
          <div className={s.inputWrap}>
            <input
              id="pw"
              type={showPw ? 'text' : 'password'}
              className={`${s.input} ${s.inputWithToggle}`}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
            <button type="button" className={s.toggleBtn} onClick={() => setShowPw(v => !v)}
              aria-label={showPw ? 'Hide password' : 'Show password'}>
              {showPw ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {password && strength && (
            <div className={s.strengthBlock}>
              <div className={s.strengthRow}>
                <div className={`${s.strengthBar} ${s[`level${strength.level}`]}`}>
                  <div className={s.strengthSegment} />
                  <div className={s.strengthSegment} />
                  <div className={s.strengthSegment} />
                  <div className={s.strengthSegment} />
                </div>
                <span className={`${s.strengthLabel} ${strength.cls}`}>{strength.label}</span>
              </div>
              <ul className={s.reqList}>
                {REQUIREMENTS.map(r => {
                  const met = r.test(password);
                  return (
                    <li key={r.label} className={`${s.reqItem} ${met ? s.reqMet : ''}`}>
                      <span className={s.reqIcon}>{met ? '✓' : '○'}</span>
                      {r.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className={s.field}>
          <label className={s.label} htmlFor="cf">Confirm password</label>
          <div className={s.inputWrap}>
            <input
              id="cf"
              type={showCf ? 'text' : 'password'}
              className={`${s.input} ${s.inputWithToggle}`}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <button type="button" className={s.toggleBtn} onClick={() => setShowCf(v => !v)}
              aria-label={showCf ? 'Hide password' : 'Show password'}>
              {showCf ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
          Update password
        </Button>
      </form>
    </div>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────

export default function AuthActionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const mode    = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  if (!oobCode) {
    return (
      <AuthLayout>
        <div className={s.verifyBox}>
          <div className={s.verifyIcon}>❌</div>
          <h1 className={s.title}>Invalid link</h1>
          <p className={s.subtitle}>This link is missing required parameters.</p>
          <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/login')}>
            Back to login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      {mode === 'verifyEmail'    && <VerifyEmailHandler    oobCode={oobCode} />}
      {mode === 'resetPassword'  && <ResetPasswordHandler  oobCode={oobCode} />}
      {mode !== 'verifyEmail' && mode !== 'resetPassword' && (
        <div className={s.verifyBox}>
          <div className={s.verifyIcon}>❌</div>
          <h1 className={s.title}>Unsupported link</h1>
          <p className={s.subtitle}>This type of link is not supported.</p>
          <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/login')}>
            Back to login
          </Button>
        </div>
      )}
    </AuthLayout>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
