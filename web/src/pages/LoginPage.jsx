import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/Button';
import { login, loginWithGoogle, resetPassword } from '../services/authService';
import s from '../styles/auth.module.css';

function friendlyError(code) {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Incorrect email or password.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Try again later or reset your password.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return null;
    default:
      return 'Something went wrong. Please try again.';
  }
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPw, setShowPw]           = useState(false);
  const [loading, setLoading]         = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]             = useState('');
  const [resetSent, setResetSent]     = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResetSent(false);
    setLoading(true);
    try {
      await login(email.trim(), password);
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
    setResetSent(false);
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

  async function handleForgotPassword() {
    if (!email.trim()) {
      setError('Enter your email above, then click Forgot password.');
      return;
    }
    setError('');
    try {
      await resetPassword(email.trim());
      setResetSent(true);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Could not send reset email. Please try again.');
      }
    }
  }

  return (
    <AuthLayout>
      <h1 className={s.title}>Welcome back</h1>
      <p className={s.subtitle}>Log in to your GetaWay account</p>

      {error     && <div className={`${s.alert} ${s.alertError}`}>{error}</div>}
      {resetSent && <div className={`${s.alert} ${s.alertSuccess}`}>Reset link sent — check your inbox.</div>}

      <form className={s.form} onSubmit={handleSubmit} noValidate>
        <div className={s.field}>
          <label className={s.label} htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className={s.input}
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div className={s.field}>
          <label className={s.label} htmlFor="password">Password</label>
          <div className={s.inputWrap}>
            <input
              id="password"
              type={showPw ? 'text' : 'password'}
              className={`${s.input} ${s.inputWithToggle}`}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
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
          <button type="button" className={s.forgotBtn} onClick={handleForgotPassword}>
            Forgot password?
          </button>
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
          Log In
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
        Don&apos;t have an account? <Link to="/signup">Sign up free</Link>
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
