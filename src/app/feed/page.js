"use client";

import { useState, useEffect, useMemo } from "react";
import styles from "./feed.module.css";
import { supabase } from "@/lib/supabase";
import ScrollReveal from "@/components/ScrollReveal";
import StoryFocusView from "@/components/StoryFocusView";
import PageShapes from "@/components/PageShapes";

const CATEGORIES = ["All", "Cyberpunk", "Fantasy", "Mystery", "Sci-Fi", "Horror", "Tech", "Romance", "Surreal"];

function StoryCard({ story, onClick }) {
  const [score, setScore] = useState(story.net_score || 0);
  const [userVote, setUserVote] = useState(0);

  const handleVote = (e, val) => {
    e.stopPropagation();
    if (userVote === val) {
      setScore(score - val);
      setUserVote(0);
    } else {
      setScore(score - userVote + val);
      setUserVote(val);
    }
    // In a full implementation, we'd persist this vote to Supabase here
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return "Just now";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <ScrollReveal animation="fadeUp">
      <div className={styles.storyCard} onClick={() => onClick(story)}>
        <div className={styles.storyMeta}>
          <span className={`${styles.storyAuthor} ${story.is_pro_user ? "username-pro username-color-derby" : ""}`}>
            @{story.author_username}
          </span>
          <span className={styles.storyCategory}>{story.category}</span>
          <span className={styles.storyTime}>{timeAgo(story.created_at)}</span>
        </div>

        <h3 className={styles.storyTitle}>{story.title}</h3>

        <p className={styles.storyPrompt}>&ldquo;{story.starter_sentence}&rdquo;</p>
        <div className={styles.storyPreview}>{story.content}</div>

        <div className={styles.storyActions}>
          <div className={styles.voteGroup}>
            <button 
              className={`${styles.voteBtn} ${userVote === 1 ? styles.voteBtnActive : ""}`}
              onClick={(e) => handleVote(e, 1)}
            >
              ▲
            </button>
            <span className={styles.voteScore}>{score}</span>
            <button 
              className={`${styles.voteBtn} ${userVote === -1 ? styles.voteBtnActive : ""}`}
              onClick={(e) => handleVote(e, -1)}
            >
              ▼
            </button>
          </div>

          <span className={styles.readMore}>Read Story →</span>
        </div>
      </div>
    </ScrollReveal>
  );
}

export default function FeedPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Newest"); // "Newest" or "Trending"
  const [selectedStory, setSelectedStory] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("stories")
          .select("*")
          .eq("is_hidden", false);

        if (activeCategory !== "All") {
          query = query.eq("category", activeCategory.toLowerCase());
        }

        if (sortBy === "Trending") {
          query = query.order("net_score", { ascending: false });
        } else {
          query = query.order("created_at", { ascending: false });
        }

        if (search) {
          query = query.or(`content.ilike.%${search}%,author_username.ilike.%${search}%`);
        }

        const { data, error } = await query.limit(50);
        
        if (error) throw error;
        setStories(data || []);
      } catch (err) {
        console.error("Error fetching feed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [activeCategory, sortBy, search]);

  return (
    <div className={styles.feedPage}>
      <PageShapes page="feed" />
      <div className="container">
        
        <header className={styles.feedHeader}>
          <ScrollReveal animation="fadeUp">
            <h1>Discovery</h1>
            <p>Immerse yourself in stories written at the speed of thought.</p>
          </ScrollReveal>
        </header>

        <section className={styles.discoveryBar}>
          <ScrollReveal animation="fadeUp" delay={100}>
            <div className={styles.searchWrapper}>
              <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <input 
                type="text" 
                placeholder="Search stories, authors, or concepts..." 
                className={styles.searchInput}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fadeUp" delay={200}>
            <div className={styles.categoryGrid}>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat} 
                  className={`${styles.categoryPill} ${activeCategory === cat ? styles.categoryPillActive : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fadeUp" delay={300}>
            <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "10px" }}>
              <button 
                onClick={() => setSortBy("Newest")}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.9rem", color: sortBy === "Newest" ? "var(--text-primary)" : "var(--text-muted)", fontWeight: sortBy === "Newest" ? "700" : "400" }}
              >
                Latest
              </button>
              <button 
                onClick={() => setSortBy("Trending")}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.9rem", color: sortBy === "Trending" ? "var(--text-primary)" : "var(--text-muted)", fontWeight: sortBy === "Trending" ? "700" : "400" }}
              >
                Trending
              </button>
            </div>
          </ScrollReveal>
        </section>

        <main className={styles.storyList}>
          {loading ? (
            <div className="spinner" style={{ margin: "50px auto" }} />
          ) : stories.length > 0 ? (
            stories.map(story => (
              <StoryCard key={story.id} story={story} onClick={setSelectedStory} />
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "100px", color: "var(--text-muted)" }}>
              <p>No stories found. Try a different search or category.</p>
            </div>
          )}
        </main>

        {selectedStory && (
          <StoryFocusView 
            story={selectedStory} 
            onClose={() => setSelectedStory(null)} 
          />
        )}

      </div>
    </div>
  );
}
