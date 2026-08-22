"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  User, 
  Palette, 
  Settings, 
  MapPin, 
  Ticket, 
  Heart, 
  Camera, 
  Sparkles, 
  Check, 
  Film, 
  Bell, 
  ShieldCheck,
  Save,
  Moon,
  Sun,
  Flame
} from "lucide-react";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import { useThemeStore } from "@/store/useThemeStore";
import { usePlannerStore } from "@/store/usePlannerStore";
import { useMemoryStore } from "@/store/useMemoryStore";
import useWatchlistStore from "@/store/useWatchlistStore";

const THEME_OPTIONS = [
  { id: "dark", name: "Dark Violet (Signature)", desc: "Deep cosmic slate with electric violet glow", previewColor: "#7c3aed" },
  { id: "amoled", name: "Midnight AMOLED", desc: "Pure true black #000000 with silver accents", previewColor: "#111111" },
  { id: "cyberpunk", name: "Cyberpunk Neon", desc: "Neon cyan and pink high-contrast cinema glow", previewColor: "#06b6d4" },
  { id: "light", name: "Pearl Light", desc: "Crisp studio ivory with high legibility", previewColor: "#6d28d9" },
];

const GENRE_LIST = [
  "Action", "Sci-Fi", "Thriller", "Horror", "Comedy", 
  "Romance", "Drama", "Animation", "Adventure", "Crime", "Fantasy"
];

const CITIES = [
  "Mumbai", "Delhi_NCR", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune", 
  "New_York", "London", "Los_Angeles", "Toronto", "Tokyo"
];

const THEATER_CHAINS = [
  "PVR INOX", "Cinepolis", "AMC Theatres", "Regal Cinemas", "Alamo Drafthouse", "Odeon Luxe", "BFI IMAX"
];

const SCREEN_FORMATS = [
  "IMAX with Laser 3D", "Dolby Cinema / Atmos", "4DX Dynamic Motion", "ScreenX 270°", "Standard 4K Laser"
];

export default function ProfilePage() {
  const { 
    userName, 
    userHandle, 
    userAvatar, 
    city, 
    preferredChain, 
    preferredFormat, 
    favoriteGenres, 
    notificationsEnabled, 
    autoExportCalendar,
    updateProfile, 
    toggleGenre 
  } = useUserPreferencesStore();

  const { theme, setTheme, toggleTheme } = useThemeStore();
  const { plans } = usePlannerStore();
  const { memories } = useMemoryStore();
  const { watchlist } = useWatchlistStore();

  const [activeTab, setActiveTab] = useState("theme"); // 'theme' | 'settings' | 'stats'
  const [formData, setFormData] = useState({
    userName: userName || "Trikam Devasi",
    userHandle: userHandle || "@trikamdevasi",
    userAvatar: userAvatar || "🍿",
    city: city || "Mumbai",
    preferredChain: preferredChain || "PVR INOX",
    preferredFormat: preferredFormat || "IMAX with Laser 3D",
    notificationsEnabled: notificationsEnabled ?? true,
    autoExportCalendar: autoExportCalendar ?? true,
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="profile-page container" style={{ paddingBottom: "100px" }}>
      {/* PROFILE HEADER HERO */}
      <div className="profile-hero-card">
        <div className="profile-avatar-box">
          <span className="profile-avatar-emoji">{formData.userAvatar}</span>
        </div>
        <div className="profile-identity">
          <div className="profile-badges-row">
            <span className="badge-vip">⭐ CineTrip Enthusiast</span>
            <span className="badge-city"><MapPin size={12} /> {formData.city.replace("_", " ")}</span>
          </div>
          <h1 className="profile-name">{formData.userName}</h1>
          <p className="profile-handle">{formData.userHandle}</p>
        </div>

        {/* QUICK STATS COUNTERS */}
        <div className="profile-quick-stats">
          <div className="stat-box">
            <span className="stat-num">{plans.length}</span>
            <span className="stat-label">CineTrips</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">{memories.length}</span>
            <span className="stat-label">Memories</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">{watchlist.length}</span>
            <span className="stat-label">Watchlist</span>
          </div>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="profile-nav-tabs">
        <button
          onClick={() => setActiveTab("theme")}
          className={`profile-tab-btn ${activeTab === "theme" ? "active" : ""}`}
        >
          <Palette size={16} />
          <span>Theme & Aesthetics</span>
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`profile-tab-btn ${activeTab === "settings" ? "active" : ""}`}
        >
          <Settings size={16} />
          <span>Cinema & Outing Settings</span>
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`profile-tab-btn ${activeTab === "stats" ? "active" : ""}`}
        >
          <Film size={16} />
          <span>Viewing Statistics</span>
        </button>
      </div>

      {/* TAB 1: THEME & AESTHETICS */}
      {activeTab === "theme" && (
        <div className="profile-tab-content animate-fadeIn">
          <div className="settings-section-card">
            <div className="card-header">
              <h2>Color Themes & UI Modes</h2>
              <p>Personalize your CineTrip experience with curated cinema palettes.</p>
            </div>

            <div className="themes-selection-grid">
              {THEME_OPTIONS.map((t) => {
                const isCurrent = theme === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`theme-option-card ${isCurrent ? "active" : ""}`}
                  >
                    <div className="theme-color-badge" style={{ background: t.previewColor }} />
                    <div className="theme-details">
                      <h4>{t.name}</h4>
                      <p>{t.desc}</p>
                    </div>
                    {isCurrent && <Check size={18} className="theme-check-icon" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CINEMA & OUTING SETTINGS */}
      {activeTab === "settings" && (
        <div className="profile-tab-content animate-fadeIn">
          <form onSubmit={handleFormSubmit} className="settings-form-grid">
            {/* GENERAL PROFILE */}
            <div className="settings-section-card">
              <div className="card-header">
                <h2>User Profile Details</h2>
                <p>Manage your display name and cinema squad identity.</p>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Display Name</label>
                  <input
                    type="text"
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    className="step-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Handle</label>
                  <input
                    type="text"
                    value={formData.userHandle}
                    onChange={(e) => setFormData({ ...formData, userHandle: e.target.value })}
                    className="step-input"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: "16px" }}>
                <label className="form-label">Choose Avatar Emoji</label>
                <div className="avatar-pick-row">
                  {["🍿", "🚀", "✨", "🎬", "🥤", "🕶️", "👑", "🔥"].map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => setFormData({ ...formData, userAvatar: emo })}
                      className={`avatar-choice-btn ${formData.userAvatar === emo ? "selected" : ""}`}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CINEMA & THEATER DEFAULTS */}
            <div className="settings-section-card">
              <div className="card-header">
                <h2>Cinema Outing Preferences</h2>
                <p>Default theater formats and city when creating new trip plans.</p>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Default City</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="step-input"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Cinema Chain</label>
                  <select
                    value={formData.preferredChain}
                    onChange={(e) => setFormData({ ...formData, preferredChain: e.target.value })}
                    className="step-input"
                  >
                    {THEATER_CHAINS.map((chain) => (
                      <option key={chain} value={chain}>
                        {chain}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: "16px" }}>
                <label className="form-label">Preferred Screen Format</label>
                <select
                  value={formData.preferredFormat}
                  onChange={(e) => setFormData({ ...formData, preferredFormat: e.target.value })}
                  className="step-input"
                >
                  {SCREEN_FORMATS.map((fmt) => (
                    <option key={fmt} value={fmt}>
                      {fmt}
                    </option>
                  ))}
                </select>
              </div>

              {/* FAVORITE GENRES */}
              <div className="form-group" style={{ marginTop: "20px" }}>
                <label className="form-label">Favorite Genres (Used in AI Moods & Recommendations)</label>
                <div className="genre-toggle-chips">
                  {GENRE_LIST.map((genre) => {
                    const active = favoriteGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => toggleGenre(genre)}
                        className={`genre-chip ${active ? "active" : ""}`}
                      >
                        {active && <Check size={12} />}
                        <span>{genre}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SAVE BUTTON */}
            <div className="save-actions-bar">
              <button type="submit" className="btn-primary save-btn">
                <Save size={16} />
                <span>Save Profile & Preferences</span>
              </button>
              {saveSuccess && <span className="save-toast-msg">✓ Settings updated successfully!</span>}
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: STATS */}
      {activeTab === "stats" && (
        <div className="profile-tab-content animate-fadeIn">
          <div className="stats-metric-grid">
            <div className="metric-card">
              <span className="metric-icon">🍿</span>
              <div className="metric-data">
                <h3>{plans.length}</h3>
                <p>Cinema Outings Planned</p>
              </div>
            </div>
            <div className="metric-card">
              <span className="metric-icon">📸</span>
              <div className="metric-data">
                <h3>{memories.length}</h3>
                <p>Memories & Scrapbooks</p>
              </div>
            </div>
            <div className="metric-card">
              <span className="metric-icon">❤️</span>
              <div className="metric-data">
                <h3>{watchlist.length}</h3>
                <p>Saved to Watchlist</p>
              </div>
            </div>
            <div className="metric-card">
              <span className="metric-icon">✨</span>
              <div className="metric-data">
                <h3>{favoriteGenres.length}</h3>
                <p>Favorite Genres Configured</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
