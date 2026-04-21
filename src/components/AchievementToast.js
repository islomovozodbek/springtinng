"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * AchievementToastManager
 *
 * Usage:
 *   const { showAchievementToasts } = useAchievementToasts();
 *   showAchievementToasts([{ id, icon, name, desc, auraReward }, ...]);
 *
 * Renders a stacked queue of toast cards that auto-dismiss.
 */

// ─── Hook ─────────────────────────────────────────────────────────────────────

let _setToasts = null; // module-level setter, set by the provider

export function useAchievementToasts() {
  const showAchievementToasts = useCallback((achievements) => {
    if (!_setToasts || !achievements?.length) return;
    _setToasts((prev) => [
      ...prev,
      ...achievements.map((a, i) => ({
        ...a,
        _key: `${Date.now()}_${i}`,
      })),
    ]);
  }, []);

  return { showAchievementToasts };
}

// ─── Provider / Renderer ──────────────────────────────────────────────────────

const DISMISS_DELAY = 4500; // ms before auto-dismiss

export function AchievementToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Expose setter globally so the hook can push toasts without prop-drilling
  useEffect(() => {
    _setToasts = setToasts;
    return () => {
      _setToasts = null;
    };
  }, []);

  const dismiss = (key) => {
    setToasts((prev) => prev.filter((t) => t._key !== key));
  };

  return (
    <>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          display: "flex",
          flexDirection: "column-reverse",
          gap: "12px",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => (
          <AchievementToastCard
            key={toast._key}
            toast={toast}
            onDismiss={() => dismiss(toast._key)}
          />
        ))}
      </div>
    </>
  );
}

// ─── Single Toast Card ────────────────────────────────────────────────────────

function AchievementToastCard({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Slight delay so the enter animation is visible
    const show = setTimeout(() => setVisible(true), 30);

    const hide = setTimeout(() => {
      setLeaving(true);
      setTimeout(onDismiss, 400);
    }, DISMISS_DELAY);

    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      onClick={() => {
        setLeaving(true);
        setTimeout(onDismiss, 400);
      }}
      style={{
        pointerEvents: "auto",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "14px 18px",
        borderRadius: "16px",
        background: "linear-gradient(135deg, var(--bg-elevated, #1e1d1b) 0%, var(--bg-secondary, #2a2826) 100%)",
        border: "1px solid var(--border-strong, rgba(255,255,255,0.12))",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,200,50,0.15)",
        minWidth: "280px",
        maxWidth: "340px",
        transform: visible && !leaving ? "translateX(0) scale(1)" : "translateX(80px) scale(0.92)",
        opacity: visible && !leaving ? 1 : 0,
        transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease",
        willChange: "transform, opacity",
        userSelect: "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Shimmer accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "linear-gradient(90deg, transparent, #f5c842, transparent)",
          animation: "shimmer 2s ease-in-out infinite",
        }}
      />

      {/* Icon bubble */}
      <div
        style={{
          fontSize: "1.8rem",
          lineHeight: 1,
          background: "linear-gradient(135deg, rgba(245,200,66,0.2), rgba(255,165,0,0.1))",
          borderRadius: "12px",
          padding: "10px",
          border: "1px solid rgba(245,200,66,0.25)",
          flexShrink: 0,
          animation: "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both",
        }}
      >
        {toast.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#f5c842",
            marginBottom: "3px",
          }}
        >
          Achievement Unlocked!
        </div>
        <div
          style={{
            fontSize: "0.95rem",
            fontWeight: 700,
            color: "var(--text-primary, #ede2d7)",
            marginBottom: "2px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {toast.name}
        </div>
        <div
          style={{
            fontSize: "0.76rem",
            color: "var(--text-muted, #807b75)",
            lineHeight: 1.4,
          }}
        >
          {toast.desc}
        </div>
      </div>

      {/* Aura badge */}
      <div
        style={{
          fontSize: "0.72rem",
          fontWeight: 800,
          color: "#f5c842",
          background: "rgba(245,200,66,0.12)",
          border: "1px solid rgba(245,200,66,0.3)",
          borderRadius: "20px",
          padding: "4px 10px",
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        +{toast.auraReward} ✨
      </div>

      {/* Keyframe styles */}
      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes popIn {
          from { transform: scale(0.5) rotate(-10deg); opacity: 0; }
          to   { transform: scale(1) rotate(0deg);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
