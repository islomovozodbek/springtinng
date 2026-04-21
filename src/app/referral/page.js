"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PageShapes from "@/components/PageShapes";

export default function ReferralPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div style={{ padding: "var(--space-4xl) 0", textAlign: "center" }}>
        <div className="spinner spinner-lg mx-auto" />
      </div>
    );
  }

  const referralLink = `https://sprinting.ink/register?ref=${user.referralCode || "ABC123"}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rewards = [
    { count: "1st friend", reward: "2 weeks free Pro" },
    { count: "2nd friend", reward: "3 weeks free Pro" },
    { count: "3rd friend", reward: "4 weeks free Pro" },
  ];

  return (
    <div style={{ padding: "var(--space-2xl) 0", minHeight: "calc(100vh - var(--nav-height))", position: "relative", overflow: "hidden" }}>
      <PageShapes page="referral" />
      <div className="container" style={{ maxWidth: "600px", position: "relative", zIndex: 1 }}>
        <div className="text-center" style={{ marginBottom: "var(--space-2xl)" }}>
          <h1 style={{ marginBottom: "var(--space-sm)" }}>Refer a Friend</h1>
          <p className="text-muted">
            Share Sprinting Ink with friends and both of you get free Pro time
          </p>
        </div>

        {/* Your referral link */}
        <div className="card" style={{ marginBottom: "var(--space-xl)", textAlign: "center" }}>
          <h3 style={{ marginBottom: "var(--space-md)" }}>Your Referral Link</h3>
          <div style={{
            display: "flex",
            gap: "var(--space-sm)",
            alignItems: "center",
            background: "var(--bg-secondary)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-sm)",
          }}>
            <input
              type="text"
              className="input"
              value={referralLink}
              readOnly
              style={{ flex: 1, fontSize: "0.85rem", border: "none", background: "transparent" }}
            />
            <button className="btn btn-primary btn-sm" onClick={copyLink}>
              {copied ? "Copied! ✓" : "Copy"}
            </button>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "var(--space-md)" }}>
            Friends referred so far: <strong>{user.referralCount || 0}</strong> / 3
          </p>
        </div>

        {/* Rewards */}
        <h3 style={{ marginBottom: "var(--space-md)" }}>Referral Rewards</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)", marginBottom: "var(--space-xl)" }}>
          {rewards.map((r, i) => (
            <div key={i} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <strong>{r.count}</strong>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>signs up using your link</p>
              </div>
              <span className="badge badge-pro" style={{ fontSize: "0.8rem", padding: "6px 12px" }}>
                {r.reward}
              </span>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="card-flat" style={{ padding: "var(--space-xl)", borderRadius: "var(--radius-lg)" }}>
          <h4 style={{ marginBottom: "var(--space-md)" }}>How it works</h4>
          <ol style={{ paddingLeft: "var(--space-lg)", display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
            <li style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Share your unique referral link with friends
            </li>
            <li style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              When they sign up using your link, you both get rewarded
            </li>
            <li style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Rewards are escalating — the more friends, the longer the free Pro
            </li>
            <li style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Maximum 3 referrals (9 weeks of free Pro total!)
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
