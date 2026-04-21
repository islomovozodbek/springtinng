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

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [myStories, setMyStories] = useState([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [activeTab, setActiveTab] = useState("library");
  const [proEnabled, setProEnabled] = useState(false);
  const [syncingOffline, setSyncingOffline] = useState(false);
  const [offlineSprints, setOfflineSprints] = useState([]);

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
      fetchStories();
      checkOfflineSprints();
    }
  }, [user, authLoading, router]);

  const checkOfflineSprints = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('offline_sprints') || '[]');
      if (stored.length > 0) {
        setOfflineSprints(stored);
      }
    } catch(e) {}
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
          category: sprint.category,
          time_mode: sprint.time_mode,
          net_score: 0,
          upvoters: [],
          downvoters: [],
          is_hidden: false,
          chain_part: 1,
          created_at: new Date(sprint.timestamp).toISOString()
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
      localStorage.removeItem('offline_sprints');
      setOfflineSprints([]);
    } else if (successCount > 0) {
      // Keep remaining
      const remaining = offlineSprints.slice(successCount);
      localStorage.setItem('offline_sprints', JSON.stringify(remaining));
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

      const stories = (data || []).map(row => ({
        id: row.id,
        title: row.title,
        content: row.content,
        wordCount: row.word_count,
        category: row.category,
        createdAt: row.created_at,
        isHidden: row.is_hidden,
        netScore: row.net_score,
      }));
      setMyStories(stories);
    } catch (err) {
      console.error("Error fetching stories:", err);
    }
    setLoadingStories(false);
  };

  const handleTogglePro = () => {
    setProEnabled(!proEnabled);
    // Logic for updating tier in Firestore would go here
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
              {(user.username || user.email || "U")[0].toUpperCase()}
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
                  <div style={{ backgroundColor: 'var(--warning-soft)', border: '1px solid var(--warning)', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ color: 'var(--warning)', margin: '0 0 4px 0' }}>Offline Sprints Detected</h4>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>You have {offlineSprints.length} sprint(s) waiting to be uploaded.</p>
                    </div>
                    <button 
                      className="btn btn-primary btn-sm" 
                      onClick={syncOfflineSprints} 
                      disabled={syncingOffline}
                    >
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
                            <span>{story.category || "Uncategorized"}</span>
                            {story.isHidden && <span style={{ color: "var(--warning)" }}>• Draft</span>}
                          </div>
                          <p style={{ marginTop: "12px", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                            {story.content.substring(0, 100)}...
                          </p>
                        </div>
                        <div className={styles.storyActions}>
                          <button className={styles.actionBtn}>Edit</button>
                          <button className={styles.actionBtn} style={{ color: "var(--danger)", borderColor: "var(--danger-soft)" }}>Delete</button>
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
                      <h4>KeyboardSprint Pro</h4>
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
                    <select className="input" defaultValue={user.profileColor}>
                      <option value="derby">Brown Derby</option>
                      <option value="sage">Sage Green</option>
                      <option value="terra">Terracotta</option>
                      <option value="teak">Teak Olive</option>
                    </select>
                  </div>
                </div>

                <div className={styles.settingsSection}>
                  <h3>Account</h3>
                  <div className={styles.settingsRow}>
                    <div className={styles.settingLabel}>
                      <h4>Email Notifications</h4>
                      <p>Receive updates when your stories are trending.</p>
                    </div>
                    <div className={`${styles.toggleSwitch} ${styles.active}`}>
                      <div className={styles.toggleHandle}></div>
                    </div>
                  </div>
                  <div className={styles.settingsRow}>
                    <div className={styles.settingLabel}>
                      <h4 style={{ color: "var(--danger)" }}>Delete Account</h4>
                      <p>Permanently remove your stats, stories, and data.</p>
                    </div>
                    <button className="btn btn-danger btn-sm">Delete</button>
                  </div>
                </div>
              </ScrollReveal>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}
