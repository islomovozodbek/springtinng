"use client";

import { useState, useEffect } from "react";
import styles from "./dashboard.module.css";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { getRankTitle } from "@/lib/ranks";
import ScrollReveal from "@/components/ScrollReveal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CONFIG } from "@/lib/config";
import PageShapes from "@/components/PageShapes";
import { getTodayUTC } from "@/data/dailyPrompts";


// ── Story categories (exclude "all" from the edit dropdown) ────────────────


export default function DashboardPage() {
  const { user, loading: authLoading, updateLocalUser, logout } = useAuth();
  const router = useRouter();
  const [myStories, setMyStories] = useState([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [activeTab, setActiveTab] = useState("library");
  const [proEnabled, setProEnabled] = useState(false);
  const [syncingOffline, setSyncingOffline] = useState(false);
  const [offlineSprints, setOfflineSprints] = useState([]);

  // ── Settings state ────────────────────────────────────────────────────
  const [savingColor, setSavingColor] = useState(false);

  // ── Delete Account dialog state ────────────────────────────────────────
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // ── Delete dialog state ────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null); // story object
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Edit modal state ───────────────────────────────────────────────────
  const [editTarget, setEditTarget] = useState(null); // story object
  const [editTitle, setEditTitle] = useState("");

  const [editIsHidden, setEditIsHidden] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ── Toast ──────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user?.needsOnboarding) {
      router.push("/onboarding");
      return;
    }
    if (user) {
      setProEnabled(user.tier === "pro");
      setProEnabled(user.tier === "pro");
      fetchStories();
      checkOfflineSprints();
    }
  }, [user, authLoading, router]);

  const checkOfflineSprints = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("offline_sprints") || "[]");
      if (stored.length > 0) setOfflineSprints(stored);
    } catch (e) {}
  };

  const syncOfflineSprints = async () => {
    if (!user || offlineSprints.length === 0 || syncingOffline) return;
    setSyncingOffline(true);
    let successCount = 0;

    for (let sprint of offlineSprints) {
      try {
        const wordCount = sprint.word_count;
        const auraGained = Math.floor(wordCount / 5);

        const { error: storyError } = await supabase.from("stories").insert({
          author_id: user.uid,
          author_username: user.username,
          is_pro_user: user.tier === "pro",
          title: sprint.title,
          content: sprint.content,
          starter_sentence: sprint.starter_sentence,
          word_count: wordCount,

          time_mode: sprint.time_mode,
          net_score: 0,
          upvoters: [],
          downvoters: [],
          is_hidden: false,
          chain_part: 1,
          created_at: new Date(sprint.timestamp).toISOString(),
        });

        if (storyError) throw storyError;

        await supabase
          .from("profiles")
          .update({
            total_words: (user.totalWords || 0) + wordCount,
            aura: (user.aura || 0) + auraGained,
            sprints_today: (user.sprintsToday || 0) + 1,
            total_stories: (user.totalStories || 0) + 1,
          })
          .eq("id", user.uid);

        successCount++;
      } catch (err) {
        console.error("Failed to sync sprint:", err);
      }
    }

    if (successCount === offlineSprints.length) {
      localStorage.removeItem("offline_sprints");
      setOfflineSprints([]);
    } else if (successCount > 0) {
      const remaining = offlineSprints.slice(successCount);
      localStorage.setItem("offline_sprints", JSON.stringify(remaining));
      setOfflineSprints(remaining);
    }

    setSyncingOffline(false);
    if (successCount > 0) fetchStories();
  };

  const fetchStories = async () => {
    if (!user) return;
    setLoadingStories(true);
    try {
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("author_id", user.uid)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setMyStories(
        (data || []).map((row) => ({
          id: row.id,
          title: row.title,
          content: row.content,
          wordCount: row.word_count,

          createdAt: row.created_at,
          isHidden: row.is_hidden,
          netScore: row.net_score,
        }))
      );
    } catch (err) {
      console.error("Error fetching stories:", err);
    }
    setLoadingStories(false);
  };

  // ── Delete handlers ────────────────────────────────────────────────────
  const openDeleteDialog = (story) => setDeleteTarget(story);
  const closeDeleteDialog = () => { if (!isDeleting) setDeleteTarget(null); };

  const confirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("stories")
        .delete()
        .eq("id", deleteTarget.id);
      if (error) throw error;

      // Decrement total_stories on the profile
      const newTotal = Math.max(0, (user.totalStories || 0) - 1);
      await supabase
        .from("profiles")
        .update({ total_stories: newTotal })
        .eq("id", user.uid);

      // Update local state
      updateLocalUser({ totalStories: newTotal });
      setMyStories((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
      setToast({ message: "Sprint deleted.", type: "success" });
    } catch (err) {
      console.error("Delete failed:", err);
      setToast({ message: err?.message || "Delete failed. Please try again.", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Edit handlers ──────────────────────────────────────────────────────
  const openEditModal = (story) => {
    setEditTarget(story);
    setEditTitle(story.title || "");

    setEditIsHidden(story.isHidden || false);
  };
  const closeEditModal = () => { if (!isSaving) setEditTarget(null); };

  const confirmEdit = async () => {
    if (!editTarget || isSaving) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("stories")
        .update({
          title: editTitle.trim() || "Untitled Sprint",

          is_hidden: editIsHidden,
        })
        .eq("id", editTarget.id);
      if (error) throw error;

      // Update the local stories list in-place
      setMyStories((prev) =>
        prev.map((s) =>
          s.id === editTarget.id
            ? { ...s, title: editTitle.trim() || "Untitled Sprint", isHidden: editIsHidden }
            : s
        )
      );
      setEditTarget(null);
      setToast({ message: "Changes saved.", type: "success" });
    } catch (err) {
      console.error("Edit failed:", err);
      setToast({ message: err?.message || "Save failed. Please try again.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePro = () => setProEnabled(!proEnabled);

  // ── Settings handlers ──────────────────────────────────────────────────
  const saveProfileColor = async (color) => {
    if (savingColor) return;
    setSavingColor(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ profile_color: color })
        .eq("id", user.uid);
      if (error) throw error;
      updateLocalUser({ profileColor: color });
      setToast({ message: "Username color saved.", type: "success" });
    } catch (err) {
      console.error("saveProfileColor failed:", err);
      setToast({ message: err?.message || "Failed to save color.", type: "error" });
    } finally {
      setSavingColor(false);
    }
  };



  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      setToast({ message: "Image must be under 2MB.", type: "error" });
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.uid}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl + "?t=" + new Date().getTime();

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ photo_url: publicUrl })
        .eq('id', user.uid);

      if (updateError) throw updateError;

      updateLocalUser({ photoURL: publicUrl });
      setToast({ message: "Avatar updated successfully.", type: "success" });
    } catch (err) {
      console.error("Avatar upload failed:", err);
      setToast({ message: "Failed to upload avatar.", type: "error" });
    }
  };

  const confirmDeleteAccount = async () => {
    if (isDeletingAccount) return;
    setIsDeletingAccount(true);
    try {
      const { error } = await supabase.rpc("delete_own_account");
      if (error) throw error;
      await logout();
      router.push("/");
    } catch (err) {
      console.error("Delete account failed:", err);
      setToast({ message: err?.message || "Account deletion failed. Please try again.", type: "error" });
      setIsDeletingAccount(false);
      setShowDeleteAccount(false);
    }
  };

  if (authLoading || !user) {
    return <div className="spinner" style={{ margin: "100px auto" }} />;
  }

  return (
    <div className={styles.dashPage}>
      <PageShapes page="dashboard" />

      <div className="container">

        {/* Profile Header */}
        <ScrollReveal animation="fadeUp">
          <div className={styles.profileHeader}>
            <div className={styles.profileAvatar}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                (user.username || user.email || "U")[0].toUpperCase()
              )}
            </div>

            <div className={styles.profileInfo}>
              <div className={styles.profileName}>
                <span className={proEnabled ? `username-pro username-color-${user.profileColor}` : ""}>
                  @{user.username || "writer"}
                </span>
                {proEnabled && <span className="badge badge-pro">PRO</span>}
                {user.isOG && <span className="badge badge-og">OG</span>}
              </div>
              <h2 style={{ marginBottom: "8px" }}>{user.displayName || user.username}</h2>
              <p style={{ color: "var(--text-muted)", marginBottom: "12px", fontWeight: "600" }}>
                Level {user.level} · {getRankTitle(user.level)}
              </p>

              <div className={styles.profileStats}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{user.totalStories}</span>
                  <span className={styles.statLabel}>Sprints</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{user.netScore}</span>
                  <span className={styles.statLabel}>Upvotes</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>🔥 {user.currentStreak}</span>
                  <span className={styles.statLabel}>Day Streak</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{user.aura}</span>
                  <span className={styles.statLabel}>Aura</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Daily Prompt Callout */}
        {(() => {
          const today = getTodayUTC();
          const alreadyDone = user.last_daily_date === today;
          return (
            <ScrollReveal animation="fadeUp" delay={50}>
              <div style={{
                background: alreadyDone ? "var(--success-soft)" : "var(--bg-elevated)",
                border: `1px solid ${alreadyDone ? "var(--success)" : "var(--border)"}`,
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-lg) var(--space-xl)",
                marginBottom: "var(--space-xl)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "var(--space-xl)",
                flexWrap: "wrap",
              }}>
                <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "14px" }}>
                  <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>{alreadyDone ? "✅" : "🔒"}</span>
                  <div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: alreadyDone ? "var(--success)" : "var(--accent)", marginBottom: "2px", display: "flex", alignItems: "center", gap: "7px" }}>
                      🗓️ Daily Prompt
                      {!alreadyDone && (
                        <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--success)", flexShrink: 0, animation: "pulse-dot-nav 2s ease-in-out infinite", display: "inline-block" }} />
                      )}
                    </div>
                    <p style={{ fontSize: "0.9rem", color: alreadyDone ? "var(--text-secondary)" : "var(--text-muted)", margin: 0, fontStyle: "italic" }}>
                      {alreadyDone
                        ? `Completed · 🔥 ${user.currentStreak ?? 0}-day streak`
                        : "Today's prompt is sealed — reveal it when you write"}
                    </p>
                  </div>
                </div>
                {!alreadyDone && (
                  <Link href="/daily" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
                    Write Today's Prompt
                  </Link>
                )}
              </div>
            </ScrollReveal>
          );
        })()}

        {/* Dashboard Content */}
        <div className={styles.dashContent}>

          <ScrollReveal animation="fadeUp" delay={100}>
            <aside className={styles.sidebar}>
              <button
                className={`${styles.navItem} ${activeTab === "library" ? styles.navItemActive : ""}`}
                onClick={() => setActiveTab("library")}
              >
                📚 My Library
              </button>
              <button
                className={`${styles.navItem} ${activeTab === "settings" ? styles.navItemActive : ""}`}
                onClick={() => setActiveTab("settings")}
              >
                ⚙️ Settings
              </button>
            </aside>
          </ScrollReveal>

          <main className={styles.mainArea}>
            {activeTab === "library" && (
              <ScrollReveal animation="fadeUp" delay={200}>
                <div className={styles.libraryHeader}>
                  <h2>My Library</h2>
                  <Link href="/sprint" className="btn btn-primary btn-sm">New Sprint</Link>
                </div>

                {offlineSprints.length > 0 && (
                  <div style={{ backgroundColor: "var(--warning-soft)", border: "1px solid var(--warning)", padding: "16px", borderRadius: "8px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ color: "var(--warning)", margin: "0 0 4px 0" }}>Offline Sprints Detected</h4>
                      <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-secondary)" }}>You have {offlineSprints.length} sprint(s) waiting to be uploaded.</p>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={syncOfflineSprints} disabled={syncingOffline}>
                      {syncingOffline ? "Syncing..." : "Sync Now"}
                    </button>
                  </div>
                )}

                <div className={styles.storyList}>
                  {loadingStories ? (
                    <div className="text-center" style={{ padding: "40px" }}>
                      <div className="spinner"></div>
                    </div>
                  ) : myStories.length === 0 ? (
                    <div className="card-flat text-center" style={{ padding: "60px" }}>
                      <p>You haven't written anything yet. Time to hit the keyboard.</p>
                      <Link href="/sprint" className="btn btn-secondary btn-sm" style={{ marginTop: "16px" }}>
                        Start First Sprint
                      </Link>
                    </div>
                  ) : (
                    myStories.map((story) => (
                      <div key={story.id} className={styles.storyRow}>
                        <div className={styles.storyInfo}>
                          <h3>{story.title || "Untitled Draft"}</h3>
                          <div className={styles.storyMeta}>
                            <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{story.wordCount} words</span>
                            <span>•</span>

                            {story.isHidden && <span style={{ color: "var(--warning)" }}>• Draft</span>}
                          </div>
                          <p style={{ marginTop: "12px", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                            {story.content.substring(0, 100)}...
                          </p>
                        </div>
                        <div className={styles.storyActions}>
                          <button
                            className={styles.actionBtn}
                            onClick={() => openEditModal(story)}
                          >
                            Edit
                          </button>
                          <button
                            className={styles.actionBtn}
                            style={{ color: "var(--danger)", borderColor: "var(--danger-soft)" }}
                            onClick={() => openDeleteDialog(story)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollReveal>
            )}

            {activeTab === "settings" && (
              <ScrollReveal animation="fadeUp" delay={200}>
                <h2>Settings</h2>
                <p style={{ marginBottom: "24px", color: "var(--text-muted)" }}>Manage your account preferences and Pro subscription.</p>

                <div className={styles.settingsSection}>
                  <h3>Pro Features</h3>

                  <div className={styles.settingsRow}>
                    <div className={styles.settingLabel}>
                      <h4>Sprinting Ink Pro</h4>
                      <p>Unlock custom UI themes, infinite rerolls, and advanced exports.</p>
                    </div>
                    <div
                      className={`${styles.toggleSwitch} ${proEnabled ? styles.active : ""}`}
                      onClick={handleTogglePro}
                    >
                      <div className={styles.toggleHandle}></div>
                    </div>
                  </div>

                  <div className={styles.settingsRow} style={{ opacity: proEnabled ? 1 : 0.5, pointerEvents: proEnabled ? "auto" : "none" }}>
                    <div className={styles.settingLabel}>
                      <h4>Custom Username Color</h4>
                      <p>Select your signature aesthetic for the global Leaderboards.</p>
                    </div>
                    <select
                      className="input"
                      value={user.profileColor}
                      disabled={savingColor}
                      onChange={(e) => saveProfileColor(e.target.value)}
                      style={{ minWidth: 140 }}
                    >
                      <option value="derby">Brown Derby</option>
                      <option value="sage">Sage Green</option>
                      <option value="terra">Terracotta</option>
                      <option value="teak">Teak Olive</option>
                    </select>
                  </div>
                </div>

                <div className={styles.settingsSection}>
                  <h3>Profile</h3>
                  <div className={styles.settingsRow}>
                    <div className={styles.settingLabel}>
                      <h4>Profile Picture</h4>
                      <p>Upload a custom avatar (max 2MB).</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div className="avatar avatar-lg" style={{ flexShrink: 0, width: 48, height: 48 }}>
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="Avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                        ) : (
                          (user.username || "U")[0].toUpperCase()
                        )}
                      </div>
                      <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
                        Upload New
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarUpload} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className={styles.settingsSection}>
                  <h3>Account</h3>

                  <div className={styles.settingsRow}>
                    <div className={styles.settingLabel}>
                      <h4 style={{ color: "var(--danger)" }}>Delete Account</h4>
                      <p>Permanently remove your stats, stories, and data. This cannot be undone.</p>
                    </div>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setShowDeleteAccount(true)}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            )}
          </main>

        </div>
      </div>

      {/* ── Delete Sprint Confirmation Dialog ──────────────────────────────── */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={closeDeleteDialog}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h3>Delete Sprint?</h3>
              <p className="text-muted" style={{ marginTop: "var(--space-xs)", fontSize: "0.9rem" }}>
                <strong>"{deleteTarget.title || "Untitled Draft"}"</strong> will be permanently removed. This cannot be undone.
              </p>
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={closeDeleteDialog}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                    Deleting…
                  </span>
                ) : "Delete Sprint"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Account Confirmation Dialog ─────────────────────────────── */}
      {showDeleteAccount && (
        <div className="modal-overlay" onClick={() => { if (!isDeletingAccount) setShowDeleteAccount(false); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3 style={{ color: "var(--danger)" }}>Delete Your Account?</h3>
              <p className="text-muted" style={{ marginTop: "var(--space-xs)", fontSize: "0.9rem" }}>
                This will permanently delete <strong>@{user.username}</strong> along with all your sprints, stats, and data. There is absolutely no way to recover this.
              </p>
            </div>
            <div style={{
              background: "var(--danger-soft)",
              border: "1px solid var(--danger)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-md)",
              marginBottom: "var(--space-md)",
              fontSize: "0.85rem",
              color: "var(--danger)",
              fontWeight: 600,
            }}>
              ⚠️ All your stories, achievements, aura, and streak data will be gone forever.
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowDeleteAccount(false)}
                disabled={isDeletingAccount}
              >
                Keep My Account
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={confirmDeleteAccount}
                disabled={isDeletingAccount}
              >
                {isDeletingAccount ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                    Deleting…
                  </span>
                ) : "Yes, Delete Everything"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ─────────────────────────────────────────────────────── */}
      {editTarget && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3>Edit Sprint</h3>
              <p className="text-muted" style={{ marginTop: "var(--space-xs)", fontSize: "0.85rem" }}>
                sprinting.ink preserves the raw, unedited writing. You can update the title, category, and visibility only.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>

              {/* Title */}
              <div className="input-group">
                <label className="input-label">Title</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Untitled Sprint"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={120}
                />
              </div>



              {/* Visibility */}
              <div className="input-group">
                <label className="input-label">Visibility</label>
                <div style={{ display: "flex", gap: "var(--space-sm)" }}>
                  <button
                    type="button"
                    onClick={() => setEditIsHidden(false)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      border: `1.5px solid ${!editIsHidden ? "var(--success)" : "var(--border)"}`,
                      borderRadius: "var(--radius-md)",
                      background: !editIsHidden ? "var(--success-soft)" : "var(--bg-elevated)",
                      color: !editIsHidden ? "var(--success)" : "var(--text-muted)",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      transition: "all 150ms ease",
                    }}
                  >
                    🌍 Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditIsHidden(true)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      border: `1.5px solid ${editIsHidden ? "var(--warning)" : "var(--border)"}`,
                      borderRadius: "var(--radius-md)",
                      background: editIsHidden ? "var(--warning-soft)" : "var(--bg-elevated)",
                      color: editIsHidden ? "#8B6914" : "var(--text-muted)",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      transition: "all 150ms ease",
                    }}
                  >
                    🔒 Draft
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={closeEditModal}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={confirmEdit}
                disabled={isSaving}
              >
                {isSaving ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                    Saving…
                  </span>
                ) : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className="toast"
          style={{
            borderColor: toast.type === "error" ? "var(--danger)" : "var(--success)",
            color: toast.type === "error" ? "var(--danger)" : "var(--success)",
            fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
