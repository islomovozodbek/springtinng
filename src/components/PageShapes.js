"use client";

import { useState, useEffect } from "react";

/**
 * PageShapes — Zen background accent shapes
 *
 * Two shapes per page: one dominant, one subtle.
 * Homepage is left exactly as designed.
 */

import styles from "./PageShapes.module.css";

/* ── Seeded PRNG (Mulberry32 + FNV-1a hash) ── */
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function createRng(seed) {
  let s = (seed | 0) >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}


/* ══════════════════════════════════════════════
   SHAPE RENDERERS
   Each takes: { rng, posStyle, tier }
   tier: "dominant" | "subtle"
   ══════════════════════════════════════════════ */

/**
 * Enso — a gestural brushstroke circle that doesn't close.
 */
function Enso({ rng, posStyle, tier }) {
  const r = tier === "dominant" ? 90 + rng() * 30 : 55 + rng() * 20;
  const cx = r + 28;
  const cy = r + 28;
  const gapDeg = 22 + rng() * 18;
  const startA = 20 + rng() * 30;
  const sweepDeg = 360 - gapDeg;

  function toCart(angleDeg) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  }

  const [sx, sy] = toCart(startA);
  const [ex, ey] = toCart(startA + sweepDeg);
  const wx = ex + (rng() - 0.5) * 6;
  const wy = ey + (rng() - 0.5) * 6;
  const dashLen = Math.PI * 2 * r;
  const size = (r + 28) * 2;

  return (
    <svg
      className={`${styles[tier]} ${styles.ensoAnim}`}
      style={{ "--dash-len": dashLen, ...posStyle, width: size, height: size }}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d={`M${sx.toFixed(1)},${sy.toFixed(1)} A${r},${r} 0 1,1 ${wx.toFixed(1)},${wy.toFixed(1)}`}
        stroke="var(--shape-accent)"
        strokeWidth={tier === "dominant" ? "2.8" : "1.8"}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}


/**
 * Horizon — one long gently curving line. Static.
 */
function Horizon({ rng, posStyle, tier }) {
  const length = tier === "dominant" ? 480 + rng() * 160 : 260 + rng() * 100;
  const midY = 40 + (rng() - 0.5) * 16;
  const endY = 40 + (rng() - 0.5) * 10;

  return (
    <svg
      className={`${styles[tier]} ${styles.horizonStatic}`}
      style={{ ...posStyle, width: length + 40, height: 80 }}
      viewBox={`0 0 ${(length + 40).toFixed(0)} 80`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d={`M-20,40 Q${(length / 2).toFixed(0)},${midY.toFixed(1)} ${(length + 20).toFixed(0)},${endY.toFixed(1)}`}
        stroke="var(--shape-accent)"
        strokeWidth={tier === "dominant" ? "2.5" : "1.5"}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}


/**
 * Spiral — a hand-drawn looking spiral that draws outward
 */
function Spiral({ rng, posStyle, tier }) {
  const rMax = tier === "dominant" ? 140 + rng() * 40 : 80 + rng() * 30;
  const turns = 2.5 + rng() * 1.5;
  const points = [];
  const cx = rMax + 20;
  const cy = rMax + 20;
  
  const steps = 150;
  const maxAngle = turns * Math.PI * 2;
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = t * maxAngle;
    const r = (t * rMax) + (rng() - 0.5) * 4 * t;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
  }

  const d = points.join(" ");
  const size = (rMax + 20) * 2;
  const dashLen = Math.PI * rMax * turns * 1.5; // Approximation for animation

  return (
    <svg
      className={`${styles[tier]} ${styles.ensoAnim}`}
      style={{ "--dash-len": dashLen, ...posStyle, width: size, height: size }}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d={d}
        stroke="var(--shape-accent)"
        strokeWidth={tier === "dominant" ? "2.5" : "1.5"}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}



/**
 * BigArc — a quarter-to-third of a very large circle. Draws in, holds.
 */
function BigArc({ rng, posStyle, tier }) {
  const r = tier === "dominant" ? 140 + rng() * 60 : 80 + rng() * 30;
  const sweepDeg = 85 + rng() * 35;
  const startA = rng() * 25;

  function toCart(angleDeg) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return [r + 20 + r * Math.cos(rad), r + 20 + r * Math.sin(rad)];
  }

  const [sx, sy] = toCart(startA);
  const [ex, ey] = toCart(startA + sweepDeg);
  const rWobble = r * (1 + (rng() - 0.5) * 0.025);
  const dashLen = (sweepDeg / 360) * 2 * Math.PI * r + 20;
  const size = (r + 20) * 2;

  return (
    <svg
      className={`${styles[tier]} ${styles.arcAnim}`}
      style={{ "--dash-len": dashLen, ...posStyle, width: size, height: size }}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d={`M${sx.toFixed(1)},${sy.toFixed(1)} A${r},${rWobble.toFixed(1)} 0 0,1 ${ex.toFixed(1)},${ey.toFixed(1)}`}
        stroke="var(--shape-accent)"
        strokeWidth={tier === "dominant" ? "2.5" : "1.5"}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}


/**
 * DotPair — 2 or 3 dots, sparse, like punctuation on a blank page.
 */
function DotPair({ rng, posStyle }) {
  const count = 2 + (rng() > 0.55 ? 1 : 0);
  const spacing = 22 + rng() * 14;
  const baseR = 4 + rng() * 2;
  const totalW = spacing * (count - 1) + 20 + baseR * 2;

  return (
    <svg
      className={`${styles.subtle} ${styles.dotFade}`}
      style={{ ...posStyle, width: totalW, height: 30 }}
      viewBox={`0 0 ${totalW} 30`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, i) => (
        <circle
          key={i}
          cx={(10 + baseR + i * spacing + (rng() - 0.5) * 4).toFixed(1)}
          cy={(15 + (rng() - 0.5) * 4).toFixed(1)}
          r={(baseR + (rng() - 0.5) * 1.2).toFixed(1)}
          fill="var(--shape-accent)"
        />
      ))}
    </svg>
  );
}


/**
 * DotGrid9 — 3×3 grid of dots, slightly rotated. Fixed size, no rng needed.
 */
function DotGrid9({ posStyle }) {
  const spacing = 45, r = 5.5, total = 2 * r + 2 * spacing;
  const dots = [];
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 3; col++)
      dots.push(<circle key={`${row}-${col}`} cx={r + col * spacing} cy={r + row * spacing} r={r} fill="var(--shape-accent)" />);
  return (
    <svg
      className={styles.subtle}
      style={{ ...posStyle, width: total, height: total, transform: 'rotate(6deg)' }}
      viewBox={`0 0 ${total} ${total}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {dots}
    </svg>
  );
}


/**
 * VertStroke — a single tall vertical brushstroke, slightly imperfect.
 */
function VertStroke({ rng, posStyle, tier }) {
  const height = tier === "dominant" ? 260 + rng() * 80 : 140 + rng() * 60;
  const w1 = (rng() - 0.5) * 14;
  const w2 = (rng() - 0.5) * 10;
  const w3 = (rng() - 0.5) * 8;
  const cx = 20;

  const d = [
    `M${cx},6`,
    `Q${cx + w1},${(height * 0.33).toFixed(0)} ${cx + w2},${(height * 0.62).toFixed(0)}`,
    `Q${cx + (rng() - 0.5) * 8},${(height * 0.82).toFixed(0)} ${cx + w3},${(height - 6).toFixed(0)}`,
  ].join(" ");

  return (
    <svg
      className={`${styles[tier]} ${styles.vertStatic}`}
      style={{ ...posStyle, width: 40, height }}
      viewBox={`0 0 40 ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d={d}
        stroke="var(--shape-accent)"
        strokeWidth={tier === "dominant" ? "2.2" : "1.4"}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * TripleStroke — three thin, gestural horizontal lines. Static.
 */
function TripleStroke({ rng, posStyle, tier }) {
  const baseW = tier === "dominant" ? 140 + rng() * 60 : 100 + rng() * 40;
  const h = 45 + rng() * 15;

  const lines = [];
  for (let i = 0; i < 3; i++) {
    const w = baseW * (0.7 + rng() * 0.4);
    const y = 10 + i * (h / 2.5);
    const x = (baseW - w) / 2 + (rng() - 0.5) * 40;
    const wobble = (rng() - 0.5) * 10;
    lines.push(
      <path
        key={i}
        d={`M${x.toFixed(1)},${y.toFixed(1)} Q${(x + w / 2).toFixed(1)},${(y + wobble).toFixed(1)} ${(x + w).toFixed(1)},${y.toFixed(1)}`}
        stroke="var(--shape-accent)"
        strokeWidth={tier === "dominant" ? "2.2" : "1.2"}
        strokeLinecap="round"
        fill="none"
      />
    );
  }

  return (
    <svg
      className={`${styles[tier]} ${styles.horizonStatic}`}
      style={{ ...posStyle, width: baseW + 80, height: h + 20 }}
      viewBox={`0 0 ${baseW + 80} ${h + 20}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {lines}
    </svg>
  );
}


/* ══════════════════════════════════════════════
   PER-PAGE DESIGN
   Each page: { dominant, subtle } shape types
   ══════════════════════════════════════════════ */

const PAGE_DESIGNS = {
  home:        { dominant: "enso",         subtle: null },
  about:       { dominant: "bigArc",       subtle: "dotPair" },
  pricing:     { dominant: "enso",         subtle: "dotPair" },
  login:       { dominant: "horizon",      subtle: "dotPair" },
  register:    { dominant: "bigArc",       subtle: "dotPair" },
  feed:        { dominant: "bigArc",       subtle: "dotPair" },
  leaderboard: { dominant: "enso",         subtle: "dotGrid9" },
  dashboard:   { dominant: "bigArc",       subtle: null },
  achievements:{ dominant: "enso",         subtle: "vertStroke" },
  profile:     { dominant: "spiral",       subtle: "dotPair" },
  sprint:      { dominant: "bigArc",       subtle: "dotPair" },
  search:      { dominant: "tripleStroke", subtle: "dotPair" },
  settings:    { dominant: "enso",         subtle: "dotPair" },

  friends:     { dominant: "horizon",      subtle: "dotPair" },
  referral:    { dominant: "enso",         subtle: "dotPair" },
  "404":       { dominant: "horizon",      subtle: "dotPair" },
};

/* Dominant placement: always bleeds off an edge */
const DOMINANT_ANCHORS = [
  () => ({ top: "-8%",  right: "-6%" }),
  () => ({ bottom: "-6%", left: "-4%" }),
  () => ({ top: "-10%", left: "-8%" }),
  () => ({ bottom: "-8%", right: "-5%" }),
  () => ({ top: "28%",  right: "-10%" }),
  () => ({ top: "32%",  left: "-12%" }),
];

/* Subtle placement: inset, quiet corner */
const SUBTLE_ANCHORS = [
  () => ({ bottom: "14%", left:  "7%" }),
  () => ({ top:  "12%",  left:  "6%" }),
  () => ({ top:   "8%",  right: "8%" }),
  () => ({ bottom: "10%", right: "7%" }),
  () => ({ top:  "52%",  left:  "4%" }),
  () => ({ top:  "48%",  right: "5%" }),
];


/* ── Shape renderer switch ── */
function renderShape(type, rng, posStyle, tier, key) {
  switch (type) {
    case "enso":        return <Enso        key={key} rng={rng} posStyle={posStyle} tier={tier} />;
    case "horizon":     return <Horizon     key={key} rng={rng} posStyle={posStyle} tier={tier} />;
    case "spiral":      return <Spiral      key={key} rng={rng} posStyle={posStyle} tier={tier} />;
    case "bigArc":      return <BigArc      key={key} rng={rng} posStyle={posStyle} tier={tier} />;
    case "dotPair":     return <DotPair     key={key} rng={rng} posStyle={posStyle} />;
    case "dotGrid9":    return <DotGrid9    key={key} posStyle={posStyle} />;
    case "vertStroke":  return <VertStroke  key={key} rng={rng} posStyle={posStyle} tier={tier} />;
    case "tripleStroke":return <TripleStroke key={key} rng={rng} posStyle={posStyle} tier={tier} />;
    default:            return null;
  }
}


/* ══════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════ */
export default function PageShapes({ page = "home" }) {
  // Skip during SSR — shapes are purely decorative.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const design = PAGE_DESIGNS[page] ?? { dominant: "enso", subtle: "dotPair" };

  const seed = hashString(page);
  const rng  = createRng(seed);

  // Guarantee dominant and subtle always land on opposite horizontal sides.
  // DOMINANT_ANCHORS — left side: [1,2,5]  right side: [0,3,4]
  // SUBTLE_ANCHORS   — left side: [0,1,4]  right side: [2,3,5]
  const LEFT_DOM  = [1, 2, 5];
  const RIGHT_DOM = [0, 3, 4];
  const LEFT_SUB  = [0, 1, 4];
  const RIGHT_SUB = [2, 3, 5];

  const domOnLeft = rng() < 0.5;
  const domPool   = domOnLeft ? LEFT_DOM  : RIGHT_DOM;
  const subPool   = domOnLeft ? RIGHT_SUB : LEFT_SUB;

  const domIdx = domPool[Math.floor(rng() * domPool.length)];
  const subIdx = subPool[Math.floor(rng() * subPool.length)];

  let dominantPos = DOMINANT_ANCHORS[domIdx]();
  let subtlePos   = SUBTLE_ANCHORS[subIdx]();

  // Pricing page override for dot pair position
  if (page === "pricing") subtlePos = { bottom: "12%", right: "8%" };

  // About page override to move all shapes up
  if (page === "about") {
    if (dominantPos.bottom) {
      dominantPos.top = (parseInt(dominantPos.bottom) + 30) + "%";
      delete dominantPos.bottom;
    } else if (dominantPos.top) {
      dominantPos.top = (parseInt(dominantPos.top) - 15) + "%";
    }
    if (subtlePos.bottom) {
      subtlePos.top = (parseInt(subtlePos.bottom) + 20) + "%";
      delete subtlePos.bottom;
    } else if (subtlePos.top) {
      subtlePos.top = (parseInt(subtlePos.top) - 10) + "%";
    }
  }

  // Search page override to align lines with search bar
  if (page === "search") {
    dominantPos = { top: "25%", left: "6%" };
    subtlePos   = { bottom: "15%", right: "8%" };
  }

  const domRng = createRng(seed + 100);
  const subRng = createRng(seed + 200);

  return (
    <div className={styles.shapesContainer} aria-hidden="true">
      {renderShape(design.dominant, domRng, dominantPos, "dominant", `${page}-dominant`)}
      {design.subtle && renderShape(design.subtle, subRng, subtlePos, "subtle", `${page}-subtle`)}
    </div>
  );
}
