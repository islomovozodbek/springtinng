"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { PenTool, Star, Settings, Calendar, BookOpen, Trophy, ShoppingBag, Target, Search, Mail } from "lucide-react";
import styles from "./Navbar.module.css";
import NotificationsDropdown from "./NotificationsDropdown";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const { user } = useAuth();

  // Load initial theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
        <div className={styles.navInner}>
          {/* Logo */}
          <Link href={user && !user.needsOnboarding ? "/dashboard" : (user?.needsOnboarding ? "#" : "/")} className={styles.logo} onClick={closeMobile} style={{ cursor: user?.needsOnboarding ? "default" : "pointer" }}>
            <span className={styles.logoText}>
              sprinting<span className={styles.logoHighlight}>.ink</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <ul className={styles.navLinks}>
            {user ? (
              !user.needsOnboarding ? (
                <>
                <li>
                  <Link href="/sprint" className={styles.navLink}>Sprint</Link>
                </li>
                <li>
                  <Link href="/daily" className={styles.navLink} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    Daily
                    <span style={{
                      display: "inline-block", width: "7px", height: "7px",
                      borderRadius: "50%", background: "var(--success)",
                      animation: "pulse-dot-nav 2s ease-in-out infinite",
                      flexShrink: 0
                    }} />
                  </Link>
                </li>
                <li>
                  <Link href="/feed" className={styles.navLink}>Feed</Link>
                </li>
                <li>
                  <Link href="/leaderboard" className={styles.navLink}>Leaderboards</Link>
                </li>

                <li>
                  <Link href="/search" className={styles.navLink}>Search</Link>
                </li>
              </>
              ) : null
            ) : (
              <>
                <li>
                  <Link href="/feed" className={styles.navLink}>Feed</Link>
                </li>
                <li>
                  <Link href="/leaderboard" className={styles.navLink}>Leaderboards</Link>
                </li>
                <li>
                  <Link href="/pricing" className={styles.navLink}>Pricing</Link>
                </li>
                <li>
                  <Link href="/about" className={styles.navLink}>About</Link>
                </li>
              </>
            )}
          </ul>

          {/* Desktop Actions */}
          <div className={styles.navActions}>
            {user ? (
              !user.needsOnboarding ? (
                <>
                  <Link href={`/profile/${user.username}`} className={styles.auraBadge}>
                    <span className={styles.auraIcon}><Star size={14} fill="currentColor" /></span>
                    <span style={{ marginTop: "1px" }}>{user.aura || 0}</span>
                  </Link>
                  <NotificationsDropdown />
                  <Link href="/settings" className="btn btn-ghost btn-sm" style={{ padding: "8px", color: "var(--text-secondary)" }}>
                    <Settings size={20} />
                  </Link>
                  <Link href={`/profile/${user.username}`} style={{ display: "flex", alignItems: "center" }}>
                    <div className="avatar avatar-sm" style={{ border: "1.5px solid var(--border)", transition: "all 0.2s ease" }}>
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="Avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                      ) : (
                        (user.username || "U")[0].toUpperCase()
                      )}
                    </div>
                  </Link>
                </>
              ) : null
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost btn-sm">
                  Log in
                </Link>
                <Link href="/register" className="btn btn-primary btn-sm">
                  Sign up
                </Link>
              </>
            )}

            {/* Ultra-Minimal Physics Toggle */}
            <div 
              className={`${styles.minimalToggle} ${theme === "dark" ? styles.isDark : ""}`}
              onClick={toggleTheme}
              role="button"
              aria-label="Toggle Theme"
            >
              <motion.div
                className={styles.minimalKnob}
                animate={{ x: theme === "dark" ? 22 : 0 }}
                transition={{ type: "spring", stiffness: 700, damping: 35 }}
                drag="x"
                dragConstraints={{ left: 0, right: 22 }}
                dragElastic={0}
                dragMomentum={false}
                onDragEnd={(e, { point, offset }) => {
                  const threshold = 11;
                  if (theme === "light" && offset.x > threshold) {
                    toggleTheme();
                  } else if (theme === "dark" && offset.x < -threshold) {
                    toggleTheme();
                  }
                }}
              />
            </div>
          </div>

          <button
            className={styles.menuBtn}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <div className={`${styles.menuIcon} ${mobileOpen ? styles.menuIconOpen : ""}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Overlay */}
      <div
        className={`${styles.mobileOverlay} ${mobileOpen ? styles.open : ""}`}
        onClick={closeMobile}
      />

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${mobileOpen ? styles.open : ""}`}>
        {user ? (
          <>
            <Link href="/sprint" className={styles.navLink} onClick={closeMobile}><div style={{display: 'flex', alignItems: 'center', gap: '8px'}}><PenTool size={16} /> Sprint</div></Link>
            <Link href="/daily" className={styles.navLink} onClick={closeMobile}><div style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Calendar size={16} /> Daily Prompt</div></Link>
            <Link href="/feed" className={styles.navLink} onClick={closeMobile}><div style={{display: 'flex', alignItems: 'center', gap: '8px'}}><BookOpen size={16} /> Feed</div></Link>
            <Link href="/leaderboard" className={styles.navLink} onClick={closeMobile}><div style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Trophy size={16} /> Leaderboards</div></Link>

            <Link href="/achievements" className={styles.navLink} onClick={closeMobile}><div style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Target size={16} /> Achievements</div></Link>
            <Link href="/search" className={styles.navLink} onClick={closeMobile}><div style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Search size={16} /> Search</div></Link>
            <Link href="/referral" className={styles.navLink} onClick={closeMobile}><div style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Mail size={16} /> Referrals</div></Link>
            <div className={styles.navActions} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "0 16px" }}>
              <Link href={`/profile/${user.username}`} className={styles.auraBadge}>
                <span className={styles.auraIcon}><Star size={14} fill="currentColor" /></span>
                {user.aura || 0}
              </Link>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <NotificationsDropdown />
                <Link href="/settings" className="btn btn-secondary" onClick={closeMobile}>Settings</Link>
                <Link href={`/profile/${user.username}`} className="btn btn-primary" onClick={closeMobile}>Profile</Link>
              </div>
            </div>
          </>
        ) : (
          <>
            <Link href="/feed" className={styles.navLink} onClick={closeMobile}>Feed</Link>
            <Link href="/leaderboard" className={styles.navLink} onClick={closeMobile}>Leaderboards</Link>
            <Link href="/pricing" className={styles.navLink} onClick={closeMobile}>Pricing</Link>
            <Link href="/about" className={styles.navLink} onClick={closeMobile}>About</Link>
            <div className={styles.navActions}>
              <Link href="/login" className="btn btn-secondary" onClick={closeMobile}>Log in</Link>
              <Link href="/register" className="btn btn-primary" onClick={closeMobile}>Sign up</Link>
            </div>
          </>
        )}
      </div>

      {/* Spacer for fixed nav */}
      <div style={{ height: "var(--nav-height)" }} />
    </>
  );
}
