"use client";

import { useState, useEffect } from "react";
import useWatchlistStore from "@/store/useWatchlistStore";
import useSeriesStore from "@/store/seriesStore";
import MovieCard from "@/components/MovieCard";
import SeriesCard from "@/components/SeriesCard";
import Link from "next/link";
import { Bookmark, Trash2, ArrowUpDown, Film } from "lucide-react";

export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist } = useWatchlistStore();
  const { seriesList, fetchSeriesList, removeSeries } = useSeriesStore();
  const [sortBy, setSortBy] = useState("dateAdded");
  const [filter, setFilter] = useState("all"); // all, movies, series

  useEffect(() => {
    fetchSeriesList();
  }, []);

  // Combine lists with content type flag
  const combined = [
    ...watchlist.map((m) => ({ ...m, contentType: "movie" })),
    ...seriesList.map((s) => ({
      ...s,
      contentType: "series",
      id: s.tmdbId, // Map for key/id consistency
      vote_average: s.userRating || 0, // Fallback for sorting
    })),
  ];

  const filtered = combined.filter((item) => {
    if (filter === "movies") return item.contentType === "movie";
    if (filter === "series") return item.contentType === "series";
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "rating") return b.vote_average - a.vote_average;
    if (sortBy === "title")
      return (a.title || a.name).localeCompare(b.title || b.name);
    return (
      new Date(b.addedAt || b.added_at).getTime() -
      new Date(a.addedAt || a.added_at).getTime()
    );
  });

  return (
    <div
      className="container animate-in"
      style={{ padding: "100px 1rem 60px" }}
    >
      <div className="watchlist-toolbar flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Bookmark size={28} style={{ color: "var(--color-accent)" }} />
          <h1
            style={{
              fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            Your Watchlist
          </h1>
          <span
            style={{
              background: "var(--color-surface-2)",
              color: "var(--color-text-secondary)",
              fontSize: "0.85rem",
              fontWeight: 700,
              padding: "2px 10px",
              borderRadius: "var(--radius-pill)",
              border: "1px solid var(--color-border)",
            }}
          >
            {filtered.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* FILTER TOGGLE */}
          <div className="flex bg-[#111118] border border-white/5 rounded-full p-1">
            {["all", "movies", "series"].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
                  filter === t
                    ? "bg-[#e50914] text-white"
                    : "text-gray-400 hover:text-white"
                }`}
                style={{ minHeight: "auto", minWidth: "auto" }}
              >
                {t}
              </button>
            ))}
          </div>

          {combined.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.85rem",
                color: "var(--color-text-secondary)",
                background: "var(--color-surface)",
                padding: "6px 12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                width: "fit-content",
              }}
            >
              <ArrowUpDown size={14} />
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  background: "none",
                  color: "var(--color-text-primary)",
                  border: "none",
                  fontWeight: 600,
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value="dateAdded">Date Added</option>
                <option value="rating">Rating</option>
                <option value="title">Title A–Z</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "100px 0",
            maxWidth: "400px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              color: "var(--color-surface-2)",
              marginBottom: "24px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Film size={64} />
          </div>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "12px" }}>
            Your list is empty
          </h2>
          <p
            style={{
              color: "var(--color-text-secondary)",
              marginBottom: "32px",
              lineHeight: 1.5,
            }}
          >
            You haven't added any {filter === "all" ? "items" : filter} yet.
          </p>
          <Link
            href={filter === "series" ? "/series" : "/"}
            className="btn-primary"
            style={{ display: "inline-flex", width: "fit-content" }}
          >
            Browse {filter === "series" ? "Series" : "Movies"}
          </Link>
        </div>
      ) : (
        <div className="watchlist-grid">
          {sorted.map((item) => (
            <div
              key={item.id}
              className="watchlist-item"
              style={{ position: "relative" }}
            >
              {item.contentType === "movie" ? (
                <MovieCard movie={item} />
              ) : (
                <SeriesCard series={item} />
              )}
              <button
                onClick={() => {
                  if (item.contentType === "movie") {
                    removeFromWatchlist(item.id);
                  } else {
                    removeSeries(item.tmdbId);
                  }
                }}
                className="remove-btn"
                title="Remove from watchlist"
                style={{ minHeight: "36px", minWidth: "36px" }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .remove-btn {
          position: absolute;
          top: 8px;
          left: 8px;
          width: 36px;
          height: 36px;
          background: rgba(10, 10, 15, 0.8);
          backdrop-filter: blur(8px);
          color: var(--color-text-muted);
          border: 1px solid var(--color-border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          opacity: 0;
          transform: scale(0.8);
          transition: var(--transition);
        }
        .watchlist-item:hover .remove-btn {
          opacity: 1;
          transform: scale(1);
        }
        .remove-btn:hover {
          background: var(--color-accent);
          color: white;
          border-color: var(--color-accent);
        }
        @media (max-width: 768px) {
          .remove-btn {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
