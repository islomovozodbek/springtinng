"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { getDailyPrompt, getTodayUTC, getMsUntilNextPrompt } from "@/data/dailyPrompts";
import ScrollReveal from "@/components/ScrollReveal";
import styles from "./daily.module.css";

// ── Countdown Component ──────────────────────────────────────────────────────
function CountdownRing() {
  const [msLeft, setMsLeft] = useState(getMsUntilNextPrompt());

  useEffect(() => {
    const tick = setInterval(() => {
      setMsLeft(getMsUntilNextPrompt());
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const totalMs = 24 * 60 * 60 * 1000;
  const progress = msLeft / totalMs;
  const r = 30;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress);

  const h = Math.floor(msLeft / 3_600_000);
  const m = Math.floor((msLeft % 3_600_000) / 60_000);
  const s = Math.floor((msLeft % 60_000) / 1000);
  const label = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  return (
    <div className={styles.statItem}>
      <div className={styles.countdownTimer}>
        <svg className={styles.countdownSvg} viewBox="0 0 72 72">
          <circle className={styles.countdownTrack} cx="36" cy="36" r={r} />
          <circle
            className={styles.countdownProgress}
            cx="36" cy="36" r={r}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            suppressHydrationWarning
          />
        </svg>
        <div className={styles.countdownInner}>
          <span className={styles.countdownHours} suppressHydrationWarning>{String(h).padStart(2, "0")}h</span>
        </div>
      </div>
      <span className={styles.statLabel} suppressHydrationWarning>Next in {label}</span>
    </div>
  );
}

// ── Story Card ───────────────────────────────────────────────────────────────
function StoryCard({ story, isOwn, currentUserId, onVote }) {
  const [expanded, setExpanded] = useState(false);
  const hasUpvoted = story.upvoters?.includes(currentUserId);
  const hasDownvoted = story.downvoters?.includes(currentUserId);
  const needsCollapse = story.content.length > 400;

  return (
    <div className={`${styles.storyCard} ${isOwn ? styles.myStoryCard : ""}`}>
      <div className={styles.cardAuthor}>
        <div className={styles.cardAvatar}>
          {story.author_username?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <div className={styles.cardAuthorName}>@{story.author_username}</div>
          <div className={styles.cardMeta}>
            <span>{story.word_count} words</span>
            <span>•</span>
            <span>{new Date(story.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
      </div>
      
      <h3 className={styles.storyTitle}>{story.title}</h3>

      <div className={`${styles.cardContent} ${needsCollapse && !expanded ? styles.collapsed : ""}`}>
        {story.content}
      </div>
      {needsCollapse && (
        <button className={styles.readMoreBtn} onClick={() => setExpanded(!expanded)}>
          {expanded ? "Show less" : "Read more"}
        </button>
      )}

      <div className={styles.cardFooter}>
        <div className={styles.voteRow}>
          <button
            className={`${styles.voteBtn} ${hasUpvoted ? styles.voteBtnActive : ""}`}
            onClick={() => onVote(story.id, "up")}
          >
            ▲ {story.net_score > 0 ? `+${story.net_score}` : story.net_score}
          </button>
          <button
            className={`${styles.voteBtn} ${hasDownvoted ? styles.voteBtnActive : ""}`}
            onClick={() => onVote(story.id, "down")}
          >
            ▼
          </button>
        </div>
        <span className={styles.wordCount}>{story.word_count} words</span>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function DailyPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const today = getTodayUTC();
  const todayPrompt = getDailyPrompt(today);

  const [dailyPromptRow, setDailyPromptRow] = useState(null);
  const [mySubmission, setMySubmission] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [archivePrompts, setArchivePrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Initialize ─────────────────────────────────────────────────────────────
  const initialize = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Upsert today's prompt row
      const { data: upserted, error: upsertErr } = await supabase
        .from("daily_prompts")
        .upsert(
          { prompt_date: today, prompt_id: todayPrompt.id, prompt_text: todayPrompt.text, prompt_category: todayPrompt.category },
          { onConflict: "prompt_date", ignoreDuplicates: true }
        )
        .select()
        .single();

      let promptRow = upserted;
      if (upsertErr || !promptRow) {
        const { data: fetched } = await supabase
          .from("daily_prompts").select("*").eq("prompt_date", today).single();
        promptRow = fetched;
      }
      if (!promptRow) { setLoading(false); return; }
      setDailyPromptRow(promptRow);

      // 2. Fetch all submissions for today
      const { data: subs } = await supabase
        .from("daily_submissions")
        .select("*")
        .eq("daily_prompt_id", promptRow.id)
        .order("net_score", { ascending: false });

      const submittedSubs = subs?.filter((s) => s.submitted) || [];
      setParticipantCount(submittedSubs.length);

      if (user) {
        const mine = subs?.find(s => s.author_id === user.uid);
        setMySubmission(mine ?? null);
        if (mine) {
          const others = (subs ?? []).filter(s => s.author_id !== user.uid && s.submitted);
          setSubmissions([mine, ...others]);
        }
      }

      // 3. Archive (last 6 days)
      const pastDates = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(Date.UTC(
          new Date().getUTCFullYear(),
          new Date().getUTCMonth(),
          new Date().getUTCDate() - (i + 1)
        ));
        return d.toISOString().split("T")[0];
      });

      const { data: archive } = await supabase
        .from("daily_prompts").select("*").in("prompt_date", pastDates).order("prompt_date", { ascending: false });

      const archiveRows = pastDates.map(date => {
        const found = (archive ?? []).find(r => r.prompt_date === date);
        if (found) return found;
        const p = getDailyPrompt(date);
        return { prompt_date: date, prompt_text: p.text, id: null };
      });
      setArchivePrompts(archiveRows);
    } catch (err) {
      console.error("Daily init error:", err);
    }
    setLoading(false);
  }, [user, today, todayPrompt.id, todayPrompt.text, todayPrompt.category]);

  useEffect(() => {
    if (!authLoading) initialize();
  }, [authLoading, initialize]);

  // ── Voting ─────────────────────────────────────────────────────────────────
  const handleVote = async (submissionId, direction) => {
    if (!user) return router.push("/login");
    const sub = submissions.find(s => s.id === submissionId);
    if (!sub) return;

    const hasUpvoted = sub.upvoters?.includes(user.uid);
    const hasDownvoted = sub.downvoters?.includes(user.uid);
    let newUpvoters = [...(sub.upvoters ?? [])];
    let newDownvoters = [...(sub.downvoters ?? [])];

    if (direction === "up") {
      if (hasUpvoted) { newUpvoters = newUpvoters.filter(id => id !== user.uid); }
      else { newUpvoters.push(user.uid); newDownvoters = newDownvoters.filter(id => id !== user.uid); }
    } else {
      if (hasDownvoted) { newDownvoters = newDownvoters.filter(id => id !== user.uid); }
      else { newDownvoters.push(user.uid); newUpvoters = newUpvoters.filter(id => id !== user.uid); }
    }

    const newNetScore = newUpvoters.length - newDownvoters.length;
    const { error } = await supabase
      .from("daily_submissions")
      .update({ upvoters: newUpvoters, downvoters: newDownvoters, net_score: newNetScore })
      .eq("id", submissionId);

    if (!error) {
      setSubmissions(prev =>
        prev.map(s => s.id === submissionId
          ? { ...s, upvoters: newUpvoters, downvoters: newDownvoters, net_score: newNetScore }
          : s
        )
      );
    }
  };

  const formatArchiveDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00Z");
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className="container">

        {/* ── Hero ── */}
        <ScrollReveal animation="fadeUp">
          <div className={styles.hero}>
            <div className={styles.datePill}>
              🗓️ Daily Prompt — {new Date(today + "T00:00:00Z").toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric", timeZone: "UTC"
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* ── Sealed Prompt Box ── */}
        <ScrollReveal animation="scaleUp" delay={100}>
          {!mySubmission ? (
            /* SEALED — prompt is hidden until you write */
            <div className={styles.sealedBox}>
              <div className={styles.sealedIcon}>🔒</div>
              <h2 className={styles.sealedTitle}>Today's prompt is sealed</h2>
              <p className={styles.sealedSubtitle}>
                The prompt is revealed the moment your timer starts.<br />
                No reading ahead. No thinking it through. Just write.
              </p>
            </div>
          ) : (
            /* REVEALED — show the prompt after submission */
            <div className={styles.promptBox}>
              <span className={styles.promptMark}>"</span>
              <div className={styles.promptText}>{todayPrompt.text}</div>
            </div>
          )}
        </ScrollReveal>

        {/* ── Stats Row ── */}
        <ScrollReveal animation="fadeUp" delay={150}>
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>
                {loading ? "—" : participantCount}
              </span>
              <span className={styles.statLabel}>
                {participantCount === 1 ? "Writer Today" : "Writers Today"}
              </span>
            </div>
            <div className={styles.statDivider} />
            <CountdownRing />
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statValue}>🔥 {user?.currentStreak ?? 0}</span>
              <span className={styles.statLabel}>Day Streak</span>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Action Zone ── */}
        <ScrollReveal animation="fadeUp" delay={200}>
          {loading ? (
            <div className={styles.loadingArea}><div className="spinner" /></div>
          ) : mySubmission && mySubmission.submitted ? (
            <>
              {(user?.currentStreak ?? 0) > 1 && (
                <div style={{ textAlign: "center", marginBottom: "var(--space-lg)" }}>
                  <div className={styles.streakBadge}>
                    🔥 {user.currentStreak}-day streak — keep it going!
                  </div>
                </div>
              )}
              <div className={styles.submittedBanner}>
                <span className={styles.submittedIcon}>✅</span>
                <div className={styles.submittedText}>
                  <h4>You've written today's prompt!</h4>
                  <p>Read what other writers made of the same starting line below.</p>
                </div>
              </div>
            </>
          ) : mySubmission && !mySubmission.submitted ? (
            <div className={styles.ctaZone}>
              <div className={styles.ctaTitle}>You've already viewed today's prompt.</div>
              <div className={styles.ctaSubtitle}>
                No restarts. The "blind write" rule means you only get one sprint per day. By leaving the previous sprint, you've forfeited today's entry.
              </div>
              <button disabled className={styles.ctaBtn} style={{ cursor: "not-allowed", opacity: 0.5 }}>
                🔒 Sprint Locked
              </button>
              <p className={styles.ctaHint}>
                Come back tomorrow for a new prompt.
              </p>
            </div>
          ) : (
            <div className={styles.ctaZone}>
              <div className={styles.ctaTitle}>Ready to write blind?</div>
              <div className={styles.ctaSubtitle}>
                Your prompt appears the moment the clock starts.<br />
                One sprint. One shot. No second-guessing.
              </div>
              {user ? (
                <Link href={`/sprint?mode=daily&date=${today}`} className={styles.ctaBtn}>
                  ✍️ Start Today's Sprint
                </Link>
              ) : (
                <Link href="/login" className={styles.ctaBtn}>
                  Log in to Participate
                </Link>
              )}
              <p className={styles.ctaHint}>
                One submission per day · Responses hidden until you write
              </p>
            </div>
          )}
        </ScrollReveal>

        {/* ── Feed (only after submission) ── */}
        {mySubmission && mySubmission.submitted && !loading && (
          <ScrollReveal animation="fadeUp" delay={100}>
            <div className={styles.feedSection}>
              <div className={styles.feedHeader}>
                <h2>Today's Responses</h2>
                <span className={styles.feedCount}>{submissions.length} sprints</span>
              </div>
              {submissions.length === 0 ? (
                <div className={styles.emptyState}>No other responses yet. You're the first! 🎉</div>
              ) : (
                submissions.map(story => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    isOwn={story.author_id === user?.uid}
                    currentUserId={user?.uid}
                    onVote={handleVote}
                  />
                ))
              )}
            </div>
          </ScrollReveal>
        )}

        {/* ── Archive ── */}
        <ScrollReveal animation="fadeUp">
          <div className={styles.archiveSection}>
            <div className={styles.archiveTitle}>📅 Past Prompts</div>
            <div className={styles.archiveGrid}>
              {archivePrompts.map(row => (
                <div key={row.prompt_date} className={styles.archiveCard}>
                  <div className={styles.archiveDate}>{formatArchiveDate(row.prompt_date)}</div>
                  <div className={styles.archivePromptText}>{row.prompt_text}</div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

      </div>
    </div>
  );
}
