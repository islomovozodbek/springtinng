"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "../auth.module.css";
import PageShapes from "@/components/PageShapes";

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading, login, loginWithGoogle } = useAuth();
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

    if (!emailOrUsername) {
      setError("Please enter your email or username");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      await login(emailOrUsername, password);
      router.push("/dashboard");
    } catch (err) {
      if (err.message?.includes("Invalid login")) {
        setError("Invalid email or password");
      } else if (err.message?.includes("Email not confirmed")) {
        setError("Please confirm your email before logging in");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    }
    setLoading(false);
  };

  return (
    <div className={styles.authPage}>
      <PageShapes page="login" />

      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1>Welcome back</h1>
          <p>Log in and continue your streak</p>
        </div>

        <button className={styles.googleBtn} type="button" onClick={handleGoogleLogin}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <div className={styles.authDivider}>or</div>

        <form className={styles.authForm} onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="emailOrUsername">
              Email or Username
            </label>
            <input
              id="emailOrUsername"
              type="text"
              className="input"
              placeholder="you@example.com or username"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              autoComplete="username"
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
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
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
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className={styles.authFooter}>
          Don&apos;t have an account? <Link href="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
