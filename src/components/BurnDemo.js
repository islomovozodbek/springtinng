"use client";

import { useState, useRef, useEffect } from "react";
import styles from "../app/page.module.css";
import sprintStyles from "../app/sprint/sprint.module.css";
import NinjaCursor from "./NinjaCursor";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

export default function BurnDemo() {
  const [text, setText] = useState(
    "I looked down at my hands. They were trembling. I didn't know what to do next. The silence in the room was deafening."
  );
  
  const textAreaRef = useRef(null);
  const scrollSyncRef = useRef(null);
  
  const [lastTyped, setLastTyped] = useState(null);
  const [isBurned, setIsBurned] = useState(false);
  const [dangerProgress, setDangerProgress] = useState(0); // 0 to 1

  // Start the timer only after user focuses or interacts for the first time
  const [isActive, setIsActive] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [ref, inView] = useIntersectionObserver({ threshold: 0.5, triggerOnce: true });

  // Auto-start timer when scrolled into view
  useEffect(() => {
    if (inView && !isActive && !userInteracted) {
      setTimeout(() => {
        setIsActive(true);
        setLastTyped(Date.now());
      }, 1000); // Wait 1 second before starting panic
    }
  }, [inView, isActive, userInteracted]);

  const deletionTimeoutRef = useRef(null);

  useEffect(() => {
    if (!isActive || isBurned) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const idleTime = now - (lastTyped || now);
      
      if (idleTime > 5000) {
        // Stop the inactivity interval and let the deletion loop take over
        clearInterval(interval);
        
        const runDeletion = () => {
          const timeSinceTrigger = Date.now() - (lastTyped || Date.now()) - 5000;
          
          // Match the real app's acceleration logic
          const speedMs = Math.max(
            100, // MIN_DELETE_MS
            100 + (300 - 100) * Math.exp(-0.001 * timeSinceTrigger)
          );

          setText((curr) => {
            if (curr.length <= 1) {
              setIsBurned(true);
              return "";
            }
            return curr.slice(0, -1);
          });

          deletionTimeoutRef.current = setTimeout(runDeletion, speedMs);
        };
        runDeletion();
      } else if (idleTime > 2000) {
        setDangerProgress((idleTime - 2000) / 3000);
      } else {
        setDangerProgress(0);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      clearTimeout(deletionTimeoutRef.current);
    };
  }, [isActive, lastTyped, isBurned]);

  const handleChange = (e) => {
    if (isBurned) return;
    clearTimeout(deletionTimeoutRef.current);
    if (!userInteracted) setUserInteracted(true);
    if (!isActive) {
      setIsActive(true);
    }
    setText(e.target.value);
    setLastTyped(Date.now());
    setIsTyping(true);
    clearTimeout(window.burnTypingTimeout);
    window.burnTypingTimeout = setTimeout(() => setIsTyping(false), 2000);
  };

  const handleFocus = () => {
    if (!userInteracted) setUserInteracted(true);
    if (!isActive && !isBurned) {
      setIsActive(true);
      setLastTyped(Date.now());
    }
  };

  const handleScroll = (e) => {
    if (scrollSyncRef.current) {
      scrollSyncRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const resetDemo = () => {
    setText("I looked down at my hands. They were trembling. I didn't know what to do next. The silence in the room was deafening.");
    setIsActive(false);
    setIsBurned(false);
    setDangerProgress(0);
    setLastTyped(null);
  }

  // Calculate dynamic styles
  const overlayBackground = `rgba(186, 38, 38, ${dangerProgress * 0.15})`;
  const textColor = isBurned ? "transparent" : dangerProgress > 0.5 ? "var(--danger)" : "var(--text-primary)";
  const textBlur = isBurned ? "blur(10px)" : `blur(${dangerProgress * 2}px)`;

  return (
    <div ref={ref} className={styles.browserWindow} style={{ 
      position: "relative",
      minHeight: "300px", 
      display: "flex", 
      flexDirection: "column",
      borderColor: isBurned ? "var(--danger)" : dangerProgress > 0.5 ? "var(--danger)" : "var(--border-strong)",
      transition: "border-color 0.3s ease"
    }}>
      <div className={styles.browserHeader} style={{ background: dangerProgress > 0 ? overlayBackground : "transparent" }}>
        <div className={styles.browserDot} style={{ background: "#FF5F56" }} />
        <div className={styles.browserDot} style={{ background: "#FFBD2E" }} />
        <div className={styles.browserDot} style={{ background: "#27C93F" }} />
        <span style={{ marginLeft: "8px", fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
          {isBurned ? "Session Lost" : isActive ? "5-Second Timer Active" : "Click to Start"}
        </span>
        {isBurned && (
          <button 
            onClick={resetDemo}
            style={{ marginLeft: "auto", background: "none", border: "1px solid var(--border)", color: "var(--text-primary)", padding: "2px 8px", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer" }}
          >
            Restart
          </button>
        )}
      </div>
      
      <div style={{ position: "relative", flex: 1, background: overlayBackground, transition: "background 0.3s" }}>
        <div
          ref={scrollSyncRef}
          style={{
            position: "absolute",
            inset: 0,
            padding: "40px",
            fontSize: "1.1rem",
            fontFamily: "var(--font-writing)",
            lineHeight: 1.8,
            color: textColor,
            filter: textBlur,
            transform: isBurned ? "translateY(-15px)" : "none",
            transition: isBurned ? "all 3s ease-out" : "color 0.3s, filter 0.3s",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            pointerEvents: "none",
            overflow: "hidden",
            fontVariantLigatures: "none",
            zIndex: 1
          }}
        >
          {text}
        </div>

        <textarea
          ref={textAreaRef}
          value={text}
          className="hideScrollbar"
          onChange={handleChange}
          onFocus={handleFocus}
          onScroll={handleScroll}
          spellCheck={false}
          readOnly={isBurned}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            inset: 0,
            padding: "40px",
            fontSize: "1.1rem",
            fontFamily: "var(--font-writing)",
            lineHeight: 1.8,
            border: "none",
            background: "transparent",
            outline: "none",
            resize: "none",
            color: "transparent",
            caretColor: "var(--text-primary)",
            fontVariantLigatures: "none",
            zIndex: 2,
          }}
        />

        {!isBurned && (
          <NinjaCursor 
            targetRef={textAreaRef}
            isActive={!isBurned && (isActive || isTyping || (typeof document !== 'undefined' && document.activeElement === textAreaRef.current))} 
          />
        )}
      </div>
    </div>
  );
}
