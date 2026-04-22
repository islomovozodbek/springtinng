"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./feed.module.css";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import ScrollReveal from "@/components/ScrollReveal";
import StoryFocusView from "@/components/StoryFocusView";
import PageShapes from "@/components/PageShapes";



// ── Login Prompt Modal ────────────────────────────────────────────────────────
function LoginPrompt({ onClose }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className={styles.loginPromptOverlay}
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className={styles.loginPromptCard}>
        <button className={styles.loginPromptClose} onClick={onClose} aria-label="Close">✕</button>
        <div className={styles.loginPromptIcon}>✍️</div>
        <h2 className={styles.loginPromptTitle}>Join the conversation</h2>
        <p className={styles.loginPromptSubtitle}>
          Log in to upvote and downvote stories, support great writers, and make your voice count.
        </p>
        <div className={styles.loginPromptActions}>
          <Link href="/login" className={styles.loginPromptBtn}>Log in</Link>
          <Link href="/register" className={styles.loginPromptBtnSecondary}>Create account</Link>
        </div>
      </div>
    </div>
  );
}

// ── Story Card ────────────────────────────────────────────────────────────────
function StoryCard({ story: initialStory, user, onClick, onNeedLogin }) {
  const [story, setStory] = useState(initialStory);
  const [voting, setVoting] = useState(false);

  // Sync if parent re-loads stories
  useEffect(() => { setStory(initialStory); }, [initialStory]);

  const userVote = user
    ? story.upvoters?.includes(user.uid)
      ? 1
      : story.downvoters?.includes(user.uid)
      ? -1
      : 0
    : 0;

  const handleVote = async (e, direction) => {
    e.stopPropagation();

    if (!user) {
      onNeedLogin();
      return;
    }

    if (voting) return;
    setVoting(true);

    // Determine the RPC direction: toggle same = "none" (undo), else apply
    const currentVote = story.upvoters?.includes(user.uid)
      ? "up"
      : story.downvoters?.includes(user.uid)
      ? "down"
      : "none";

    const rpcDirection = currentVote === direction ? "none" : direction;

    // Optimistic update
    let optimisticUpvoters = [...(story.upvoters ?? [])];
    let optimisticDownvoters = [...(story.downvoters ?? [])];
    optimisticUpvoters = optimisticUpvoters.filter((id) => id !== user.uid);
    optimisticDownvoters = optimisticDownvoters.filter((id) => id !== user.uid);
    if (rpcDirection === "up") optimisticUpvoters.push(user.uid);
    if (rpcDirection === "down") optimisticDownvoters.push(user.uid);
    const optimisticScore = optimisticUpvoters.length - optimisticDownvoters.length;

    setStory((prev) => ({
      ...prev,
      upvoters: optimisticUpvoters,
      downvoters: optimisticDownvoters,
      net_score: optimisticScore,
    }));

    // Persist via RPC (SECURITY DEFINER bypasses author-only RLS)
    const { data, error } = await supabase.rpc("vote_story", {
      p_story_id:  story.id,
      p_user_id:   user.uid,
      p_direction: rpcDirection,
    });

    if (error) {
      console.error("Vote error:", error);
      // Rollback on failure
      setStory(initialStory);
    } else if (data) {
      setStory((prev) => ({
        ...prev,
        upvoters:   data.upvoters   ?? optimisticUpvoters,
        downvoters: data.downvoters ?? optimisticDownvoters,
        net_score:  data.net_score  ?? optimisticScore,
      }));
    }

    setVoting(false);
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

          <span className={styles.storyTime}>{timeAgo(story.created_at)}</span>
        </div>

        <h3 className={styles.storyTitle}>{story.title}</h3>

        <p className={styles.storyPrompt}>&ldquo;{story.starter_sentence}&rdquo;</p>
        <div className={styles.storyPreview}>{story.content}</div>

        <div className={styles.storyActions}>
          <div className={styles.voteGroup}>
            <button
              id={`vote-up-${story.id}`}
              className={`${styles.voteBtn} ${userVote === 1 ? styles.voteBtnActive : ""} ${voting ? styles.voteBtnLoading : ""}`}
              onClick={(e) => handleVote(e, "up")}
              aria-label="Upvote"
              disabled={voting}
            >
              ▲
            </button>
            <span
              className={`${styles.voteScore} ${userVote === 1 ? styles.voteScoreUp : userVote === -1 ? styles.voteScoreDown : ""}`}
            >
              {story.net_score > 0 ? `+${story.net_score}` : story.net_score}
            </span>
            <button
              id={`vote-down-${story.id}`}
              className={`${styles.voteBtn} ${styles.voteBtnDown} ${userVote === -1 ? styles.voteBtnActiveDown : ""} ${voting ? styles.voteBtnLoading : ""}`}
              onClick={(e) => handleVote(e, "down")}
              aria-label="Downvote"
              disabled={voting}
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

// ── Feed Page ─────────────────────────────────────────────────────────────────
export default function FeedPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [sortBy, setSortBy] = useState("Newest");
  const [selectedStory, setSelectedStory] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 20;

  useEffect(() => {
    setPage(0);
    setHasMore(true);
  }, [sortBy, search]);

  useEffect(() => {
    const fetchStories = async () => {
      if (page === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        let query = supabase
          .from("stories")
          .select("*")
          .eq("is_hidden", false);



        if (sortBy === "Trending") {
          query = query.order("net_score", { ascending: false });
        } else {
          query = query.order("created_at", { ascending: false });
        }

        if (search) {
          query = query.or(`content.ilike.%${search}%,author_username.ilike.%${search}%`);
        }

        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data, error } = await query.range(from, to);
        if (error) throw error;

        if (!data || data.length < PAGE_SIZE) {
          setHasMore(false);
        }

        if (page === 0) {
          setStories(data || []);
        } else {
          setStories((prev) => [...prev, ...(data || [])]);
        }
      } catch (err) {
        console.error("Error fetching feed:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchStories();
  }, [sortBy, search, page]);

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
              <StoryCard
                key={story.id}
                story={story}
                user={user}
                onClick={setSelectedStory}
                onNeedLogin={() => setShowLoginPrompt(true)}
              />
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "100px", color: "var(--text-muted)" }}>
              <p>No stories found. Try a different search.</p>
            </div>
          )}
        </main>

        {hasMore && stories.length > 0 && (
          <div className={styles.loadMoreWrapper}>
            <button
              className={styles.loadMoreBtn}
              onClick={() => setPage((p) => p + 1)}
              disabled={loadingMore}
            >
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}

        {selectedStory && (
          <StoryFocusView
            story={selectedStory}
            onClose={() => setSelectedStory(null)}
          />
        )}

        {showLoginPrompt && (
          <LoginPrompt onClose={() => setShowLoginPrompt(false)} />
        )}

      </div>
    </div>
  );
}
