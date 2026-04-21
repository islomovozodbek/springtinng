"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import styles from "../(auth)/auth.module.css";
import PageShapes from "@/components/PageShapes";

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user && !user.needsOnboarding) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

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

    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          username: username.toLowerCase(),
          display_name: username,
          bio: null // This removes the PENDING_ONBOARDING flag!
        })
        .eq("id", user.uid);

      if (updateError) {
        if (updateError.code === "23505") { // Unique violation Postgres Error Code
          throw new Error("This username is already taken");
        }
        throw updateError;
      }

      // Hard navigation to force the AuthContext to re-fetch and clear needsOnboarding
      window.location.href = "/dashboard";
      
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className={styles.authPage}>
      <PageShapes page="register" />

      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1>Setup your profile</h1>
          <p>Welcome! Please pick a unique username</p>
        </div>

        <form className={styles.authForm} onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className={`input ${error ? "input-error" : ""}`}
              placeholder="coolwriter42"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              required
            />
            <span className="input-hint">This will be your identity on leaderboards</span>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Saving..." : "Start Sprinting"}
          </button>
        </form>
      </div>
    </div>
  );
}
