"use client";

import { useState, useRef, useEffect } from "react";
import styles from "../app/page.module.css";
import sprintStyles from "../app/sprint/sprint.module.css";
import NinjaCursor from "./NinjaCursor";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

export default function FogOfWarDemo() {
  const baseLine = "The spaceship's AI started telling jokes. ";
  const targetTyping = "Wait, why did the engineer stop the engine?";

  const [text, setText] = useState(baseLine);
  const [isActive, setIsActive] = useState(false);
  const [typingIndex, setTypingIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  
  const textAreaRef = useRef(null);
  const scrollSyncRef = useRef(null);
  const [ref, inView] = useIntersectionObserver({ threshold: 0.5, triggerOnce: true });

  // Auto-typing animation when scrolled into view
  useEffect(() => {
    if (inView && !isActive && typingIndex < targetTyping.length) {
      // Small initial delay before typing starts
      const startDelay = typingIndex === 0 ? 1000 : 0;
      
      const timeout = setTimeout(() => {
        setText(baseLine + targetTyping.substring(0, typingIndex + 1));
        setTypingIndex(typingIndex + 1);
        setIsTyping(true);
        clearTimeout(window.fogTypingTimeout);
        window.fogTypingTimeout = setTimeout(() => setIsTyping(false), 500);
      }, startDelay + Math.random() * 50 + 50); // Human-like typing speed
      
      return () => clearTimeout(timeout);
    }
  }, [inView, isActive, typingIndex]);

  const getLockedLength = () => {
    if (!text) return 0;
    const parts = text.split(/([.?!]+(?:\s+|$))/g);
    const sentences = [];
    for (let i = 0; i < parts.length; i += 2) {
      const sentence = parts[i];
      const punctuation = parts[i + 1] || "";
      if (sentence || punctuation) {
        sentences.push(sentence + punctuation);
      }
    }
    if (sentences.length <= 1) return 0;
    
    let lockedLength = 0;
    const isLastEmpty = sentences[sentences.length - 1].trim() === "";
    
    for (let i = 0; i < sentences.length; i++) {
        const isLast = i === sentences.length - 1 || (i === sentences.length - 2 && isLastEmpty);
        if (!isLast) {
            lockedLength += sentences[i].length;
        }
    }
    return lockedLength;
  };

  const handleChange = (e) => {
    const newVal = e.target.value;
    const lockedLength = getLockedLength();
    if (newVal.length < lockedLength && newVal.length < text.length) return;
    
    if (!isActive) setIsActive(true);
    setText(newVal);
    setIsTyping(true);
    clearTimeout(window.fogTypingTimeout);
    window.fogTypingTimeout = setTimeout(() => setIsTyping(false), 2000);
  };

  const handleFocus = () => {
    if (!isActive) setIsActive(true);
  };

  const handleSelect = (e) => {
    const lockedLen = getLockedLength();
    if (e.target.selectionStart < lockedLen) {
      e.target.selectionStart = lockedLen;
      if (e.target.selectionEnd < lockedLen) {
        e.target.selectionEnd = lockedLen;
      }
    }
  };

  const handleScroll = (e) => {
    if (scrollSyncRef.current) {
      scrollSyncRef.current.scrollTop = e.target.scrollTop;
    }
  };

  // Safe split by sentences (keeping delimiters attached to sentences if we can)
  const renderFogText = () => {
    if (!text) return null;
    
    // Simple naive split: match sentences ending with .?! followed by space or end of string
    const parts = text.split(/([.?!]+(?:\s+|$))/g);
    
    // parts will be alternating [sentence, punctuation, sentence, punctuation...]
    const sentences = [];
    for (let i = 0; i < parts.length; i += 2) {
      const sentence = parts[i];
      const punctuation = parts[i + 1] || "";
      if (sentence || punctuation) {
        sentences.push(sentence + punctuation);
      }
    }

    return sentences.map((sentence, i) => {
      const isLast = i === sentences.length - 1 || (i === sentences.length - 2 && sentences[sentences.length - 1].trim() === "");
      
      return (
        <span 
          key={i} 
          className={`${sprintStyles.fogSegment} ${!isLast ? sprintStyles.blurred : ""}`}
        >
          {sentence}
        </span>
      );
    });
  };

  return (
    <div ref={ref} className={styles.browserWindow} style={{ 
      position: "relative",
      minHeight: "300px", 
      display: "flex", 
      flexDirection: "column",
      borderColor: "var(--border-strong)"
    }}>
      <div className={styles.browserHeader}>
        <div className={styles.browserDot} style={{ background: "#FF5F56" }} />
        <div className={styles.browserDot} style={{ background: "#FFBD2E" }} />
        <div className={styles.browserDot} style={{ background: "#27C93F" }} />
        <span style={{ marginLeft: "8px", fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>Try it out</span>
      </div>
      
      <div style={{ position: "relative", flex: 1 }}>
        <div
          ref={scrollSyncRef}
          style={{
            position: "absolute",
            inset: 0,
            padding: "40px",
            fontSize: "1.1rem",
            fontFamily: "var(--font-writing)",
            lineHeight: 1.8,
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            pointerEvents: "none",
            overflow: "hidden",
            fontVariantLigatures: "none",
            zIndex: 1
          }}
        >
          {renderFogText()}
        </div>

        <textarea
          ref={textAreaRef}
          value={text}
          className="hideScrollbar"
          onChange={handleChange}
          onFocus={handleFocus}
          onScroll={handleScroll}
          onSelect={handleSelect}
          onClick={handleSelect}
          onKeyDown={(e) => {
            const lockedLen = getLockedLength();
            if (e.key === "Backspace" && textAreaRef.current.selectionStart <= lockedLen) { e.preventDefault(); return; }
            if ((e.key === "ArrowLeft" || e.key === "ArrowUp") && textAreaRef.current.selectionStart <= lockedLen) { e.preventDefault(); return; }
          }}
          spellCheck={false}
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

        <NinjaCursor 
          targetRef={textAreaRef}
          isActive={isTyping || (typeof document !== 'undefined' && document.activeElement === textAreaRef.current)} 
        />
      </div>
    </div>
  );
}
