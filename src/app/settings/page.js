"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PageShapes from "@/components/PageShapes";

export default function SettingsPage() {
  const { user, loading, login, logout } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (user) {
      setUsername(user.username || "");
      setDisplayName(user.displayName || "");
      setBio(user.bio || "");
    }
  }, [user, loading, router]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      const { supabase } = await import("@/lib/supabase");
      const { error } = await supabase
        .from("profiles")
        .update({
          username,
          display_name: displayName,
          bio,
        })
        .eq("id", user.uid);
        
      if (error) throw error;
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      
      // In a real app we'd trigger a reload of context here, 
      // but a page refresh works for now to see changes.
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to save profile: " + err.message);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (loading || !user) {
    return (
      <div style={{ padding: "var(--space-4xl) 0", textAlign: "center" }}>
        <div className="spinner spinner-lg mx-auto" />
      </div>
    );
  }

  return (
    <div style={{ padding: "var(--space-2xl) 0", minHeight: "calc(100vh - var(--nav-height))", position: "relative", overflow: "hidden" }}>
      <PageShapes page="settings" />
      <div className="container" style={{ maxWidth: "600px", position: "relative", zIndex: 1 }}>
        <h1 style={{ marginBottom: "var(--space-2xl)" }}>Settings</h1>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
          {/* Profile Section */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <h3>Profile</h3>

            <div className="input-group">
              <label className="input-label" htmlFor="displayName">Display Name</label>
              <input
                id="displayName"
                type="text"
                className="input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <span className="input-hint">
                Can be changed {user.tier === "pro" ? "every week" : "every 3 weeks"}
              </span>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                className="input"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the world about yourself..."
                rows={3}
              />
            </div>
          </div>

          {/* Account Section */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <h3>Account</h3>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>Email</strong>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{user.email}</p>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>Plan</strong>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  {user.tier === "pro" ? "Pro" : "Free"}
                </p>
              </div>
              {user.tier !== "pro" && (
                <a href="/pricing" className="btn btn-primary btn-sm">Upgrade</a>
              )}
            </div>
          </div>

          {/* Save Button */}
          <button type="submit" className="btn btn-primary w-full">
            {saved ? "Saved ✓" : "Save Changes"}
          </button>
        </form>

        {/* Danger Zone */}
        <div style={{ marginTop: "var(--space-2xl)", paddingTop: "var(--space-xl)", borderTop: "1px solid var(--border)" }}>
          <h3 style={{ color: "var(--danger)", marginBottom: "var(--space-md)" }}>Danger Zone</h3>
          <button className="btn btn-danger" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
