"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "./page.module.css";
import pricingStyles from "./pricing/pricing.module.css";
import MiniSprintDemo from "@/components/MiniSprintDemo";
import FogOfWarDemo from "@/components/FogOfWarDemo";
import BurnDemo from "@/components/BurnDemo";
import ScrollReveal from "@/components/ScrollReveal";
import PageShapes from "@/components/PageShapes";

const HandCircle = () => (
  <svg className={pricingStyles.circleSvg} viewBox="0 0 100 40" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      className={pricingStyles.circlePath} 
      d="M15,20 C15,10 85,5 85,20 C85,35 25,35 15,20 C10,10 40,5 60,8" 
    />
  </svg>
);

function ScribbleLine() {
  return (
    <svg className={`${styles.floatingSvg} ${styles.heroSvgLeft}`} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path className={styles.svgStroke} d="M10 90 Q 50 10, 90 90 T 170 90" fill="transparent" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
      <path className={styles.svgStroke} d="M30 110 Q 70 150, 110 110 T 190 110" fill="transparent" stroke="var(--text-muted)" strokeWidth="3" strokeLinecap="round" strokeDasharray="5,5" />
    </svg>
  );
}

function ScribbleCircle() {
  return (
    <svg className={`${styles.floatingSvg} ${styles.heroSvgRight}`} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path className={styles.svgStroke} d="M100 20 C 150 20, 180 50, 180 100 C 180 150, 150 180, 100 180 C 50 180, 20 150, 20 100 C 20 60, 40 30, 80 25" fill="transparent" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [authError, setAuthError] = useState("");



  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hashErr = hashParams.get("error_description") || hashParams.get("error");
      if (hashErr) setAuthError(decodeURIComponent(hashErr));
    }
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <PageShapes page="home" />
      {authError && (
        <div style={{ background: "red", color: "white", padding: 16, textAlign: "center", position: "relative", zIndex: 9999 }}>
          Login Error: {authError}
        </div>
      )}
      
      {/* ── Hero Section ── */}
      <section className={`${styles.hero} container`}>
        <ScribbleLine />
        <ScribbleCircle />
        
        <ScribbleLine />
        <ScribbleCircle />
        





        <div className={styles.heroInner}>
          <ScrollReveal animation="fadeUp" delay={0}>
            <div className={styles.heroBadge}>
              Train creativity, not productivity
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fadeUp" delay={100}>
            <h1 className={styles.heroTitle}>
              <span className={styles.heroLine}>The less you fear</span>
              <span className={styles.heroLine}>the better you write</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal animation="fadeUp" delay={200}>
            <p className={styles.heroSubtitle}>
              Your words disappear if you stop. So don&apos;t stop.
              Get a prompt, write for 3 minutes, and never look back.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="fadeUp" delay={300}>
            <div className={styles.heroCTA}>
              <Link href="/register" className="btn btn-primary btn-lg">
                Start Writing — It&apos;s Free
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Split Sections (How it works) ── */}
      <section className={styles.splitSection}>
        <div className={`container ${styles.splitGrid}`}>
          <div className={styles.splitContent}>
            <ScrollReveal animation="slideLeft" delay={100}>
              <h2>The perfect blank page.</h2>
              <p>
                We’ve stripped away every distraction. No formatting tools, no spellcheck, no word counts to obsess over. Just you, stark typography, and a blank canvas inspired by the cleanest editors in the world.
              </p>
              <ul className="text-secondary" style={{ listStyle: "none", display: "grid", gap: "12px", paddingLeft: 0 }}>
                <li>✓ Ultra-minimal Zenpen-style interface</li>
                <li>✓ Beautiful typography that makes words shine</li>
                <li>✓ Full-screen focus mode</li>
              </ul>
            </ScrollReveal>
          </div>
          <div className={styles.splitVisual}>
            <ScrollReveal animation="scaleUp" delay={200}>
              <MiniSprintDemo />
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className={`${styles.splitSection} ${styles.splitReverse}`}>
        <div className={`container ${styles.splitGrid}`}>
          <div className={styles.splitContent}>
            <ScrollReveal animation="slideRight" delay={100}>
              <h2>The Fog of War.</h2>
              <p>
                Perfectionism is the enemy of the first draft. In Sprinting Ink, as you type, your older sentences blur out like drying ink. You can&apos;t go back to edit them. You can only move forward.
              </p>
{/* <Link href="/feed" className="btn btn-secondary mt-4">
                Read the survivors
              </Link> */}
            </ScrollReveal>
          </div>
          <div className={styles.splitVisual} style={{ position: "relative" }}>
            <ScrollReveal animation="scaleUp" delay={200}>
              <svg style={{ position: "absolute", top: -40, left: -40, width: 100, zIndex: 0, opacity: 0.5 }} viewBox="0 0 100 100">
                <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="var(--bg-secondary)" />
              </svg>
              <FogOfWarDemo />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Feature 3: Pause and Burn ── */}
      <section className={styles.splitSection}>
        <div className={`container ${styles.splitGrid}`}>
          <div className={styles.splitContent}>
            <ScrollReveal animation="slideLeft" delay={100}>
              <h2>Keep moving or burn.</h2>
              <p>
                Hesitation is death. If you stop typing for 5 seconds, the screen bleeds red, and your current thought burns away forever. Sprinting Ink forces you to bypass your inner critic by making speed your only option.
              </p>
            </ScrollReveal>
          </div>
          <div className={styles.splitVisual} style={{ position: "relative" }}>
            <ScrollReveal animation="scaleUp" delay={200}>
              <BurnDemo />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className={styles.pricingTeaser}>
        <ScrollReveal animation="fadeUp" delay={0}>
          <div className="container">
            <div className={pricingStyles.pricingHeader}>
              <svg style={{ width: 60, margin: "0 auto 24px", color: "var(--accent)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <h2>Unlock your full creative potential</h2>
              <p>Our pricing is as minimal as our interface. Choose the plan that fits your writing journey.</p>
            </div>

            <div className={pricingStyles.plansWrapper}>
              <div className={pricingStyles.plansLineup}>

                <ScrollReveal animation="slideLeft" delay={100} className={pricingStyles.planCard}>
                  <div className={pricingStyles.planName}>Free Tier</div>
                  <div style={{ height: "24px" }}></div>

                  <ul className={pricingStyles.planFeatures}>
                    <li><span className={pricingStyles.checkIcon}>✓</span> 5 Sprints per day</li>
                    <li><span className={pricingStyles.checkIcon}>✓</span> 3-Minute Sprints</li>
                    <li><span className={pricingStyles.checkIcon}>✓</span> The Fog of War (Blur)</li>
                    <li><span className={pricingStyles.checkIcon}>✓</span> Pause and Burn (5s rule)</li>
                    <li><span className={pricingStyles.checkIcon}>✓</span> 2,000+ Standard Prompts</li>
                    <li><span className={pricingStyles.checkIcon}>✓</span> Global Story Feed</li>
                    <li><span className={pricingStyles.checkIcon}>✓</span> Public Leaderboard</li>
                    <li><span className={pricingStyles.checkIcon}>✓</span> XP & Leveling System</li>
                    <li><span className={pricingStyles.checkIcon}>✓</span> Daily Writing Streaks</li>
                    <li><span className={pricingStyles.checkIcon}>✓</span> Standard Text Export</li>
                  </ul>

                  <Link href="/register" style={{ textDecoration: "none" }}>
                    <button className={pricingStyles.planBtn}>Start Writing Free</button>
                  </Link>
                </ScrollReveal>

                <ScrollReveal animation="slideRight" delay={200} className={pricingStyles.planCard}>
                  <div className={pricingStyles.planName}>Pro Tier</div>
                  <div style={{ height: "24px" }}></div>

                  <div className={pricingStyles.handDrawnCircle}>
                    <HandCircle />
                    <span>The Ultimate Experience</span>
                  </div>

                  <ul className={pricingStyles.planFeatures}>
                    <li><span className={pricingStyles.checkIcon}>✓</span> Everything in Free, plus:</li>
                    <li><span className={pricingStyles.checkIcon}>✓</span> Unlimited daily sprints</li>
                    <li><span className={pricingStyles.checkIcon}>✓</span> 1, 2, 5 & 10 min modes</li>
                    <li><span className={pricingStyles.checkIcon}>✓</span> Custom Editor Themes</li>
                    <li><span className={pricingStyles.checkIcon}>✓</span> Advanced PDF Exports</li>
                    <li><span className={pricingStyles.checkIcon}>✓</span> Private Sprint Mode</li>
                    <li><span className={pricingStyles.checkIcon}>✓</span> Writing Heatmaps & Stats</li>
                    <li><span className={pricingStyles.checkIcon}>✓</span> Shiny Pro Identity</li>
                  </ul>

                  <Link href="/pricing" style={{ textDecoration: "none" }}>
                    <button className={`${pricingStyles.planBtn} ${pricingStyles.planBtnPrimary}`}>View Pro Plans</button>
                  </Link>
                </ScrollReveal>

              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1.5rem" }}>⌨️</span>
                <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", fontWeight: 700 }}>
                  sprinting<span style={{ color: "var(--accent)" }}> ink</span>
                </span>
              </div>
              <p>3-minute creative sprints to train your brain. Forget productivity, embrace creativity.</p>
            </div>

            <div className={styles.footerCol}>
              <h4>Explore</h4>
              <Link href="/feed">Story Feed</Link>
              <Link href="/leaderboard">Leaderboards</Link>
              <Link href="/pricing">Pricing</Link>
            </div>

            <div className={styles.footerCol}>
              <h4>Connect</h4>
              <Link href="/about">About Us</Link>
              <Link href="/search">Find Writers</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <span>© 2026 Sprinting Ink. All rights reserved.</span>
            <span>Minimalist design inspired by focus.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
