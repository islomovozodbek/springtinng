"use client";

import { useState, useEffect, useRef } from "react";
import styles from "../app/feed/feed.module.css";

export default function StoryFocusView({ story, onClose }) {
  const [displayText, setDisplayText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);

  // Handle escape key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Playback effect
  useEffect(() => {
    if (isPlaying && playbackIndex < story.content.length) {
      const timeout = setTimeout(() => {
        setDisplayText(story.content.substring(0, playbackIndex + 1));
        setPlaybackIndex(playbackIndex + 1);
      }, 30 + Math.random() * 40); // Human-like speed
      return () => clearTimeout(timeout);
    } else if (!isPlaying) {
      setDisplayText(story.content);
    }
  }, [isPlaying, playbackIndex, story.content]);

  const togglePlayback = () => {
    if (!isPlaying) {
      setDisplayText("");
      setPlaybackIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      setDisplayText(story.content);
    }
  };

  return (
    <div className={styles.focusOverlay} onClick={onClose}>
      <div className={styles.focusContainer} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
        
        <div className={styles.focusHeader}>
          <div className={styles.focusMeta}>
            <span className={styles.focusAuthor}>@{story.authorUsername}</span>
            <span className={styles.focusDot}>•</span>
            <span className={styles.focusTime}>{story.wordCount} words</span>
            <span className={styles.focusDot}>•</span>
            <span className={styles.focusCategory}>{story.category}</span>
          </div>
          <button 
            className={`${styles.playbackBtn} ${isPlaying ? styles.isPlaying : ""}`}
            onClick={togglePlayback}
          >
            {isPlaying ? "⏹ Stop Playback" : "▶ Watch Writing Process"}
          </button>
        </div>

        <div className={styles.focusContent}>
          <div className={styles.focusPrompt}>&ldquo;{story.starterSentence}&rdquo;</div>
          <div className={styles.focusBody}>
            {displayText}
            {isPlaying && <span className={styles.focusCursor} />}
          </div>
        </div>

        <div className={styles.focusFooter}>
          <p>Press ESC to exit Zen mode</p>
        </div>
      </div>
    </div>
  );
}
