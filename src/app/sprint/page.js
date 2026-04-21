"use client";

import { Suspense } from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { toPng } from "html-to-image";
import PageShapes from "@/components/PageShapes";
import { getRandomPrompt, CATEGORIES } from "@/data/prompts";
import { getDailyPrompt } from "@/data/dailyPrompts";
import NinjaCursor from "@/components/NinjaCursor";
import styles from "./sprint.module.css";

const TIME_MODES = [
  { value: 0.5, label: "30 sec", proOnly: false },
  { value: 1, label: "1 min", proOnly: true },
  { value: 2, label: "2 min", proOnly: true },
  { value: 3, label: "3 min", proOnly: false },
  { value: 5, label: "5 min", proOnly: true },
];

const VANISH_WARNING_MS = 2000;   // At 2s, 3-2-1 countdown begins
const VANISH_TRIGGER_MS = 5000;   // At 5s, deletion starts

// We will slow down the deletion to max ~10 characters per second = ~100ms per character
const BASE_DELETE_MS = 300;
const MIN_DELETE_MS = 100;

function SprintPageInner() {
  const { user, loading, updateLocalUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Daily prompt mode
  const isDailyMode = searchParams.get("mode") === "daily";
  const dailyDate = searchParams.get("date") ?? null;
  const dailyPromptData = isDailyMode && dailyDate ? getDailyPrompt(dailyDate) : null;

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);


  const [phase, setPhase] = useState("setup");
  const [timeMode, setTimeMode] = useState(0.5);
  const [userTime, setUserTime] = useState(""); // Custom minutes for Pro
  const [category, setCategory] = useState("all");
  const [prompt, setPrompt] = useState(isDailyMode && dailyPromptData ? dailyPromptData : null);
  const [isCustomPrompt, setIsCustomPrompt] = useState(false);
  const [userPrompt, setUserPrompt] = useState("");
  const [isHardcore, setIsHardcore] = useState(false);
  
  const [text, setText] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [inactivityMs, setInactivityMs] = useState(0);
  const [rerolls, setRerolls] = useState(isDailyMode ? 0 : 3);
  const [title, setTitle] = useState("");
  const [saveCategory, setSaveCategory] = useState("general");
  const [isPublishing, setIsPublishing] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Detect theme for the shareable image
    const observer = new MutationObserver(() => {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
      setTheme(currentTheme);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    setTheme(document.documentElement.getAttribute("data-theme") || "light");
    return () => observer.disconnect();
  }, []);
  
  const handleReroll = () => {
    if (user?.tier !== "pro" && rerolls <= 0) return;
    setPrompt(getRandomPrompt(user?.tier === "pro" ? category : "all"));
    if (user?.tier !== "pro") {
      setRerolls((r) => r - 1);
    }
  };
  
  const lastKeypressRef = useRef(Date.now());
  const inactivityIntervalRef = useRef(null);
  const mainTimerRef = useRef(null);
  const deletionTimeoutRef = useRef(null);
  const textAreaRef = useRef(null);
  const scrollSyncRef = useRef(null);
  
  // Calculate locked text boundary dynamically
  const getLockedLength = useCallback(() => {
    const segments = text.split(/(?<=[.?!])\s+/);
    if (segments.length <= 1) return 0;
    
    // Everything except the last segment is locked
    const activeSegmentLength = segments[segments.length - 1].length;
    return text.length - activeSegmentLength;
  }, [text]);

  useEffect(() => {
    if (phase !== "active") return;

    mainTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endSprint();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(mainTimerRef.current);
  }, [phase]);

  const endSprint = () => {
    clearInterval(mainTimerRef.current);
    clearInterval(inactivityIntervalRef.current);
    clearTimeout(deletionTimeoutRef.current);
    setPhase("complete");
  };

  const handlePublish = async () => {
    if (!user || text.length === 0 || isPublishing || !title.trim()) return;
    
    setIsPublishing(true);
    const wordCount = text.trim().split(/\s+/).length;
    const auraGained = Math.floor(wordCount / 5);

    const newAchievements = [];
    if (wordCount >= 200) newAchievements.push("yapper");
    if (isHardcore && Math.floor(timerInitialRef.current / 60) >= 3 && wordCount > 0) newAchievements.push("aint-no-way");
    if (typeof window !== "undefined" && window.innerWidth <= 768) newAchievements.push("touch-grass");
    
    const currentAchievements = user.earnedAchievements || [];
    const combinedAchievements = Array.from(new Set([...currentAchievements, ...newAchievements]));

    try {
      if (isDailyMode && dailyDate) {
        // ── Daily Prompt Flow ───────────────────────────────────────────────
        // 1. Get the daily_prompt row id for today
        const { data: promptRow } = await supabase
          .from("daily_prompts")
          .select("id")
          .eq("prompt_date", dailyDate)
          .single();

        if (!promptRow) throw new Error("Daily prompt row not found");

        // 2. Update the pending daily submission row
        const { error: subError } = await supabase
          .from("daily_submissions")
          .update({
            title: title.trim(),
            content: text.trim(),
            word_count: wordCount,
            submitted: true,
          })
          .eq("daily_prompt_id", promptRow.id)
          .eq("author_id", user.uid);

        if (subError) throw subError;

        // 3. Update participant_count on daily_prompts
        await supabase.rpc("increment_participant_count", { prompt_date_val: dailyDate }).catch(() => {});

        // 4. Update profile: streak, xp, words
        const todayUTC = dailyDate;
        const lastDailyDate = user.lastDailyDate ?? null;
        const yesterday = new Date(Date.UTC(
          new Date().getUTCFullYear(),
          new Date().getUTCMonth(),
          new Date().getUTCDate() - 1
        )).toISOString().split("T")[0];

        let newStreak = user.currentStreak || 0;
        if (lastDailyDate === yesterday) {
          newStreak += 1;
        } else if (lastDailyDate !== todayUTC) {
          // It's not yesterday and not today, so streak is broken
          newStreak = 1;
        }
        
        const newAura = (user.aura || 0) + auraGained;
        const newLongestStreak = Math.max(newStreak, user.longestStreak || 0);

        const profileUpdate = {
          total_words: (user.totalWords || 0) + wordCount,
          aura: newAura,
          total_stories: (user.totalStories || 0) + 1,
          level: Math.floor(newAura / 500) + 1,
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          last_daily_date: todayUTC,
          earned_achievements: combinedAchievements,
        };

        await supabase
          .from("profiles")
          .update(profileUpdate)
          .eq("id", user.uid);

        // Update local state so UI reflects changes immediately after redirect
        if (updateLocalUser) {
          updateLocalUser({
            totalWords: profileUpdate.total_words,
            aura: profileUpdate.aura,
            totalStories: profileUpdate.total_stories,
            level: profileUpdate.level,
            currentStreak: profileUpdate.current_streak,
            longestStreak: profileUpdate.longest_streak,
            lastDailyDate: todayUTC,
            earnedAchievements: combinedAchievements,
          });
        }

        router.push("/daily");
      } else {
        // ── Regular Sprint Flow ─────────────────────────────────────────────
        // 1. Save Story
        const { error: storyError } = await supabase.from("stories").insert({
          author_id: user.uid,
          author_username: user.username,
          is_pro_user: user.tier === "pro",
          title: title.trim(),
          content: text.trim(),
          starter_sentence: prompt?.text || "",
          word_count: wordCount,
          category: saveCategory,
          time_mode: Math.floor(timerInitialRef.current / 60),
          net_score: 0,
          upvoters: [],
          downvoters: [],
          is_hidden: false,
          chain_part: 1,
        });

        if (storyError) throw storyError;

        const newAura = (user.aura || 0) + auraGained;
        const profileUpdate = {
          total_words: (user.totalWords || 0) + wordCount,
          aura: newAura,
          total_stories: (user.totalStories || 0) + 1,
          level: Math.floor(newAura / 500) + 1,
          earned_achievements: combinedAchievements,
        };

        const { error: profileError } = await supabase
          .from("profiles")
          .update(profileUpdate)
          .eq("id", user.uid);

        if (profileError) throw profileError;

        if (updateLocalUser) {
          updateLocalUser({
            totalWords: profileUpdate.total_words,
            aura: profileUpdate.aura,
            totalStories: profileUpdate.total_stories,
            level: profileUpdate.level,
            earnedAchievements: combinedAchievements,
          });
        }

        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Error publishing sprint:", err);
      
      // Basic offline fallback (only for regular mode)
      if (!isDailyMode) {
        try {
          const offlineSprints = JSON.parse(localStorage.getItem('offline_sprints') || '[]');
          offlineSprints.push({
            title: title || "Untitled Sprint (Offline)",
            content: text.trim(),
            starter_sentence: prompt?.text || "",
            word_count: text.trim().split(/\s+/).length,
            category: saveCategory,
            time_mode: Math.floor(timerInitialRef.current / 60),
            timestamp: Date.now()
          });
          localStorage.setItem('offline_sprints', JSON.stringify(offlineSprints));
          alert("We couldn't reach the server, so we saved your Sprint offline! Check your dashboard later to sync.");
          router.push("/dashboard");
        } catch (storageErr) {
          console.error("Offline storage failed:", storageErr);
        }
      } else {
        alert("Failed to save your daily sprint. Please try again.");
      }
      
      setIsPublishing(false);
    }
  };

  const handleShare = async () => {
    const node = document.getElementById("receipt-card");
    if (!node) return;
    
    try {
      const { toBlob } = await import("html-to-image");
      const blob = await toBlob(node, { 
        quality: 1, 
        pixelRatio: 2,
        fontEmbedCSS: '', 
        filter: (el) => {
          if (el.classList?.contains('ninja-cursor-wrapper')) return false;
          if (el.tagName === 'SCRIPT') return false;
          return true;
        }
      });

      if (!blob) throw new Error("Image generation failed");
      
      const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
      const fileName = `keyboardsprint_${Date.now()}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });
      
      const canShare = typeof navigator !== "undefined" && navigator.share && navigator.canShare?.({ files: [file] });

      if (canShare) {
        try {
          await navigator.share({
            title: "KeyboardSprint Status",
            text: `I just wrote ${wordCount} words in ${Math.floor(timerInitialRef.current / 60)} minutes!`,
            files: [file],
          });
          return; // Success, user handled it via native menu
        } catch (shareErr) {
          // If the error is NOT a user cancel (AbortError), proceed to download fallback
          if (shareErr.name === 'AbortError') return; 
          console.error("Native share failed, using download fallback:", shareErr);
        }
      }

      // Download Fallback (for non-supporting browsers or shared failures)
      const dataUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = fileName;
      link.href = dataUrl;
      link.click();
      setTimeout(() => URL.revokeObjectURL(dataUrl), 2000);
      
    } catch(err) {
      console.error("Oops, saving failed:", err);
      alert("We couldn't save the image. You can try taking a screenshot or use a different browser!");
    }
  };

  // Vanish Logic loop
  useEffect(() => {
    if (phase !== "active") return;

    inactivityIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastKeypressRef.current;
      setInactivityMs(elapsed);

      // Recursive deletion loop using timeout so we can vary the speed
      if (elapsed > VANISH_TRIGGER_MS) {
        if (isHardcore) {
          setText("");
          setInactivityMs(0);
          lastKeypressRef.current = Date.now();
        } else {
          if (!deletionTimeoutRef.current) {
            const runDeletion = () => {
              const timeSinceTrigger = Date.now() - lastKeypressRef.current - VANISH_TRIGGER_MS;
              
              const speedMs = Math.max(
                MIN_DELETE_MS,
                MIN_DELETE_MS + (BASE_DELETE_MS - MIN_DELETE_MS) * Math.exp(-0.001 * timeSinceTrigger)
              );

              setText((curr) => curr.length > 0 ? curr.slice(0, -1) : "");

              deletionTimeoutRef.current = setTimeout(runDeletion, speedMs);
            };
            runDeletion();
          }
        }
      } else {
        if (deletionTimeoutRef.current) {
          clearTimeout(deletionTimeoutRef.current);
          deletionTimeoutRef.current = null;
        }
      }
    }, 50); // fast polling for UI responsiveness

    return () => {
      clearInterval(inactivityIntervalRef.current);
      clearTimeout(deletionTimeoutRef.current);
    };
  }, [phase]);

  const handleTextChange = (e) => {
    const newVal = e.target.value;
    
    if (isHardcore) {
      if (newVal.length < text.length) return; 
    } else {
      const lockedLength = getLockedLength();
      if (newVal.length < lockedLength && newVal.length < text.length) return;
    }

    setText(newVal);
    
    lastKeypressRef.current = Date.now();
    setInactivityMs(0);
    setIsTyping(true);

    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => setIsTyping(false), 2000);
  };

  // Lock Caret to prevent moving into old sentences and kill all edits
  const handleKeyDown = (e) => {
    if (isHardcore) {
      if (e.key === "Backspace" || e.key === "Delete") { e.preventDefault(); return; }
      const navKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"];
      if (navKeys.includes(e.key)) { e.preventDefault(); return; }
    } else {
      const lockedLen = getLockedLength();
      if (e.key === "Backspace" && textAreaRef.current.selectionStart <= lockedLen) { e.preventDefault(); return; }
      if ((e.key === "ArrowLeft" || e.key === "ArrowUp") && textAreaRef.current.selectionStart <= lockedLen) { e.preventDefault(); return; }
    }
  };

  const handleSelect = (e) => {
    const el = e.target;
    if (isHardcore) {
      setTimeout(() => { el.setSelectionRange(text.length, text.length); }, 0);
    } else {
      const lockedLen = getLockedLength();
      if (el.selectionStart < lockedLen || el.selectionEnd < lockedLen) {
        setTimeout(() => { el.setSelectionRange(text.length, text.length); }, 0);
      }
    }
  };

  const scrollRafRef = useRef(null);
  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    // Defer to next animation frame so the scroll sync doesn't race with
    // React's re-render triggered by the same keystroke — this eliminates
    // the screen shake when the cursor wraps to a new line.
    if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
    scrollRafRef.current = requestAnimationFrame(() => {
      if (scrollSyncRef.current) {
        scrollSyncRef.current.scrollTop = scrollTop;
      }
    });
  };

  const startSprint = async () => {
    let selectedPrompt;
    if (isDailyMode && dailyPromptData) {
      // Daily mode: use the locked daily prompt
      selectedPrompt = dailyPromptData;
    } else if (user?.tier === "pro" && isCustomPrompt && userPrompt.trim()) {
      selectedPrompt = { id: "custom", text: userPrompt.trim(), category: "custom" };
    } else {
      selectedPrompt = getRandomPrompt(user?.tier === "pro" ? category : "all");
    }

    // Daily mode: always 3 min
    let finalTime = isDailyMode ? 3 * 60 : timeMode * 60;
    if (!isDailyMode && user?.tier === "pro" && userTime) {
      const parsed = parseInt(userTime);
      if (!isNaN(parsed) && parsed > 0) {
        finalTime = parsed * 60;
      }
    }

    setPrompt(selectedPrompt);
    setTimeLeft(finalTime);
    setTimerInitial(finalTime);
    setText("");
    setPhase("active");
    setInactivityMs(0);
    lastKeypressRef.current = Date.now();

    setTimeout(() => {
      textAreaRef.current?.focus();
    }, 100);

    // Anti-Reroll & Daily Progress Implementation
    try {
      const { supabase } = await import("@/lib/supabase");
      
      // Increment sprints_today right as timer starts
      await supabase
        .from("profiles")
        .update({ sprints_today: (user.sprintsToday || 0) + 1 })
        .eq("id", user.uid);
        
      if (updateLocalUser) {
        updateLocalUser({ sprintsToday: (user.sprintsToday || 0) + 1 });
      }

      // If daily mode, insert the pending daily record
      if (isDailyMode && dailyDate) {
        const { data: promptRow } = await supabase
          .from("daily_prompts")
          .select("id")
          .eq("prompt_date", dailyDate)
          .single();

        if (promptRow) {
          await supabase.from("daily_submissions").insert({
            daily_prompt_id: promptRow.id,
            author_id: user.uid,
            author_username: user.username,
            is_pro_user: user.tier === "pro",
            submitted: false,
            title: "Pending...",
            content: "Pending...",
            word_count: 0
          });
        }
      }
    } catch (e) {
      console.error("Failed to intialize sprint server data:", e);
    }
  };

  const [timerInitial, setTimerInitial] = useState(0);
  const timerInitialRef = useRef(0);
  useEffect(() => {
    timerInitialRef.current = timerInitial;
  }, [timerInitial]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const renderTextOverlay = () => {
    const segments = text.split(/(?<=[.?!])\s+/);
    return segments.map((segment, index) => {
      const isBlurred = index < segments.length - 1;
      return (
        <span key={index} className={`${styles.fogSegment} ${isBlurred ? styles.blurred : ""}`}>
          {segment}
          {index < segments.length - 1 ? " " : ""}
        </span>
      );
    });
  };

  // Determine Countdown number
  let countdownNumber = null;
  if (phase === "active" && inactivityMs > VANISH_WARNING_MS && inactivityMs < VANISH_TRIGGER_MS) {
    countdownNumber = Math.ceil((VANISH_TRIGGER_MS - inactivityMs) / 1000);
  }

  // Determine Background Colors
  let bgClass = "";
  if (phase === "active") {
    if (inactivityMs > VANISH_TRIGGER_MS) bgClass = styles.dangerZone;
    else if (inactivityMs > VANISH_WARNING_MS) bgClass = styles.warningZone;
  }

  if (loading || !user) return <div className="spinner" style={{ margin: "100px auto" }} />;

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  if (phase === "setup") {
    const hasHitLimit = !isDailyMode && user?.tier !== "pro" && (user?.sprintsToday || 0) >= 100;

    return (
      <div className={styles.sprintPage}>
        <div className={styles.setup}>
          <div className={styles.setupCard}>
            {isDailyMode ? (
              // ── Daily Mode Setup (prompt is hidden) ──
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center", marginBottom: "var(--space-xl)" }}>
                  <span style={{ fontSize: "1.1rem" }}>🗓️</span>
                  <span style={{ fontSize: "0.8rem", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)" }}>Daily Prompt</span>
                </div>

                {/* Sealed prompt box — no peeking */}
                <div style={{
                  padding: "32px 24px",
                  background: "var(--bg-secondary)",
                  borderRadius: "16px",
                  border: "1.5px dashed var(--border-strong)",
                  marginBottom: "var(--space-xl)",
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <span style={{ fontSize: "2rem", display: "block", marginBottom: "12px" }}>🔒</span>
                  <strong style={{ fontSize: "1rem", color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                    Prompt sealed
                  </strong>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                    It appears the moment the clock starts.<br />No reading ahead.
                  </p>
                </div>

                <p style={{ fontSize: "0.83rem", color: "var(--text-muted)", marginBottom: "var(--space-xl)" }}>
                  3 minutes · No rerolls · One submission per day
                </p>
                <button className="btn btn-primary" onClick={startSprint} style={{ padding: "16px 40px", fontSize: "1.1rem" }}>
                  ✍️ Start Writing
                </button>
                <div style={{ marginTop: "var(--space-md)" }}>
                  <Link href="/daily" style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    ← Back to Daily
                  </Link>
                </div>
              </>
            ) : (
              // ── Regular Mode Setup ──
              <>
                <h1>Prepare to sprint</h1>
                <p>Select your time. Do not stop typing.</p>

                <div className={styles.timeSelector}>
                  {TIME_MODES.map((mode) => {
                    const locked = mode.proOnly && user.tier !== "pro";
                    return (
                      <button
                        key={mode.value}
                        className={`${styles.timeBtn} ${timeMode === mode.value ? styles.active : ""} ${locked ? styles.locked : ""}`}
                        onClick={() => !locked && setTimeMode(mode.value)}
                        disabled={locked}
                      >
                        {mode.label} {locked && "🔒"}
                      </button>
                    );
                  })}
                </div>

                {user?.tier === "pro" && (
                  <div className={styles.proSetupSection}>
                    <div className={styles.customInputGroup}>
                      <div className={styles.proHeader}>
                        <span className={styles.proBadge}>Pro Feature</span>
                        <label>Custom Duration</label>
                      </div>
                      <div className={styles.customTimeInput}>
                        <input 
                          type="number" 
                          min="1" 
                          max="1440" 
                          placeholder="Min"
                          value={userTime}
                          onChange={(e) => {
                            setUserTime(e.target.value);
                            setTimeMode(0);
                          }}
                        />
                        <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>minutes</span>
                      </div>
                    </div>

                    <div className={styles.customInputGroup}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <div className={styles.proHeader}>
                          <span className={styles.proBadge}>Pro Feature</span>
                          <label>Custom Prompt</label>
                        </div>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem" }}>
                          <input 
                            type="checkbox" 
                            checked={isCustomPrompt} 
                            onChange={(e) => setIsCustomPrompt(e.target.checked)} 
                          />
                          Enable
                        </label>
                      </div>
                      {isCustomPrompt && (
                        <textarea 
                          className={styles.customPromptInput}
                          placeholder="Type your own starter sentence..."
                          value={userPrompt}
                          onChange={(e) => setUserPrompt(e.target.value)}
                        />
                      )}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: "24px", padding: "16px", backgroundColor: "var(--bg-elevated)", borderRadius: "8px", border: "1px solid var(--border)", textAlign: "left" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", fontWeight: "600", fontSize: "1.05rem" }}>
                    <input 
                      type="checkbox" 
                      checked={isHardcore} 
                      onChange={(e) => setIsHardcore(e.target.checked)} 
                      style={{ width: "18px", height: "18px", accentColor: "var(--danger)" }}
                    />
                    Enable Hardcore Mode
                  </label>
                  <p style={{ marginTop: "8px", fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: 0 }}>
                    No backspace. No editing. If you pause for 5 seconds, everything is instantly destroyed.
                  </p>
                </div>

                {hasHitLimit ? (
                  <div style={{ marginTop: "var(--space-xl)", padding: "24px", background: "var(--bg-secondary)", borderRadius: "12px", border: "1px solid var(--border)", textAlign: "center" }}>
                    <span style={{ fontSize: "1.8rem", display: "block", marginBottom: "12px" }}>🛑</span>
                    <strong style={{ fontSize: "1.1rem", color: "var(--text-primary)", display: "block", marginBottom: "8px" }}>Daily Limit Reached</strong>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: "0 auto 16px auto", maxWidth: "280px", lineHeight: 1.5 }}>
                      You have run out of free sprints for today. Upgrade to Pro for infinite writing.
                    </p>
                    <Link href="/pricing" className="btn btn-primary" style={{ padding: "12px 24px", textDecoration: "none", display: "inline-block" }}>
                      ✨ Upgrade to Pro
                    </Link>
                  </div>
                ) : (
                  <button className="btn btn-primary" onClick={startSprint} style={{ padding: "16px 40px", fontSize: "1.1rem", marginTop: "var(--space-xl)" }}>
                    Start Writing
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "active") {
    return (
      <div className={`${styles.sprintPage} ${bgClass}`}>
        {/* Countdown Visualizer Overlay */}
        {countdownNumber && (
          <div className={styles.countdownOverlay}>
            <span key={countdownNumber} className={styles.countdownText}>{countdownNumber}</span>
          </div>
        )}

        <div className={styles.sprintActive}>
          
          <div className={styles.sprintHeader}>
            <div className={`${styles.timer} ${timeLeft <= 30 ? styles.timerUrgent : ""}`}>
              {formatTime(timeLeft)}
            </div>
            <div className={styles.promptDisplay}>
              {isDailyMode && <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", marginRight: "8px" }}>🗓️ DAILY</span>}
              &ldquo;{prompt?.text}&rdquo;
              {!isDailyMode && (
                <button 
                  className={styles.rerollBtn}
                  onClick={handleReroll}
                  disabled={user?.tier !== "pro" && rerolls <= 0}
                  title={user?.tier === "pro" ? "Infinite Rerolls (Pro)" : `${rerolls} rerolls remaining`}
                >
                  ↻ {user?.tier !== "pro" && <span>{rerolls}</span>}
                </button>
              )}
            </div>
            <div className={styles.timer} style={{ textAlign: "right" }}>
              {wordCount} w
            </div>
          </div>

          <div className={styles.writingArea}>
            <div className={styles.textOverlay} ref={scrollSyncRef}>
              {renderTextOverlay()}
            </div>
            
            <textarea
              ref={textAreaRef}
              className={styles.textArea}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              onSelect={handleSelect}
              onClick={handleSelect}
              onScroll={handleScroll}
              onPaste={(e) => e.preventDefault()}
              placeholder="The page is blank. Go."
              autoFocus
              spellCheck="false"
            />

            <NinjaCursor 
              targetRef={textAreaRef}
              isActive={isTyping || document.activeElement === textAreaRef.current} 
            />
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className={styles.sprintPage}>
      <div className={styles.complete}>
        <div className={styles.completeCard}>
          <span className={styles.completeIcon}>🖋️</span>
          <h1 style={isHardcore && wordCount === 0 ? { color: "var(--danger)" } : {}}>
            {isHardcore && wordCount === 0 ? "Major skill issue detected." : "Time's Up"}
          </h1>
          
          <div className={styles.completeStats}>
            <div className={styles.completeStat}>
              <strong>{wordCount}</strong>
              <span>Words</span>
            </div>
            <div className={styles.completeStat}>
              <strong>{Math.floor(timerInitial / 60)}:00</strong>
              <span>Time</span>
            </div>
            <div className={styles.completeStat}>
              <strong style={{ color: "var(--success)" }}>+{Math.floor(wordCount / 5)}</strong>
              <span>Aura</span>
            </div>
          </div>

          <div style={{ margin: "32px 0", textAlign: "left", display: "flex", flexDirection: "column", gap: "16px" }}>
             <div className="input-group">
                <label className="input-label">Story Title</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Give your sprint a name..." 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
             </div>
             
             <div className="input-group">
                <label className="input-label">Category</label>
                <select 
                  className="input"
                  value={saveCategory}
                  onChange={(e) => setSaveCategory(e.target.value)}
                >
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
             </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center" }}>
            <button 
              className="btn btn-primary" 
              onClick={handlePublish}
              disabled={isPublishing}
            >
              {isPublishing ? "Publishing..." : isDailyMode ? "Submit Daily Sprint" : "Publish & Go to Dashboard"}
            </button>
            <button className="btn btn-secondary" onClick={handleShare}>
              Save / Share Image 📸
            </button>
            {!isDailyMode && (
              <button className="btn btn-ghost text-muted" onClick={async () => {
                try {
                  const { supabase } = await import("@/lib/supabase");
                  const currentAchievements = user?.earnedAchievements || [];
                  if (!currentAchievements.includes("negative-aura")) {
                    const combined = [...currentAchievements, "negative-aura"];
                    await supabase.from("profiles").update({ earned_achievements: combined }).eq("id", user?.uid);
                  }
                } catch(e) {}
                setPhase("setup");
              }}>
                Trash & Retry
              </button>
            )}
          </div>
          
          {/* HIDDEN NODE FOR IMAGE CAPTURE */}
          <div style={{ position: "fixed", top: 0, left: 0, opacity: 0, pointerEvents: "none", zIndex: -1 }}>
            <div id="receipt-card" style={{
              width: "450px",
              minHeight: "800px",
              padding: "60px 50px",
              background: theme === "dark" ? "#121110" : "#FBF7F2",
              boxSizing: "border-box",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center"
            }}>
              
              
              {prompt?.text && (
                <div style={{
                  fontFamily: "'Lora', Georgia, serif",
                  fontSize: "1.1rem",
                  color: theme === "dark" ? "#807B75" : "#8B7355",
                  fontStyle: "italic",
                  textAlign: "center",
                  width: "100%",
                  maxWidth: "350px",
                  marginBottom: "40px",
                  position: "relative"
                }}>
                  "{prompt.text}"
                </div>
              )}
              
              <div style={{
                fontFamily: "'Source Serif 4', 'Georgia', serif",
                fontSize: "1.45rem",
                color: theme === "dark" ? "#EDE2D7" : "#271505",
                lineHeight: "1.7",
                textAlign: "left",
                width: "100%",
                maxWidth: "360px",
                display: "-webkit-box", 
                WebkitLineClamp: 14, 
                WebkitBoxOrient: "vertical", 
                overflow: "hidden",
                whiteSpace: "pre-wrap",
                position: "relative",
                zIndex: 2
              }}>
                {text || "..."}
              </div>
              
              <div style={{ 
                marginTop: "40px", 
                fontFamily: "'Lora', Georgia, serif",
                width: "100%", 
                maxWidth: "350px",
                textAlign: "right",
                color: theme === "dark" ? "#807B75" : "#8B7355",
                fontSize: "1.15rem",
                fontStyle: "italic"
              }}>
                 — @{user?.username || "writer"}
              </div>

              <div style={{ 
                position: "absolute", 
                bottom: "35px", 
                left: "0", 
                width: "100%", 
                textAlign: "center",
                fontFamily: "'Inter', sans-serif",
                color: theme === "dark" ? "#383532" : "#C4B493",
                fontSize: "0.8rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase"
              }}>
                 KeyboardSprints
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default function SprintPage() {
  return (
    <Suspense fallback={<div className="spinner" style={{ margin: "100px auto" }} />}>
      <SprintPageInner />
    </Suspense>
  );
}
