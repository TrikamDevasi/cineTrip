"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Compass, Film, Clock, HeartHandshake, Loader2, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const MOODS = [
  { id: "mind_bending", label: "Mind-Bending & Thrilling", icon: "🧠" },
  { id: "cozy", label: "Cozy & Feel-Good", icon: "☕" },
  { id: "dark_gritty", label: "Dark & Gritty Neo-Noir", icon: "🕶️" },
  { id: "epic", label: "Grand & Cinematic Epic", icon: "⚔️" },
  { id: "emotional", label: "Deeply Emotional & Moving", icon: "💧" },
  { id: "hilarious", label: "Witty & Hilarious", icon: "😂" },
];

export default function AIWhatToWatchModal({ isOpen, onClose }) {
  const [selectedMood, setSelectedMood] = useState("");
  const [favoriteGenres, setFavoriteGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  if (!isOpen) return null;

  async function handleFindMovie() {
    if (!selectedMood) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/what-to-watch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: selectedMood,
          genres: favoriteGenres,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setRecommendations(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden p-6 md:p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
                  AI "What Should I Watch?" Wizard
                </h2>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Select your current mood and preference for instant curated picks
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[var(--color-surface-2)] text-[var(--color-text-muted)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!recommendations ? (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-3">
                  1. How are you feeling right now?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {MOODS.map((mood) => {
                    const isSelected = selectedMood === mood.id;
                    return (
                      <button
                        key={mood.id}
                        onClick={() => setSelectedMood(mood.id)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                          isSelected
                            ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-bold shadow-md"
                            : "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)]"
                        }`}
                      >
                        <span className="text-lg">{mood.icon}</span>
                        <span>{mood.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleFindMovie}
                  disabled={!selectedMood || loading}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 via-indigo-600 to-purple-600 text-white font-semibold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Consulting AI Curator...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate Personal Picks</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-[var(--color-accent)] tracking-wider">
                  Recommended for you
                </span>
                <button
                  onClick={() => setRecommendations(null)}
                  className="text-xs text-[var(--color-text-muted)] hover:underline"
                >
                  Try Another Mood
                </button>
              </div>

              <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-1">
                {recommendations.recommendations?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] flex flex-col md:flex-row gap-4 items-start"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase">
                          Match #{idx + 1}
                        </span>
                        <h3 className="font-bold text-base text-[var(--color-text-primary)]">
                          {item.title} ({item.year})
                        </h3>
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                        {item.reason}
                      </p>
                      <div className="pt-2 flex items-center gap-3 text-[11px] text-[var(--color-text-muted)] font-medium">
                        <span>🎯 Vibe: {item.vibe || "Perfect Match"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
