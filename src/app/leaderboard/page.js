"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./leaderboard.module.css";
import ScrollReveal from "@/components/ScrollReveal";
import PageShapes from "@/components/PageShapes";

const CATEGORIES = [
  { id: "quality", label: "Global Ranking (Upvotes)", sortKey: "total_upvotes_received", unit: "Upvotes" },
  { id: "dedication", label: "Most Sprints (Activity)", sortKey: "total_stories", unit: "Sprints" },
  { id: "consistency", label: "Longest Streaks (Consistency)", sortKey: "current_streak", unit: "Days" },
];

export default function LeaderboardPage() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order(activeCategory.sortKey, { ascending: false })
          .limit(20);

        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [activeCategory]);

  return (
    <div className={styles.leaderPage}>
      <PageShapes page="leaderboard" />
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        
        <header className={styles.leaderHeader}>
          <ScrollReveal animation="fadeUp">
            <h1>Leaderboards</h1>
            <p>Celebrating the most dedicated writers in our community.</p>
          </ScrollReveal>
        </header>

        {/* Tab Selection */}
        <ScrollReveal animation="fadeUp" delay={100}>
          <div className={styles.tabs}>
            {CATEGORIES.map(cat => (
              <button 
                key={cat.id} 
                className={`${styles.tab} ${activeCategory.id === cat.id ? styles.active : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </ScrollReveal>

        <div className={styles.leaderList}>
          {loading ? (
            <div className="spinner" style={{ margin: "50px auto" }} />
          ) : users.length > 0 ? (
            users.map((u, i) => {
              const actualRank = i + 1;
              let rankClass = "";
              if (actualRank === 1) rankClass = styles.rank1;
              else if (actualRank === 2) rankClass = styles.rank2;
              else if (actualRank === 3) rankClass = styles.rank3;
              
              return (
                <ScrollReveal key={u.id} animation="slideLeft" delay={10 + (i * 30)}>
                  <div className={`${styles.leaderItem} ${rankClass}`}>
                    <div className={styles.leaderRank}>{actualRank}</div>
                    
                    <div className={styles.leaderInfo}>
                      <div className={styles.leaderAvatar}>
                        {(u.username || "U")[0].toUpperCase()}
                      </div>
                      <div className={styles.leaderName}>
                        <span className={u.tier === "pro" ? `username-pro username-color-${u.profile_color}` : ""}>@{u.username}</span>
                        {u.tier === "pro" && <span className="badge badge-pro" style={{ fontSize: '0.65rem', marginLeft: '6px' }}>PRO</span>}
                      </div>
                    </div>

                    <div className={styles.leaderValue}>
                      {(u[activeCategory.sortKey] || 0).toLocaleString()} 
                      <div className={styles.leaderSubLabel}>{activeCategory.unit}</div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })
          ) : (
            <div style={{ textAlign: "center", padding: "100px", color: "var(--text-muted)" }}>
              <p>No writers on the board yet. Start a sprint to be the first!</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
