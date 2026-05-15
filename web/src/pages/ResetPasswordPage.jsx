import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/Button';
import { verifyResetCode, applyPasswordReset } from '../services/authService';
import s from '../styles/auth.module.css';

function getStrength(pw) {
  if (!pw) return null;
  if (pw.length < 8) return { level: 1, label: 'Weak', cls: s.strengthWeak };
  let bonus = 0;
  if (/[A-Z]/.test(pw)) bonus++;
  if (/[0-9]/.test(pw)) bonus++;
  if (/[^A-Za-z0-9]/.test(pw)) bonus++;
  if (bonus === 0) return { level: 2, label: 'Fair',   cls: s.strengthFair };
  if (bonus === 1) return { level: 3, label: 'Good',   cls: s.strengthGood };
  return              { level: 4, label: 'Strong', cls: s.strengthStrong };
}

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const oobCode = params.get('oobCode');
  const mode    = params.get('mode');

  const [verifying, setVerifying] = useState(true);
  const [codeValid, setCodeValid] = useState(false);
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [showCf, setShowCf]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState('');
  const [fieldError, setFieldError] = useState('');

  const strength = getStrength(password);

  useEffect(() => {
    if (!oobCode || mode !== 'resetPassword') {
      setError('This link is invalid or has expired.');
      setVerifying(false);
      return;
    }
    verifyResetCode(oobCode)
      .then(() => { setCodeValid(true); setVerifying(false); })
      .catch(() => {
        setError('This link has expired or has already been used. Request a new one from the login page.');
        setVerifying(false);
      });
  }, [oobCode, mode]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setFieldError('');

    if (password.length < 8) {
      setFieldError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setFieldError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await applyPasswordReset(oobCode, password);
      setDone(true);
    } catch (err) {
      if (err.code === 'auth/expired-action-code') {
        setError('This link has expired. Request a new one from the login page.');
      } else if (err.code === 'auth/weak-password') {
        setFieldError('Password must be at least 8 characters.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (verifying) {
    return (
      <AuthLayout>
        <p className={s.subtitle}>Verifying your link…</p>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout>
        <div className={`${s.alert} ${s.alertSuccess}`}>
          Your password has been updated successfully.
        </div>
        <p className={s.footer} style={{ marginTop: 'var(--space-6)' }}>
          <Link to="/login">Log in with your new password →</Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h1 className={s.title}>Set new password</h1>
      <p className={s.subtitle}>Choose a strong password for your GetaWay account</p>

      {error && (
        <>
          <div className={`${s.alert} ${s.alertError}`}>{error}</div>
          <p className={s.footer}>
            <Link to="/login">← Back to login</Link>
          </p>
        </>
      )}

      {codeValid && (
        <form className={s.form} onSubmit={handleSubmit} noValidate>
          <div className={s.field}>
            <label className={s.label} htmlFor="pw">New password</label>
            <div className={s.inputWrap}>
              <input
                id="pw"
                type={showPw ? 'text' : 'password'}
                className={`${s.input} ${s.inputWithToggle} ${fieldError ? s.inputError : ''}`}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                autoFocus
              />
              <button
                type="button"
                className={s.toggleBtn}
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {password && strength && (
              <>
                <div className={`${s.strengthBar} ${s[`level${strength.level}`]}`}>
                  <div className={s.strengthSegment} />
                  <div className={s.strengthSegment} />
                  <div className={s.strengthSegment} />
                  <div className={s.strengthSegment} />
                </div>
                <span className={`${s.strengthLabel} ${strength.cls}`}>{strength.label}</span>
              </>
            )}
          </div>

          <div className={s.field}>
            <label className={s.label} htmlFor="cf">Confirm new password</label>
            <div className={s.inputWrap}>
              <input
                id="cf"
                type={showCf ? 'text' : 'password'}
                className={`${s.input} ${s.inputWithToggle} ${fieldError ? s.inputError : ''}`}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                className={s.toggleBtn}
                onClick={() => setShowCf(v => !v)}
                aria-label={showCf ? 'Hide password' : 'Show password'}
              >
                {showCf ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {fieldError && <span className={s.fieldError}>{fieldError}</span>}
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
            Update Password
          </Button>

          <p className={s.footer}>
            <Link to="/login">← Back to login</Link>
          </p>
        </form>
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
