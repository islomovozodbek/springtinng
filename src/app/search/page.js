"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PageShapes from "@/components/PageShapes";

export default function SearchPage() {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const debounceRef           = useRef(null);

  useEffect(() => {
    // Clear pending debounce on every keystroke
    clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // 300ms debounce — waits for the user to pause before querying
    debounceRef.current = setTimeout(async () => {
      const term = `%${query.trim()}%`;

      // Supabase doesn't support OR ilike in a single .ilike() call,
      // so we run two queries and merge + deduplicate by id.
      const [byUsername, byDisplayName] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, username, display_name, photo_url, tier, total_stories, level, profile_color, is_og")
          .ilike("username", term)
          .limit(15),
        supabase
          .from("profiles")
          .select("id, username, display_name, photo_url, tier, total_stories, level, profile_color, is_og")
          .ilike("display_name", term)
          .limit(15),
      ]);

      if (byUsername.error || byDisplayName.error) {
        setError("Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // Merge and deduplicate
      const seen = new Set();
      const merged = [...(byUsername.data || []), ...(byDisplayName.data || [])].filter((u) => {
        if (seen.has(u.id)) return false;
        seen.add(u.id);
        return true;
      });

      setResults(merged);
      setLoading(false);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <div style={{ padding: "var(--space-2xl) 0", minHeight: "calc(100vh - var(--nav-height))", position: "relative", overflow: "hidden" }}>
      <PageShapes page="search" />
      <div className="container" style={{ maxWidth: "600px", position: "relative", zIndex: 1 }}>
        <div className="text-center" style={{ marginBottom: "var(--space-2xl)" }}>
          <h1 style={{ marginBottom: "var(--space-sm)" }}>Find Writers</h1>
          <p className="text-muted">Search by username or display name</p>
        </div>

        <div style={{ marginBottom: "var(--space-xl)" }}>
          <input
            type="text"
            className="input w-full"
            placeholder="Search for writers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{ fontSize: "1.1rem", padding: "14px 20px" }}
          />
        </div>

        {/* Status messages */}
        {query.length > 0 && query.length < 2 && (
          <div className="text-center text-muted">
            <p>Type at least 2 characters to search</p>
          </div>
        )}

        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-xl)" }}>
            <div className="spinner" />
          </div>
        )}

        {error && (
          <div className="text-center text-muted" style={{ padding: "var(--space-xl)" }}>
            <p>{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && query.length >= 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
            {results.length === 0 ? (
              <div className="text-center text-muted" style={{ padding: "var(--space-2xl)" }}>
                <p>No writers found matching &quot;{query}&quot;</p>
              </div>
            ) : (
              results.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-md)",
                    padding: "var(--space-md) var(--space-lg)",
                    backgroundColor: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    textDecoration: "none",
                    color: "var(--text-primary)",
                    transition: "all 150ms ease",
                  }}
                >
                  <div className="avatar">
                    {user.photo_url ? (
                      <img src={user.photo_url} alt="Avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                      (user.username || "U")[0].toUpperCase()
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
                      <span className={user.tier === "pro" ? `username-pro username-color-${user.profile_color}` : ""}>
                        {user.display_name || user.username}
                      </span>
                      {user.tier === "pro" && <span className="badge badge-pro">PRO</span>}
                      {user.is_og && <span className="badge badge-og">OG</span>}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      @{user.username}
                    </div>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "right" }}>
                    {user.total_stories || 0} stories<br />Lv {user.level || 1}
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
