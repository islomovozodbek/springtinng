"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import PageShapes from "@/components/PageShapes";
import { supabase } from "@/lib/supabase";
import {
  ALL_ACHIEVEMENTS,
  computeEarnedAchievements,
  getNewlyUnlocked,
} from "@/lib/achievements";
import { useAchievementToasts } from "@/components/AchievementToast";

export default function AchievementsPage() {
  const { user, loading, updateLocalUser } = useAuth();
  const { showAchievementToasts } = useAchievementToasts();
  const router = useRouter();
  const hasSynced = useRef(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // On mount (once user is available), compute and persist any newly unlocked achievements
  useEffect(() => {
    if (!user || hasSynced.current) return;
    hasSynced.current = true;

    const syncAchievements = async () => {
      try {
        const fullEarned = computeEarnedAchievements(user);
        const newlyUnlockedIds = getNewlyUnlocked(user.earnedAchievements || [], fullEarned);

        if (newlyUnlockedIds.length === 0) return;

        const combinedAchievements = [...fullEarned];

        // Persist to Supabase
        const { error } = await supabase
          .from("profiles")
          .update({ earned_achievements: combinedAchievements })
          .eq("id", user.uid);

        if (error) {
          console.error("Failed to persist achievements:", error.message);
          return;
        }

        // Sync local state
        updateLocalUser?.({ earnedAchievements: combinedAchievements });

        // Show toasts for each newly unlocked achievement
        const toastData = newlyUnlockedIds
          .map((id) => ALL_ACHIEVEMENTS.find((a) => a.id === id))
          .filter(Boolean);
        showAchievementToasts(toastData);
      } catch (err) {
        console.error("Achievement sync error:", err);
      }
    };

    syncAchievements();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || !user) {
    return (
      <div style={{ padding: "var(--space-4xl) 0", textAlign: "center" }}>
        <div className="spinner spinner-lg mx-auto" />
      </div>
    );
  }

  // Compute the full earned set purely for display (the sync already updated the DB)
  const unlocked = computeEarnedAchievements(user);
  const progress = Math.round((unlocked.size / ALL_ACHIEVEMENTS.length) * 100);

  return (
    <div style={{ padding: "var(--space-2xl) 0", minHeight: "calc(100vh - var(--nav-height))", position: "relative", overflow: "hidden" }}>
      <PageShapes page="achievements" />
      <div className="container" style={{ maxWidth: "800px", position: "relative", zIndex: 1 }}>
        <div className="text-center" style={{ marginBottom: "var(--space-2xl)" }}>
          <h1 style={{ marginBottom: "var(--space-sm)" }}>Achievements</h1>
          <p className="text-muted">
            {unlocked.size} of {ALL_ACHIEVEMENTS.length} unlocked ({progress}%)
          </p>
          {/* Progress bar */}
          <div style={{
            maxWidth: "300px",
            margin: "var(--space-md) auto 0",
            height: "8px",
            backgroundColor: "var(--bg-secondary)",
            borderRadius: "var(--radius-full)",
            overflow: "hidden",
          }}>
            <div style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: "var(--accent)",
              borderRadius: "var(--radius-full)",
              transition: "width 500ms ease",
            }} />
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "var(--space-md)",
        }}>
          {ALL_ACHIEVEMENTS.map((ach) => {
            const isUnlocked = unlocked.has(ach.id);
            return (
              <div
                key={ach.id}
                className="card"
                style={{
                  textAlign: "center",
                  opacity: isUnlocked ? 1 : 0.35,
                  filter: isUnlocked ? "none" : "grayscale(1)",
                  transition: "all 300ms ease",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "var(--space-sm)" }}>
                  {ach.icon}
                </div>
                <h4 style={{ fontSize: "0.9rem", marginBottom: "var(--space-xs)" }}>{ach.name}</h4>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "var(--space-sm)" }}>
                  {ach.desc}
                </p>
                <span style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: isUnlocked ? "var(--success)" : "var(--text-muted)",
                }}>
                  {isUnlocked ? "✓ Unlocked" : `⭐ ${ach.auraReward} Aura`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
