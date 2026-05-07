import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { signUpWithEmail } from "../services/authService";

function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(event) {
    event.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(email, password);
      navigate("/dashboard");
    } catch (error) {
      setMessage("Could not create account. Check your email format and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-card">
      <h2>Create Account</h2>
      <p>Start building smart weekend trip plans with GetaWay.</p>

      <form onSubmit={handleSignup} className="auth-form">
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
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          Sign up
        </button>
      </form>

      {message && <p className="auth-message">{message}</p>}
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </section>
  );
}

export default SignupPage;
