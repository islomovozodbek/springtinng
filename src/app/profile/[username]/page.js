"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { getRankTitle } from "@/lib/ranks";
import styles from "./profile.module.css";
import PageShapes from "@/components/PageShapes";

const ACHIEVEMENTS = [
  { id: "first-story", icon: "🎯", name: "Starter Writer", desc: "Write your first story" },
  { id: "og", icon: "🏆", name: "OG", desc: "First 100 registered users" },
  { id: "week-warrior", icon: "🔥", name: "Week Warrior", desc: "7-day writing streak" },
  { id: "month-master", icon: "🔥", name: "Month Master", desc: "30-day writing streak" },
  { id: "prolific", icon: "✍️", name: "Prolific Writer", desc: "Write 50 stories" },
  { id: "story-machine", icon: "✍️", name: "Story Machine", desc: "Write 200 stories" },
  { id: "crowd-favorite", icon: "⬆️", name: "Crowd Favorite", desc: "Get 100 total upvotes" },
  { id: "legendary", icon: "⬆️", name: "Legendary", desc: "Get 1000 total upvotes" },
  { id: "social", icon: "🤝", name: "Social Butterfly", desc: "Follow 20 people" },
  { id: "recruiter", icon: "📨", name: "Recruiter", desc: "Refer 3 friends" },
  { id: "weekly-champ", icon: "🏆", name: "Weekly Champion", desc: "Reach #1 on weekly leaderboard" },
  { id: "speed-demon", icon: "⚡", name: "Speed Demon", desc: "Complete a 1-min sprint" },
  { id: "marathon", icon: "📝", name: "Marathon Writer", desc: "Complete a 5-min sprint" },
];

export default function ProfilePage() {
  const params = useParams();
  const username = params.username;
  const [activeTab, setActiveTab] = useState("stories");
  const [profileUser, setProfileUser] = useState(null);
  const [userStories, setUserStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // 1. Fetch User Profile
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", username)
          .maybeSingle();

        if (userError) throw userError;
        setProfileUser(userData);

        if (userData) {
          // 2. Fetch User Stories
          const { data: storyData, error: storyError } = await supabase
            .from("stories")
            .select("*")
            .eq("author_id", userData.id)
            .eq("is_hidden", false)
            .order("created_at", { ascending: false });

          if (storyError) throw storyError;
          setUserStories(storyData || []);

          // 3. Check follow status if logged in and not looking at own profile
          if (user && user.uid !== userData.id) {
            const { data: followData } = await supabase
              .from("follows")
              .select("*")
              .eq("follower_id", user.uid)
              .eq("following_id", userData.id)
              .maybeSingle();
            if (followData) setIsFollowing(true);
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [username, user?.uid]);

  const toggleFollow = async () => {
    if (!user || !profileUser || followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.uid)
          .eq("following_id", profileUser.id);
        
        setIsFollowing(false);
        setProfileUser(prev => ({ ...prev, followers_count: Math.max(0, (prev.followers_count || 0) - 1) }));
      } else {
        // Follow
        await supabase
          .from("follows")
          .insert({ follower_id: user.uid, following_id: profileUser.id });
          
        setIsFollowing(true);
        setProfileUser(prev => ({ ...prev, followers_count: (prev.followers_count || 0) + 1 }));
      }
    } catch (e) {
      console.error("Error toggling follow:", e);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return <div className="spinner" style={{ margin: "100px auto" }} />;

  if (!profileUser) {
    return (
      <div className={styles.profilePage}>
        <div className="container text-center" style={{ padding: "var(--space-4xl) 0" }}>
          <h1 style={{ marginBottom: "var(--space-md)" }}>User not found</h1>
          <p className="text-muted">@{username} doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  // Calculate unlocked achievements based on real stats
  const unlockedAchievements = new Set();
  if (profileUser.total_stories >= 1) unlockedAchievements.add("first-story");
  if (profileUser.is_og) unlockedAchievements.add("og");
  if (profileUser.current_streak >= 7) unlockedAchievements.add("week-warrior");
  if (profileUser.current_streak >= 30) unlockedAchievements.add("month-master");
  if (profileUser.total_stories >= 50) unlockedAchievements.add("prolific");
  if (profileUser.total_upvotes_received >= 100) unlockedAchievements.add("crowd-favorite");

  return (
    <div className={styles.profilePage}>
      <PageShapes page="profile" />
      <div className="container">
        {/* Profile Header */}
        <div className={styles.profileHeader}>
          <div className={styles.profileAvatar}>
            {(profileUser.username || "U")[0].toUpperCase()}
          </div>
          <div className={styles.profileInfo}>
            <div className={styles.profileName}>
              <h1 className={profileUser.tier === "pro" ? "username-shiny" : ""}>
                {profileUser.display_name || profileUser.username}
              </h1>
              {profileUser.tier === "pro" && <span className="badge badge-pro">PRO</span>}
              {profileUser.is_og && <span className="badge badge-og">OG</span>}
            </div>
            <div className={styles.profileUsername}>@{profileUser.username}</div>
            <div className={styles.profileBio}>
              {profileUser.bio || "Writing stories one sprint at a time ✍️"}
            </div>
            <div className={styles.profileStats}>
              <span className={styles.profileStat}>
                <strong>{profileUser.total_stories}</strong> stories
              </span>
              <span className={styles.profileStat}>
                <strong>{profileUser.followers_count || 0}</strong> followers
              </span>
              <span className={styles.profileStat}>
                <strong>{profileUser.following_count || 0}</strong> following
              </span>
              <span className={styles.profileStat}>
                <strong>🔥 {profileUser.current_streak}</strong> day streak
              </span>
              <span className={styles.profileStat}>
                <strong>Lv {profileUser.level} ({getRankTitle(profileUser.level)})</strong> · {profileUser.aura} Aura
              </span>
            </div>
            <div className={styles.profileActions}>
              {user && user.uid !== profileUser.id && (
                <button 
                  className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                  onClick={toggleFollow}
                  disabled={followLoading}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.profileTabs}>
          <button
            className={`${styles.profileTab} ${activeTab === "stories" ? styles.active : ""}`}
            onClick={() => setActiveTab("stories")}
          >
            Stories ({userStories.length})
          </button>
          <button
            className={`${styles.profileTab} ${activeTab === "achievements" ? styles.active : ""}`}
            onClick={() => setActiveTab("achievements")}
          >
            Achievements
          </button>
        </div>

        {/* Content */}
        <div className={styles.profileContent}>
          {activeTab === "stories" && (
            <>
              {userStories.length === 0 ? (
                <div className="text-center text-muted" style={{ padding: "var(--space-2xl)" }}>
                  <p>No public stories yet.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                  {userStories.map((story) => (
                    <div key={story.id} className="card">
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic", marginBottom: "var(--space-sm)" }}>
                        {story.starter_sentence}
                      </div>
                      <p style={{ fontFamily: "var(--font-writing)", lineHeight: 1.75 }}>
                        {story.content}
                      </p>
                      <div style={{ display: "flex", gap: "var(--space-md)", marginTop: "var(--space-md)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        <span>▲ {story.net_score}</span>
                        <span>{story.word_count} words</span>
                        <span>{story.time_mode} min sprint</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "achievements" && (
            <div className={styles.achievementGrid}>
              {ACHIEVEMENTS.map((ach) => {
                const unlocked = unlockedAchievements.has(ach.id);
                return (
                  <div
                    key={ach.id}
                    className={`${styles.achievementCard} ${!unlocked ? styles.locked : ""}`}
                  >
                    <span className={styles.achievementIcon}>{ach.icon}</span>
                    <h4>{ach.name}</h4>
                    <p>{ach.desc}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
