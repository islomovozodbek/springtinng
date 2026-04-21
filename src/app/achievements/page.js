"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PageShapes from "@/components/PageShapes";

const ALL_ACHIEVEMENTS = [
  { id: "first-story", icon: "🎯", name: "Starter Writer", desc: "Write your first story", auraReward: 20 },
  { id: "og", icon: "👑", name: "OG", desc: "Among the first 100 registered users", auraReward: 100 },
  { id: "streak-3", icon: "🔥", name: "Hat Trick", desc: "3-day writing streak", auraReward: 15 },
  { id: "streak-7", icon: "🔥", name: "Week Warrior", desc: "7-day writing streak", auraReward: 30 },
  { id: "streak-14", icon: "🔥", name: "Fortnight Force", desc: "14-day writing streak", auraReward: 50 },
  { id: "streak-30", icon: "🔥", name: "Month Master", desc: "30-day writing streak", auraReward: 100 },
  { id: "stories-10", icon: "📝", name: "Getting Started", desc: "Write 10 stories", auraReward: 25 },
  { id: "stories-50", icon: "✍️", name: "Prolific Writer", desc: "Write 50 stories", auraReward: 75 },
  { id: "chain-starter", icon: "🔗", name: "Chain Starter", desc: "3+ people continued your story", auraReward: 40 },
  { id: "upvotes-50", icon: "⬆️", name: "Rising Star", desc: "Receive 50 total upvotes", auraReward: 30 },
  { id: "upvotes-100", icon: "⬆️", name: "Crowd Favorite", desc: "Receive 100 total upvotes", auraReward: 60 },
  { id: "social", icon: "🤝", name: "Social Butterfly", desc: "Follow 20 people", auraReward: 20 },
  { id: "recruiter", icon: "📨", name: "Recruiter", desc: "Refer 3 friends who sign up", auraReward: 50 },
  { id: "weekly-champ", icon: "🏆", name: "Weekly Champion", desc: "Reach #1 on weekly leaderboard", auraReward: 100 },
  { id: "speed-demon", icon: "⚡", name: "Speed Demon", desc: "Complete a 1-min sprint", auraReward: 15 },
  { id: "marathon", icon: "📝", name: "Marathon Writer", desc: "Complete a 5-min sprint", auraReward: 15 },
  { id: "night-owl", icon: "🦉", name: "Night Owl", desc: "Write a story between midnight and 4 AM", auraReward: 20 },
  { id: "early-bird", icon: "🐦", name: "Early Bird", desc: "Write a story between 5 AM and 7 AM", auraReward: 20 },
  
  // Brainrot Achievements
  { id: "yapper", icon: "🗣️", name: "Professional Yapper", desc: "Write 200 words in a single sprint", auraReward: 30 },
  { id: "cooking", icon: "👨‍🍳", name: "Bro is Cooking", desc: "Get 10 upvotes on a single story", auraReward: 50 },
  { id: "touch-grass", icon: "🌱", name: "Touch Grass", desc: "Play a sprint on mobile", auraReward: 20 },
  { id: "aint-no-way", icon: "💀", name: "Ain't No Way", desc: "Survive a 3-minute Hardcore sprint", auraReward: 100 },
  { id: "negative-aura", icon: "📉", name: "Negative Aura", desc: "Trash a sprint right after finishing it", auraReward: 10 },
];

export default function AchievementsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div style={{ padding: "var(--space-4xl) 0", textAlign: "center" }}>
        <div className="spinner spinner-lg mx-auto" />
      </div>
    );
  }

  // Mock: unlock a few achievements
  const unlocked = new Set(user.earnedAchievements || []);
  if (user.totalStories >= 1) unlocked.add("first-story");
  if (user.isOG) unlocked.add("og");
  if (user.currentStreak >= 3) unlocked.add("streak-3");
  if (user.currentStreak >= 7) unlocked.add("streak-7");
  if (user.currentStreak >= 14) unlocked.add("streak-14");
  if (user.currentStreak >= 30) unlocked.add("streak-30");
  if (user.totalStories >= 10) unlocked.add("stories-10");
  if (user.totalStories >= 50) unlocked.add("stories-50");
  if (user.totalUpvotesReceived >= 50) unlocked.add("upvotes-50");
  if (user.totalUpvotesReceived >= 100) unlocked.add("upvotes-100");
  if (user.followingCount >= 20) unlocked.add("social");

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
