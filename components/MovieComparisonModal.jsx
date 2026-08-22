"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Scale, Search, Sparkles, Loader2 } from "lucide-react";
import Image from "next/image";

export default function MovieComparisonModal({ isOpen, onClose, currentMovie }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [targetMovie, setTargetMovie] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const titleId = "comparison-modal-title";
  const firstFocusRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Focus first focusable element when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstFocusRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.data?.results?.slice(0, 5) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  }

  async function handleCompare(movieB) {
    setTargetMovie(movieB);
    setAnalyzing(true);
    try {
      const res = await fetch("/api/ai/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movie1: currentMovie?.title || currentMovie?.name,
          movie2: movieB.title || movieB.name,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAiAnalysis(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <AnimatePresence>
      {/* Backdrop — click outside to close */}
      <div
        className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl max-h-[90vh] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-y-auto p-6 md:p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-600/10 text-purple-500">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h2
                  id={titleId}
                  className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]"
                >
                  Side-by-Side Movie Comparison
                </h2>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Compare cinematic themes, ratings, box office, and AI insights
                </p>
              </div>
            </div>
            <button
              ref={firstFocusRef}
              onClick={onClose}
              aria-label="Close comparison modal"
              className="p-2 rounded-full hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!targetMovie ? (
            <div className="space-y-6">
              <p className="text-xs text-[var(--color-text-secondary)]">
                Comparing <strong className="text-[var(--color-text-primary)]">{currentMovie?.title}</strong> with:
              </p>
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search a movie to compare against..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search for a movie to compare"
                  className="flex-1 px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] text-xs text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
                />
                <button
                  type="submit"
                  disabled={searching}
                  aria-label="Search movies"
                  className="px-5 py-3 rounded-xl bg-[var(--color-accent)] text-white text-xs font-bold hover:brightness-110 flex items-center gap-2 disabled:opacity-60"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </form>

              <ul className="space-y-3" role="listbox" aria-label="Movie search results">
                {searchResults.map((m) => (
                  <li key={m.id} role="option">
                    {/* Using <button> instead of <div onClick> for keyboard accessibility */}
                    <button
                      onClick={() => handleCompare(m)}
                      className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] hover:border-[var(--color-accent)] cursor-pointer transition-all flex items-center justify-between text-left"
                      aria-label={`Compare with ${m.title} (${m.release_date?.slice(0, 4)})`}
                    >
                      <div className="flex items-center gap-3">
                        {m.poster_path && (
                          <div className="relative w-10 h-14 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={`https://image.tmdb.org/t/p/w92${m.poster_path}`}
                              alt={m.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-xs text-[var(--color-text-primary)]">{m.title}</h4>
                          <span className="text-[10px] text-[var(--color-text-muted)]">
                            {m.release_date?.slice(0, 4)} • ⭐ {m.vote_average?.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[var(--color-accent)]">Select &amp; Compare →</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                {/* Movie A */}
                <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] text-center space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)]">Movie #1</span>
                  <h3 className="font-bold text-sm text-[var(--color-text-primary)]">{currentMovie?.title}</h3>
                  <div className="text-xs text-[var(--color-gold)] font-bold">⭐ {currentMovie?.vote_average?.toFixed(1)}/10</div>
                </div>

                {/* Movie B */}
                <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] text-center space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Movie #2</span>
                    <button
                      onClick={() => { setTargetMovie(null); setAiAnalysis(null); }}
                      className="text-[10px] text-[var(--color-text-muted)] hover:underline"
                      aria-label="Change second movie"
                    >
                      Change
                    </button>
                  </div>
                  <h3 className="font-bold text-sm text-[var(--color-text-primary)]">{targetMovie.title}</h3>
                  <div className="text-xs text-[var(--color-gold)] font-bold">⭐ {targetMovie.vote_average?.toFixed(1)}/10</div>
                </div>
              </div>

              {/* AI Comparison Analysis */}
              <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] space-y-4">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  <span>AI Breakdown Analysis</span>
                </div>

                {analyzing ? (
                  <div className="py-6 text-center text-xs text-[var(--color-text-muted)] flex items-center justify-center gap-2" aria-live="polite">
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Generating thematic comparison...
                  </div>
                ) : aiAnalysis ? (
                  <div className="space-y-4 text-xs text-[var(--color-text-secondary)] leading-relaxed" aria-live="polite">
                    <div>
                      <h4 className="font-bold text-[var(--color-text-primary)] mb-1">Key Similarities</h4>
                      <p>{aiAnalysis.similarities || aiAnalysis.comparison}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--color-text-primary)] mb-1">Core Differences &amp; Tone</h4>
                      <p>{aiAnalysis.differences}</p>
                    </div>
                    {aiAnalysis.recommendation && (
                      <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium">
                        💡 Verdict: {aiAnalysis.recommendation}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
