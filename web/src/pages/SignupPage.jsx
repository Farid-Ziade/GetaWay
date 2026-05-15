import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/Button';
import { signUp, loginWithGoogle } from '../services/authService';
import s from '../styles/auth.module.css';

function friendlyError(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return null;
    default:
      return 'Something went wrong. Please try again.';
  }
}

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

export default function SignupPage() {
  const navigate = useNavigate();

  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [showCf, setShowCf]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]         = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const strength = getStrength(password);

  function validate() {
    const errs = {};
    if (!name.trim())            errs.name     = 'Name is required.';
    if (!email.trim())           errs.email    = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address.';
    if (!password)               errs.password = 'Password is required.';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (!confirm)                errs.confirm  = 'Please confirm your password.';
    else if (confirm !== password) errs.confirm = 'Passwords do not match.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await signUp(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      const msg = friendlyError(err.code);
      if (msg) setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setFieldErrors({});
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      const msg = friendlyError(err.code);
      if (msg) setError(msg);
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className={s.title}>Create your account</h1>
      <p className={s.subtitle}>Start planning better weekends — it&apos;s free</p>

      {error && <div className={`${s.alert} ${s.alertError}`}>{error}</div>}

      <form className={s.form} onSubmit={handleSubmit} noValidate>
        <div className={s.field}>
          <label className={s.label} htmlFor="name">Full name</label>
          <input
            id="name"
            type="text"
            className={`${s.input} ${fieldErrors.name ? s.inputError : ''}`}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Alex Johnson"
            autoComplete="name"
          />
          {fieldErrors.name && <span className={s.fieldError}>{fieldErrors.name}</span>}
        </div>

        <div className={s.field}>
          <label className={s.label} htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className={`${s.input} ${fieldErrors.email ? s.inputError : ''}`}
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
          {fieldErrors.email && <span className={s.fieldError}>{fieldErrors.email}</span>}
        </div>

        <div className={s.field}>
          <label className={s.label} htmlFor="password">Password</label>
          <div className={s.inputWrap}>
            <input
              id="password"
              type={showPw ? 'text' : 'password'}
              className={`${s.input} ${s.inputWithToggle} ${fieldErrors.password ? s.inputError : ''}`}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
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
          {fieldErrors.password && <span className={s.fieldError}>{fieldErrors.password}</span>}
        </div>

        <div className={s.field}>
          <label className={s.label} htmlFor="confirm">Confirm password</label>
          <div className={s.inputWrap}>
            <input
              id="confirm"
              type={showCf ? 'text' : 'password'}
              className={`${s.input} ${s.inputWithToggle} ${fieldErrors.confirm ? s.inputError : ''}`}
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
          {fieldErrors.confirm && <span className={s.fieldError}>{fieldErrors.confirm}</span>}
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
          Create Account
        </Button>
      </form>

      <div className={s.divider}>or</div>

      <button
        type="button"
        className={s.googleBtn}
        onClick={handleGoogle}
        disabled={googleLoading || loading}
      >
        <GoogleIcon />
        {googleLoading ? 'Signing in…' : 'Continue with Google'}
      </button>

      <p className={s.footer}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
