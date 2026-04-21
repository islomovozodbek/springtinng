"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './not-found.module.css';

const ATTEMPTS = [
  { text: "404 Page Not Found.", action: 'delete' },
  { text: "Error 404: Not Found.", action: 'strike' },
  { text: "The requested URL was not found.", action: 'delete' },
  { text: "HTTP 404 Not Found.", action: 'strike' },
  { text: "404. That's an error.", action: 'delete' },
  { text: "Just write anyway.", action: 'final' }
];

const TYPING_SPEED_MIN = 35;
const TYPING_SPEED_MAX = 70;
const DELETE_SPEED = 20;
const PAUSE_AFTER_TYPE = 800;
const PAUSE_AFTER_STRIKE = 600;
const PAUSE_AFTER_DELETE = 400;

export default function NotFound() {
  const [attemptIndex, setAttemptIndex] = useState(0);
  const [text, setText] = useState("");
  const [isStruck, setIsStruck] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [secondsWasted, setSecondsWasted] = useState(0);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsWasted(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Typer
  useEffect(() => {
    if (attemptIndex >= ATTEMPTS.length) return;

    let isCancelled = false;
    let timeoutId;
    const currentAttempt = ATTEMPTS[attemptIndex];

    const typeChar = (index) => {
      if (isCancelled) return;
      if (index <= currentAttempt.text.length) {
        setText(currentAttempt.text.substring(0, index));
        let delay = Math.random() * (TYPING_SPEED_MAX - TYPING_SPEED_MIN) + TYPING_SPEED_MIN;

        // Simulating human hesitation
        if (Math.random() < 0.05) delay += 300;

        // Initial pause before typing starts
        if (index === 0) delay += 400;

        timeoutId = setTimeout(() => typeChar(index + 1), delay);
      } else {
        timeoutId = setTimeout(handleAction, PAUSE_AFTER_TYPE);
      }
    };

    const handleAction = () => {
      if (isCancelled) return;
      if (currentAttempt.action === 'strike') {
        setIsStruck(true);
        timeoutId = setTimeout(() => {
          if (isCancelled) return;
          setIsStruck(false);
          setText("");
          setAttemptIndex(prev => prev + 1);
        }, PAUSE_AFTER_STRIKE);
      } else if (currentAttempt.action === 'delete') {
        deleteChar(currentAttempt.text.length);
      } else if (currentAttempt.action === 'final') {
        setTimeout(() => {
          if (!isCancelled) setShowNav(true);
        }, 1000);
      }
    };

    const deleteChar = (index) => {
      if (isCancelled) return;
      if (index >= 0) {
        setText(currentAttempt.text.substring(0, index));
        timeoutId = setTimeout(() => deleteChar(index - 1), DELETE_SPEED);
      } else {
        timeoutId = setTimeout(() => {
          if (!isCancelled) setAttemptIndex(prev => prev + 1);
        }, PAUSE_AFTER_DELETE);
      }
    };

    typeChar(0);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [attemptIndex]);

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isFinal = attemptIndex === ATTEMPTS.length - 1 && text === ATTEMPTS[ATTEMPTS.length - 1].text;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.rewriterContent}>
        <div className={styles.guiltTimer}>
          {formatTime(secondsWasted)} of writing time wasted.
        </div>

        <h1 className={`${styles.rewriterText} ${isStruck ? styles.struck : ''}`}>
          {text}
          {(!isFinal || (isFinal && !showNav)) && <span className={styles.cursor}>|</span>}
        </h1>

        {showNav && (
          <div className={`${styles.navHint} animate-fade-in-up`}>
            <Link href="/" className="btn btn-ghost text-muted">
              Return to your desk &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
