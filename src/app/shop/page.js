"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PageShapes from "@/components/PageShapes";

const SHOP_ITEMS = [
  // Profile Borders
  { id: "border-gold", name: "Golden Frame", desc: "A shimmering gold border around your avatar", price: 500, category: "borders", preview: "🖼️", rarity: "rare" },
  { id: "border-nature", name: "Vine Border", desc: "Leafy vines wrapping your profile photo", price: 300, category: "borders", preview: "🌿", rarity: "common" },
  { id: "border-fire", name: "Flame Ring", desc: "Fiery border for the hottest writers", price: 800, category: "borders", preview: "🔥", rarity: "epic" },
  { id: "border-space", name: "Cosmic Ring", desc: "Stars and galaxies orbiting your avatar", price: 1200, category: "borders", preview: "🌌", rarity: "legendary" },
  { id: "border-pixel", name: "Pixel Frame", desc: "Retro pixel art border", price: 200, category: "borders", preview: "👾", rarity: "common" },
  // Themes
  { id: "theme-midnight", name: "Midnight Writer", desc: "Dark theme with cool blue accents", price: 400, category: "themes", preview: "🌙", rarity: "rare" },
  { id: "theme-forest", name: "Forest Cabin", desc: "Green & wood tones for nature lovers", price: 400, category: "themes", preview: "🌲", rarity: "rare" },
  { id: "theme-ocean", name: "Deep Ocean", desc: "Blues and teals like the deep sea", price: 400, category: "themes", preview: "🌊", rarity: "rare" },
  { id: "theme-sunset", name: "Golden Hour", desc: "Warm oranges and pinks at sunset", price: 600, category: "themes", preview: "🌅", rarity: "epic" },
  { id: "theme-noir", name: "Noir Detective", desc: "Black & white with red accents", price: 800, category: "themes", preview: "🔍", rarity: "epic" },
  // Badges
  { id: "badge-pen", name: "Golden Pen", desc: "A tiny golden pen next to your name", price: 250, category: "badges", preview: "🖊️", rarity: "common" },
  { id: "badge-coffee", name: "Coffee Master", desc: "For writers fueled by caffeine", price: 150, category: "badges", preview: "☕", rarity: "common" },
  { id: "badge-crown", name: "Crown", desc: "The ultimate status symbol", price: 2000, category: "badges", preview: "👑", rarity: "legendary" },
  { id: "badge-quill", name: "Ancient Quill", desc: "The old-fashioned way of writing", price: 350, category: "badges", preview: "🪶", rarity: "rare" },
  { id: "badge-rocket", name: "Rocketeer", desc: "For stories that go to the moon", price: 500, category: "badges", preview: "🚀", rarity: "rare" },
  // Title Cards
  { id: "title-storyteller", name: "The Storyteller", desc: "Custom title under your name", price: 600, category: "titles", preview: "📜", rarity: "epic" },
  { id: "title-wordsmith", name: "Wordsmith", desc: "For the true craftsmen of words", price: 600, category: "titles", preview: "⚒️", rarity: "epic" },
  { id: "title-dreamer", name: "The Dreamer", desc: "For those who write between worlds", price: 600, category: "titles", preview: "💭", rarity: "epic" },
];

const CATEGORIES = [
  { id: "all", label: "All Items" },
  { id: "borders", label: "🖼️ Borders" },
  { id: "themes", label: "🎨 Themes" },
  { id: "badges", label: "🏅 Badges" },
  { id: "titles", label: "📜 Titles" },
];

const RARITY_COLORS = {
  common: { bg: "var(--bg-secondary)", color: "var(--text-muted)" },
  rare: { bg: "#D6E4FF", color: "#2952A3" },
  epic: { bg: "#EDD6FF", color: "#6B2FA0" },
  legendary: { bg: "#FFEFD6", color: "#8B6914" },
};

export default function ShopPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");
  const [purchasedItems, setPurchasedItems] = useState(new Set());

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const filtered = activeCategory === "all"
    ? SHOP_ITEMS
    : SHOP_ITEMS.filter((item) => item.category === activeCategory);

  const handlePurchase = (item) => {
    if ((user?.aura || 0) < item.price) return;
    setPurchasedItems((prev) => new Set([...prev, item.id]));
  };

  if (loading || !user) {
    return (
      <div style={{ padding: "var(--space-4xl) 0", textAlign: "center" }}>
        <div className="spinner spinner-lg mx-auto" />
      </div>
    );
  }

  return (
    <div style={{ padding: "var(--space-2xl) 0", minHeight: "calc(100vh - var(--nav-height))", position: "relative", overflow: "hidden" }}>
      <PageShapes page="shop" />
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div className="text-center" style={{ marginBottom: "var(--space-2xl)" }}>
          <h1 style={{ marginBottom: "var(--space-sm)" }}>Aura Shop</h1>
          <p className="text-muted">Spend your Aura on cosmetics that make your profile shine</p>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-sm)",
            marginTop: "var(--space-md)",
            padding: "var(--space-sm) var(--space-lg)",
            background: "var(--accent-soft)",
            borderRadius: "var(--radius-full)",
            fontWeight: 700,
            color: "var(--accent)",
          }}>
            ⭐ {user.aura || 0} Aura available
          </div>
        </div>

        {/* Category Filter */}
        <div style={{
          display: "flex",
          gap: "var(--space-xs)",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "var(--space-2xl)",
        }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: "8px 16px",
                border: `1.5px solid ${activeCategory === cat.id ? "var(--accent)" : "var(--border)"}`,
                borderRadius: "var(--radius-full)",
                background: activeCategory === cat.id ? "var(--accent)" : "var(--bg-elevated)",
                color: activeCategory === cat.id ? "var(--text-inverse)" : "var(--text-muted)",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontSize: "0.85rem",
                fontWeight: 600,
                transition: "all 150ms ease",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "var(--space-lg)",
          maxWidth: "960px",
          margin: "0 auto",
        }}>
          {filtered.map((item) => {
            const owned = purchasedItems.has(item.id);
            const canAfford = (user.aura || 0) >= item.price;
            const rarity = RARITY_COLORS[item.rarity];

            return (
              <div
                key={item.id}
                className="card"
                style={{
                  textAlign: "center",
                  opacity: owned ? 0.6 : 1,
                  position: "relative",
                }}
              >
                {/* Rarity badge */}
                <span style={{
                  position: "absolute",
                  top: "var(--space-md)",
                  right: "var(--space-md)",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  background: rarity.bg,
                  color: rarity.color,
                }}>
                  {item.rarity}
                </span>

                <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-md)" }}>
                  {item.preview}
                </div>
                <h4 style={{ marginBottom: "var(--space-xs)" }}>{item.name}</h4>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "var(--space-md)" }}>
                  {item.desc}
                </p>
                <div style={{
                  fontWeight: 700,
                  color: canAfford ? "var(--accent)" : "var(--danger)",
                  marginBottom: "var(--space-md)",
                }}>
                  ⭐ {item.price} Aura
                </div>
                <button
                  className={`btn ${owned ? "btn-ghost" : canAfford ? "btn-primary" : "btn-secondary"} btn-sm w-full`}
                  disabled={owned || !canAfford}
                  onClick={() => handlePurchase(item)}
                >
                  {owned ? "Owned ✓" : canAfford ? "Purchase" : "Not enough Aura"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
