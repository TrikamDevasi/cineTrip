"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Compass, Flame, Laugh, Heart, Skull, Rocket, Brain, Coffee, ArrowRight } from "lucide-react";

const MOODS = [
  { id: "mind-bending", label: "Mind-Bending & Sci-Fi", icon: "🧠", genreId: 878, desc: "Plot twists, deep theories & multiverse journeys" },
  { id: "adrenaline", label: "High Adrenaline Action", icon: "💥", genreId: 28, desc: "Explosive set-pieces, chases & superhero stunts" },
  { id: "feel-good", label: "Feel-Good & Cozy", icon: "🍿", genreId: 35, desc: "Lighthearted comedies & warm laughs" },
  { id: "romantic", label: "Heartwarming Romance", icon: "💖", genreId: 10749, desc: "Love stories, chemistry & emotional journeys" },
  { id: "thrills", label: "Late Night Chills & Thrills", icon: "👻", genreId: 27, desc: "Haunting mysteries, suspense & jump scares" },
  { id: "cinematic", label: "Visual Masterpieces", icon: "🎨", genreId: 18, desc: "Acclaimed dramas, Oscar winners & deep storytelling" },
];

export default function HomeMoodWidget() {
  const router = useRouter();

  const handleMoodSelect = (mood) => {
    router.push(`/discover?genre=${mood.genreId}`);
  };

  return (
    <div className="home-mood-section">
      <div className="section-header-row">
        <div>
          <div className="mood-tag">
            <Sparkles size={14} />
            <span>AI Mood Matcher</span>
          </div>
          <h2 className="section-title">What's Your Vibe Tonight?</h2>
          <p className="section-subtitle">Pick a mood and we'll instantly curate the best matching films.</p>
        </div>
      </div>

      <div className="mood-cards-grid">
        {MOODS.map((mood) => (
          <div
            key={mood.id}
            onClick={() => handleMoodSelect(mood)}
            className="mood-vibe-card group"
          >
            <span className="mood-emoji">{mood.icon}</span>
            <div className="mood-info">
              <h4>{mood.label}</h4>
              <p>{mood.desc}</p>
            </div>
            <div className="mood-arrow">
              <ArrowRight size={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
