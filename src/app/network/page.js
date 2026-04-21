"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "./network.module.css";
import PageShapes from "@/components/PageShapes";
import Link from "next/link";

export default function NetworkPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("following");
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    
    const fetchNetwork = async () => {
      setFetching(true);
      try {
        // Fetch people the user is following
        const { data: followingData } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", user.uid);
          
        if (followingData && followingData.length > 0) {
          const ids = followingData.map(f => f.following_id);
          const { data: profiles } = await supabase.from("profiles").select("*").in("id", ids);
          setFollowing(profiles || []);
        } else {
          setFollowing([]);
        }

        // Fetch followers
        const { data: followersData } = await supabase
          .from("follows")
          .select("follower_id")
          .eq("following_id", user.uid);

        if (followersData && followersData.length > 0) {
          const ids = followersData.map(f => f.follower_id);
          const { data: profiles } = await supabase.from("profiles").select("*").in("id", ids);
          setFollowers(profiles || []);
        } else {
          setFollowers([]);
        }
      } catch (err) {
        console.error("Error fetching network:", err);
      } finally {
        setFetching(false);
      }
    };
    
    fetchNetwork();
  }, [user]);

  if (loading || !user) {
    return (
      <div style={{ padding: "var(--space-4xl) 0", textAlign: "center" }}>
        <div className="spinner spinner-lg mx-auto" />
      </div>
    );
  }

  const activeList = activeTab === "following" ? following : followers;

  return (
    <div className={styles.networkPage}>
      <PageShapes page="friends" />
      <div className="container">
        <h1 style={{ marginBottom: "var(--space-md)", textAlign: "center" }}>Your Network</h1>
        
        <div className={styles.networkTabs}>
          <button 
            className={`${styles.tab} ${activeTab === "following" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("following")}
          >
            Following ({following.length})
          </button>
          <button 
            className={`${styles.tab} ${activeTab === "followers" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("followers")}
          >
            Followers ({followers.length})
          </button>
        </div>

        <div className={styles.networkList}>
          {fetching ? (
            <div className="spinner mx-auto" style={{ margin: "var(--space-2xl) auto" }} />
          ) : activeList.length === 0 ? (
            <div className={styles.emptyState}>
              <span>🤝</span>
              <p>{activeTab === "following" ? "You aren't following anyone yet." : "You don't have any followers yet."}</p>
              {activeTab === "following" && (
                <Link href="/feed" className="btn btn-primary" style={{ marginTop: "1rem", display: "inline-block", textDecoration: "none" }}>Explore the Feed</Link>
              )}
            </div>
          ) : (
            activeList.map(profile => (
              <Link href={`/profile/${profile.username}`} key={profile.id} className={styles.profileCard}>
                <div className={styles.profileAvatar}>
                  {(profile.username || "U")[0].toUpperCase()}
                </div>
                <div className={styles.profileInfo}>
                  <div className={styles.profileName}>
                    <span className={profile.tier === "pro" ? "username-shiny" : ""}>
                      {profile.display_name || profile.username}
                    </span>
                    {profile.tier === "pro" && <span className="badge badge-pro" style={{ transform: "scale(0.8)", marginLeft: "8px" }}>PRO</span>}
                  </div>
                  <div className={styles.profileUsername}>@{profile.username}</div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
