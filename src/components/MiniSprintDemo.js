"use client";

import { useState, useRef, useEffect } from "react";
import styles from "../app/page.module.css";
import sprintStyles from "../app/sprint/sprint.module.css";
import NinjaCursor from "./NinjaCursor";

export default function MiniSprintDemo() {
  const [text, setText] = useState(
    "The old man looked at the sea. It was the same sea he had watched for eighty years, but today it felt different. He reached into his pocket and pulled out the smooth, obsidian stone. It was warm to the touch"
  );
  
  const textAreaRef = useRef(null);
  const scrollSyncRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  const handleScroll = (e) => {
    if (scrollSyncRef.current) {
      scrollSyncRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    setIsTyping(true);
    clearTimeout(window.miniTypingTimeout);
    window.miniTypingTimeout = setTimeout(() => setIsTyping(false), 2000);
  };

  return (
    <div className={styles.browserWindow} style={{ 
      position: "relative",
      minHeight: "350px", 
      display: "flex", 
      flexDirection: "column"
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
            color: "var(--text-primary)", 
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
          onChange={handleTextChange}
          onScroll={handleScroll}
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
