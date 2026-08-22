"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, X, Wand2, ChevronRight, Loader2 } from "lucide-react";

export default function AiRecommendations({ isOpen, onClose }) {
  const [mood, setMood] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAIRecommendations = async () => {
    if (!mood.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood }),
      });
      const data = await response.json();
      
      const enriched = await Promise.all(
        (data.recommendations || []).map(async (rec) => {
          try {
            const tmdbRes = await fetch(`/api/tmdb/search?q=${encodeURIComponent(rec.title)}`);
            const tmdbData = await tmdbRes.json();
            const movie = tmdbData.data?.results?.[0];
            return {
              ...rec,
              id: movie?.id,
              poster_path: movie?.poster_path
            };
          } catch {
            return rec;
          }
        })
      );
      
      setMovies(enriched);
    } catch (error) {
      console.error("OpenAI Error:", error);
      setMovies([{ title: "Error", overview: "Failed to generate recommendations. Please try again." }]);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="ai-panel animate-in" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="ai-title" style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: 800, background: "linear-gradient(135deg, #7c3aed, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            <Sparkles size={20} style={{ color: "#7c3aed" }} />
            <span>Magic AI</span>
          </div>
          <button onClick={onClose} className="close-drawer-btn" aria-label="Close AI panel">
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: "1.5rem", flex: 1, overflowY: "auto" }}>
          <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
            Describe your mood or what you want to watch, and our AI will curate a cinematic list just for you.
          </p>

          <div style={{ position: "relative", marginBottom: "2rem", display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="I'm feeling adventurous and want something sci-fi..."
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && getAIRecommendations()}
              style={{
                flex: 1,
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "12px 16px",
                color: "var(--color-text-primary)",
                fontSize: "0.95rem",
                outline: "none"
              }}
            />
            <button
              onClick={getAIRecommendations}
              disabled={loading || !mood.trim()}
              aria-label="Get recommendations"
              style={{
                width: "48px",
                height: "48px",
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                color: "white",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: (loading || !mood.trim()) ? 0.5 : 1
              }}
            >
              {loading ? <Loader2 size={18} className="spin-icon" /> : <Wand2 size={18} />}
            </button>
          </div>

          {movies.length > 0 && (
            <div className="ai-results">
              <h4 style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-accent)", letterSpacing: "0.1em", marginBottom: "1.25rem", textTransform: "uppercase" }}>
                AI Curated Picks
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {movies.map((movie, index) => (
                  <div key={index} style={{ display: "flex", gap: "1rem", padding: "1rem", background: "var(--color-surface-2)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                    {movie.poster_path ? (
                      <div style={{ width: "60px", height: "90px", flexShrink: 0, position: "relative", borderRadius: "4px", overflow: "hidden" }}>
                        <Image
                          src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                          alt={movie.title}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    ) : (
                      <div style={{ width: "60px", height: "90px", flexShrink: 0, background: "var(--color-surface-3)", borderRadius: "4px" }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h5 style={{ fontWeight: 700, marginBottom: "4px", fontSize: "1rem", color: "var(--color-text-primary)" }}>{movie.title}</h5>
                      <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", lineHeight: 1.4, marginBottom: "8px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {movie.overview}
                      </p>
                      {movie.id && (
                        <Link 
                          href={`/movie/${movie.id}`}
                          onClick={onClose}
                          style={{ fontSize: "0.75rem", fontWeight: 700, color: "#7c3aed", display: "flex", alignItems: "center", gap: "4px", textTransform: "uppercase" }}
                        >
                          <span>View Details</span>
                          <ChevronRight size={14} />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
