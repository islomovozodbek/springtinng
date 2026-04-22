"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./pricing.module.css";
import PageShapes from "@/components/PageShapes";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const HandCircle = () => (
  <svg className={styles.circleSvgStretched} viewBox="0 0 100 40" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      className={styles.circlePath} 
      d="M15,20 C15,10 85,5 85,20 C85,35 25,35 15,20 C10,10 40,5 60,8" 
    />
  </svg>
);



export default function PricingPage() {
  const [duration, setDuration] = useState("monthly"); // "monthly", "quarterly", "yearly"
  const { user } = useAuth();
  const router = useRouter();
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const getPricingLabels = () => {
    if (duration === "quarterly") {
      return {
        price: "$4.99",
        period: "/qt",
        save: "Save 16%",
        btnText: "Get 3 Months"
      };
    } else if (duration === "yearly") {
      return {
        price: "$17.99",
        period: "/yr",
        save: "Save 25%",
        btnText: "Get Yearly"
      };
    }
    return {
      price: "$1.99",
      period: "/mo",
      save: null,
      btnText: "Get Monthly"
    };
  };

  const currentPricing = getPricingLabels();

  const handleCheckout = async () => {
    if (!user) {
      router.push("/register");
      return;
    }
    
    if (user.tier === "pro") {
      setErrorMsg("You are already on the Pro tier!");
      return;
    }

    setLoadingCheckout(true);
    setErrorMsg("");
    
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          email: user.email,
          interval: duration,
          returnUrl: window.location.origin + "/dashboard",
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Checkout setup failed");
      
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to connect to Stripe.");
      setLoadingCheckout(false);
    }
  };

  return (
    <div className={styles.pricingPage}>
      <PageShapes page="pricing" />




      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        
        <div className={styles.pricingHeader}>
          <h1>Simple Pricing</h1>
          <p>Support the app and write freely.</p>
        </div>

        <div className={styles.plansWrapper}>
          <div className={styles.plansLineup}>
            
            {/* Free */}
            <div className={styles.planCard}>
              <div className={styles.planHeader}>
                <div className={styles.planName}>Free Tier</div>

                <div className={styles.planPrice}>
                  $0<span>/mo</span>
                </div>
              </div>
              
              <ul className={styles.planFeatures}>
                <li><span className={styles.checkIcon}>✓</span> 5 Sprints per day</li>
                <li><span className={styles.checkIcon}>✓</span> 3-Minute Sprints</li>
                <li><span className={styles.checkIcon}>✓</span> The Fog of War (Blur)</li>
                <li><span className={styles.checkIcon}>✓</span> Pause and Burn (5s rule)</li>
                <li><span className={styles.checkIcon}>✓</span> 2,000+ Standard Prompts</li>
                <li><span className={styles.checkIcon}>✓</span> Global Story Feed</li>
                <li><span className={styles.checkIcon}>✓</span> Public Leaderboard</li>
                <li><span className={styles.checkIcon}>✓</span> XP & Leveling System</li>
                <li><span className={styles.checkIcon}>✓</span> Daily Writing Streaks</li>
                <li><span className={styles.checkIcon}>✓</span> Standard Text Export</li>
              </ul>
              
              <Link href="/register">
                <button className={styles.planBtn}>Get Started</button>
              </Link>
            </div>

            {/* Pro Tier */}
            <div className={styles.planCard}>
              <div className={styles.planHeader}>
                <div className={styles.planName}>Pro Tier</div>
                
                <div className={styles.planPrice}>
                  {currentPricing.price}<span>{currentPricing.period}</span>
                </div>
                
                <div className={styles.handDrawnCircleContainer}>
                  {currentPricing.save && (
                    <div className={styles.handDrawnCircleStretched}>
                      <HandCircle />
                      <span>{currentPricing.save}</span>
                    </div>
                  )}
                </div>
              </div>

              <ul className={styles.planFeatures}>
                <li><span className={styles.checkIcon}>✓</span> <strong>Everything in Free, plus:</strong></li>
                <li><span className={styles.checkIcon}>✓</span> Unlimited daily sprints</li>
                <li><span className={styles.checkIcon}>✓</span> 1, 2, 5 & 10 min modes</li>
                <li><span className={styles.checkIcon}>✓</span> Custom Editor Themes</li>
                <li><span className={styles.checkIcon}>✓</span> Advanced PDF Exports</li>
                <li><span className={styles.checkIcon}>✓</span> Private Sprint Mode</li>
                <li><span className={styles.checkIcon}>✓</span> Writing Heatmaps & Stats</li>
                <li><span className={styles.checkIcon}>✓</span> Shiny Pro Identity</li>
                <li><span className={styles.checkIcon}>✓</span> Priority Support</li>
              </ul>

              <div className={styles.durationToggle}>
                <button 
                  className={`${styles.durationBtn} ${duration === "monthly" ? styles.active : ""}`}
                  onClick={() => setDuration("monthly")}
                >
                  1 Month
                </button>
                <button 
                  className={`${styles.durationBtn} ${duration === "quarterly" ? styles.active : ""}`}
                  onClick={() => setDuration("quarterly")}
                >
                  3 Months
                </button>
                <button 
                  className={`${styles.durationBtn} ${duration === "yearly" ? styles.active : ""}`}
                  onClick={() => setDuration("yearly")}
                >
                  1 Year
                </button>
              </div>
              
              <div style={{ marginTop: "16px" }}>
                {errorMsg && (
                  <div style={{ color: "var(--danger)", fontSize: "0.85rem", marginBottom: "12px", textAlign: "center" }}>
                    {errorMsg}
                  </div>
                )}
                <button 
                  className={`${styles.planBtn} ${styles.planBtnPrimary}`} 
                  onClick={handleCheckout}
                  disabled={loadingCheckout}
                >
                  {loadingCheckout ? "Redirecting..." : currentPricing.btnText}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Minimal FAQ */}
        <div className={styles.faqSection}>
          <h2>Questions?</h2>
          
          <div className={styles.faqItem}>
            <h4>Will my writing be private?</h4>
            <p>By default, sprints are public to help build our community story feed. However, Pro Tier unlocks &quot;Private Sprint Mode&quot; for sessions you&apos;d prefer to keep strictly for your own eyes.</p>
          </div>

          <div className={styles.faqItem}>
            <h4>What makes Sprinting Ink different from a regular text editor?</h4>
            <p>Regular editors focus on management and formatting. Sprinting Ink focuses entirely on momentum. Between the &quot;Fog of War&quot; and the &quot;Burn&quot; timer, we provide a psychological safe space where editing is impossible, leaving you with no choice but to create.</p>
          </div>
          
          <div className={styles.faqItem}>
            <h4>Can I cancel?</h4>
            <p>Of course. Cancel from your settings page anytime, and you&apos;ll keep Pro features until your current period ends.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
