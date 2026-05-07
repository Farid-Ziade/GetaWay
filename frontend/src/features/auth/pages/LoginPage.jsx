import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  createPhoneRecaptcha,
  requestPhoneOtp,
  resetPassword,
  signInWithEmail,
  signInWithGoogle,
} from "../services/authService";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await signInWithEmail(email, password);
      navigate("/dashboard");
    } catch (error) {
      setMessage("Could not sign in with email/password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setMessage("");
    try {
      await signInWithGoogle();
      navigate("/dashboard");
    } catch (error) {
      setMessage("Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!email) {
      setMessage("Enter your email first.");
      return;
    }
    try {
      await resetPassword(email);
      setMessage("Password reset email sent.");
    } catch (error) {
      setMessage("Could not send password reset email.");
    }
  }

  async function handleRequestOtp(event) {
    event.preventDefault();
    if (!phone) {
      setMessage("Enter phone number in international format, e.g. +961...");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const verifier = createPhoneRecaptcha("recaptcha-container");
      const result = await requestPhoneOtp(phone, verifier);
      setConfirmationResult(result);
      setMessage("OTP sent. Enter the verification code.");
    } catch (error) {
      setMessage("Could not send OTP. Check phone format and Firebase setup.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
    if (!confirmationResult || !otp) return;
    setLoading(true);
    setMessage("");
    try {
      await confirmationResult.confirm(otp);
      navigate("/dashboard");
    } catch (error) {
      setMessage("Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-card">
      <h2>Welcome Back</h2>
      <p>Sign in to continue planning your weekend getaway.</p>

      <form onSubmit={handleEmailLogin} className="auth-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          Sign in with Email
        </button>
      </form>

      <div className="auth-row">
        <button type="button" onClick={handleGoogleLogin} disabled={loading}>
          Sign in with Google
        </button>
        <button type="button" onClick={handleResetPassword} disabled={loading}>
          Reset Password
        </button>
      </div>

      <form onSubmit={handleRequestOtp} className="auth-form">
        <input
          type="tel"
          placeholder="Phone (+country code)"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
        <button type="submit" disabled={loading}>
          Send OTP
        </button>
      </form>

      {confirmationResult && (
        <form onSubmit={handleVerifyOtp} className="auth-form">
          <input
            type="text"
            placeholder="OTP Code"
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
          />
          <button type="submit" disabled={loading}>
            Verify OTP
          </button>
        </form>
      )}

      <div id="recaptcha-container" />
      {message && <p className="auth-message">{message}</p>}

      <p>
        New user? <Link to="/signup">Create an account</Link>
      </p>
    </section>
  );
}

export default LoginPage;
