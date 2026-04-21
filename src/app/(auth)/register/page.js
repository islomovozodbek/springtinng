"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "../auth.module.css";
import PageShapes from "@/components/PageShapes";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const { user, loading: authLoading, register, loginWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Check if Supabase redirected back with an error in the hash
    if (typeof window !== "undefined" && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hashError = hashParams.get("error_description") || hashParams.get("error");
      if (hashError) {
        setError(decodeURIComponent(hashError));
      }
    }
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      setError("Failed to sign in with Google.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Username can only contain letters, numbers, and underscores");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await register({ username: username.toLowerCase(), email, password });
      router.push("/dashboard");
    } catch (err) {
      if (err.message === "CONFIRMATION_REQUIRED") {
        setConfirmationSent(true);
      } else if (err.message?.includes("already registered")) {
        setError("An account with this email already exists");
      } else if (err.message?.includes("duplicate key") && err.message?.includes("username")) {
        setError("This username is already taken");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    }
    setLoading(false);
  };

  return (
    <div className={styles.authPage}>
      <PageShapes page="register" />

      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1>Create your account</h1>
          <p>Join the community and start writing</p>
        </div>

        <button className={styles.googleBtn} type="button" onClick={handleGoogleLogin}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <div className={styles.authDivider}>or</div>

        {confirmationSent ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📬</div>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", marginBottom: "12px", color: "var(--text-primary)" }}>Check your email</h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
              We've sent a confirmation link to <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{email}</span>.<br/>
              Please click the link to activate your account before logging in.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="btn btn-primary"
              style={{ marginTop: "24px", width: "100%" }}
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form className={styles.authForm} onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className={`input ${error && error.includes("Username") ? "input-error" : ""}`}
              placeholder="coolwriter42"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
            <span className="input-hint">This will be your unique handle</span>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">
              Password
            </label>
            <div className={styles.passwordToggle}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className={styles.passwordToggleBtn}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        )}

        <div className={styles.authFooter}>
          Already have an account? <Link href="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
