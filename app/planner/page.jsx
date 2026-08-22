"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  Ticket, 
  Search, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Share2, 
  Trash2, 
  Plus, 
  X, 
  Film, 
  Calendar as CalendarIcon, 
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Tv,
  Eye
} from "lucide-react";
import { usePlannerStore } from "@/store/usePlannerStore";
import useWatchlistStore from "@/store/useWatchlistStore";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";

const POPULAR_CINEMAS = {
  Mumbai: [
    { name: "PVR INOX IMAX with Laser", brand: "IMAX", screenType: "IMAX Laser 3D", address: "Phoenix Palladium, Lower Parel" },
    { name: "Maison INOX Jio World Plaza", brand: "INOX", screenType: "Luxe Dolby Atmos", address: "BKC, Bandra" },
    { name: "PVR Directors Cut", brand: "PVR", screenType: "Luxury Dine-In", address: "Oberoi Mall, Goregaon" },
    { name: "Cinepolis VIP", brand: "Cinepolis", screenType: "4DX Dynamic", address: "Viviana Mall, Thane" },
  ],
  Delhi_NCR: [
    { name: "PVR Superplex IMAX", brand: "IMAX", screenType: "IMAX Laser 3D", address: "Logix City Centre, Noida" },
    { name: "PVR Plaza Heritage", brand: "PVR", screenType: "Dolby Atmos", address: "Connaught Place, New Delhi" },
    { name: "Cinepolis Grand Venice", brand: "Cinepolis", screenType: "4DX Screen", address: "Greater Noida" },
  ],
  Bengaluru: [
    { name: "PVR Vega City IMAX", brand: "IMAX", screenType: "IMAX Laser 3D", address: "Bannerghatta Road" },
    { name: "INOX Forum Rex Walk", brand: "INOX", screenType: "Club Luxe", address: "Brigade Road" },
    { name: "PVR Nexus Koramangala", brand: "PVR", screenType: "4DX & Gold", address: "Koramangala" },
  ],
  New_York: [
    { name: "AMC Lincoln Square IMAX", brand: "IMAX", screenType: "IMAX 70mm Dual Laser", address: "1998 Broadway, NYC" },
    { name: "Regal Times Square 4DX", brand: "Regal", screenType: "4DX & RPX", address: "247 W 42nd St, NYC" },
    { name: "Alamo Drafthouse Brooklyn", brand: "Alamo", screenType: "Dine-in 35mm & 4K", address: "445 Albee Square W" },
  ],
  London: [
    { name: "BFI IMAX Waterloo", brand: "IMAX", screenType: "Largest IMAX 70mm Screen", address: "1 Charlie Chaplin Walk" },
    { name: "Odeon Luxe Leicester Square", brand: "Odeon", screenType: "Dolby Cinema Dual Laser", address: "24-26 Leicester Square" },
    { name: "Curzon Bloomsbury", brand: "Curzon", screenType: "Bertha DocHouse", address: "The Brunswick Centre" },
  ]
};

const TIME_SLOTS = [
  { time: "11:00", label: "Morning Matinee", icon: "☀️", period: "11:00 AM" },
  { time: "14:30", label: "Afternoon Show", icon: "🌤️", period: "02:30 PM" },
  { time: "18:15", label: "Prime Evening", icon: "🌆", period: "06:15 PM" },
  { time: "20:45", label: "Night Prime (Popular)", icon: "🍿", period: "08:45 PM" },
  { time: "23:15", label: "Midnight Screener", icon: "🌙", period: "11:15 PM" },
];

export default function PlannerPage() {
  const searchParams = useSearchParams();
  const prefillMovieId = searchParams.get("movieId");
  const prefillTitle = searchParams.get("title");

  const { draft, setDraftMovie, setDraftCinema, setDraftDateTime, setDraftNotes, addDraftFriend, removeDraftFriend, resetDraft, addPlan, plans, deletePlan, updatePlanStatus } = usePlannerStore();
  const { watchlist } = useWatchlistStore();
  const { city: userCity, preferredChain } = useUserPreferencesStore();

  const [activeTab, setActiveTab] = useState("builder"); // 'builder' | 'my-plans'
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(userCity || "Mumbai");
  const [customCinema, setCustomCinema] = useState("");
  const [newFriendName, setNewFriendName] = useState("");
  const [newFriendAvatar, setNewFriendAvatar] = useState("🍿");
  const [shareSuccess, setShareSuccess] = useState(false);
  const [justSavedPlan, setJustSavedPlan] = useState(null);

  // Quick prefill from query parameter if provided
  useEffect(() => {
    if (prefillMovieId && prefillTitle && (!draft.movie || draft.movie.id !== Number(prefillMovieId))) {
      fetch(`/api/tmdb/movie?id=${prefillMovieId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.id) {
            setDraftMovie(data);
            setStep(2);
          }
        })
        .catch(() => {});
    }
  }, [prefillMovieId, prefillTitle]);

  // Live search for movies
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/tmdb/search?query=${encodeURIComponent(searchQuery)}&page=1`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectMovie = (movie) => {
    setDraftMovie(movie);
    setStep(2);
  };

  const handleSelectCinema = (cinema) => {
    setDraftCinema({ ...cinema, city: selectedCity });
  };

  const handleAddFriend = (e) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;
    addDraftFriend({
      name: newFriendName.trim(),
      avatar: newFriendAvatar,
      status: "invited",
    });
    setNewFriendName("");
  };

  const handleSavePlan = async () => {
    if (!draft.movie) {
      alert("Please select a movie first!");
      setStep(1);
      return;
    }

    const newPlanObj = {
      _id: `plan-${Date.now()}`,
      movie: draft.movie,
      cinema: draft.cinema,
      date: draft.date,
      time: draft.time,
      slotName: draft.slotName,
      friends: draft.friends,
      notes: draft.notes,
      seats: draft.seats,
      bookingRef: draft.bookingRef || `CIN-${Math.floor(10000 + Math.random() * 90000)}`,
      status: "upcoming",
      createdAt: new Date().toISOString(),
    };

    // Save to Zustand store
    addPlan(newPlanObj);
    setJustSavedPlan(newPlanObj);
    setActiveTab("my-plans");

    // Also persist via API asynchronously
    try {
      await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPlanObj),
      });
    } catch (e) {
      // Local Zustand backup is already active
    }
  };

  const handleShareWhatsApp = (plan) => {
    const text = `🍿 *CineTrip Invitation!* 🎬\n\nMovie: *${plan.movie.title}*\nCinema: *${plan.cinema.name} (${plan.cinema.screenType})*\nCity: ${plan.cinema.city || selectedCity}\nDate: *${plan.date}*\nShowtime: *${plan.time} (${plan.slotName})*\nSeats: ${plan.seats || 'General Admission'}\n\nJoin the squad for this movie outing! 🚀`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleExportCalendar = (plan) => {
    const title = `🎬 CineTrip: ${plan.movie.title} @ ${plan.cinema.name}`;
    const details = `Cinema: ${plan.cinema.name}\nSeats: ${plan.seats}\nSquad: ${plan.friends?.map(f => f.name).join(', ')}`;
    const location = `${plan.cinema.name}, ${plan.cinema.address || plan.cinema.city}`;
    
    // Format Google Calendar date
    const startStr = `${plan.date.replace(/-/g, '')}T${plan.time.replace(':', '')}00`;
    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startStr}/${startStr}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
    window.open(googleCalUrl, "_blank");
  };

  const currentCinemas = POPULAR_CINEMAS[selectedCity] || POPULAR_CINEMAS["Mumbai"];

  return (
    <div className="planner-page container" style={{ paddingBottom: "100px" }}>
      {/* HEADER */}
      <div className="planner-hero-header">
        <div className="planner-badge">
          <CalendarDays size={16} />
          <span>CineTrip Cinema Outing Studio</span>
        </div>
        <h1 className="planner-title">
          Plan Your Next <span className="text-gradient">Movie Outing</span>
        </h1>
        <p className="planner-subtitle">
          Pick your movie, reserve showtimes, select premium theaters (IMAX, Dolby, 4DX), invite friends, and generate cinematic digital ticket passes.
        </p>

        {/* TABS SWITCHER */}
        <div className="planner-tabs-bar">
          <button
            onClick={() => setActiveTab("builder")}
            className={`planner-tab-btn ${activeTab === "builder" ? "active" : ""}`}
          >
            <Plus size={16} />
            <span>Outing Builder</span>
          </button>
          <button
            onClick={() => setActiveTab("my-plans")}
            className={`planner-tab-btn ${activeTab === "my-plans" ? "active" : ""}`}
          >
            <Ticket size={16} />
            <span>My CineTrips ({plans.length})</span>
          </button>
        </div>
      </div>

      {activeTab === "builder" ? (
        <div className="planner-builder-grid">
          {/* LEFT: STEP WIZARD FORM */}
          <div className="builder-main-card">
            {/* STEP PROGRESS INDICATORS */}
            <div className="step-progress-row">
              {[
                { num: 1, label: "Movie" },
                { num: 2, label: "Date & Time" },
                { num: 3, label: "Cinema" },
                { num: 4, label: "Friends" },
                { num: 5, label: "Confirm" },
              ].map((s) => (
                <button
                  key={s.num}
                  onClick={() => setStep(s.num)}
                  className={`step-bubble-btn ${step === s.num ? "active" : step > s.num ? "completed" : ""}`}
                >
                  <div className="step-circle">{step > s.num ? "✓" : s.num}</div>
                  <span className="step-text">{s.label}</span>
                </button>
              ))}
            </div>

            {/* STEP 1: SELECT MOVIE */}
            {step === 1 && (
              <div className="step-content-box animate-fadeIn">
                <div className="step-header">
                  <h2>Step 1: Select a Movie</h2>
                  <p>Search TMDB catalog or pick from your Watchlist.</p>
                </div>

                {/* SEARCH BAR */}
                <div className="step-search-row">
                  <div className="step-search-input-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search movie title (e.g. Dune, Inception, Avatar)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="step-input"
                    />
                  </div>
                </div>

                {/* SEARCH RESULTS */}
                {searchLoading ? (
                  <div className="step-loading-box">Searching TMDB movies...</div>
                ) : searchResults.length > 0 ? (
                  <div className="movie-selection-grid">
                    {searchResults.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleSelectMovie(m)}
                        className={`selectable-movie-card ${draft.movie?.id === m.id ? "selected" : ""}`}
                      >
                        <div className="card-poster">
                          <Image
                            src={m.poster_path ? `https://image.tmdb.org/t/p/w342${m.poster_path}` : "/default-1778606634.jpg"}
                            alt={m.title}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                        <div className="card-info">
                          <h4>{m.title}</h4>
                          <span className="release-year">{m.release_date?.slice(0, 4)}</span>
                          <span className="rating-pill">★ {m.vote_average ? m.vote_average.toFixed(1) : "N/A"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    {/* WATCHLIST QUICK PICKS */}
                    {watchlist.length > 0 && (
                      <div className="watchlist-quickpick-section">
                        <h4 className="section-mini-title">From Your Watchlist</h4>
                        <div className="movie-selection-grid">
                          {watchlist.slice(0, 6).map((m) => (
                            <div
                              key={m.id}
                              onClick={() => handleSelectMovie(m)}
                              className={`selectable-movie-card ${draft.movie?.id === m.id ? "selected" : ""}`}
                            >
                              <div className="card-poster">
                                <Image
                                  src={m.poster_path ? `https://image.tmdb.org/t/p/w342${m.poster_path}` : "/default-1778606634.jpg"}
                                  alt={m.title || m.name}
                                  fill
                                  style={{ objectFit: "cover" }}
                                />
                              </div>
                              <div className="card-info">
                                <h4>{m.title || m.name}</h4>
                                <span className="release-year">★ {m.vote_average ? m.vote_average.toFixed(1) : "8.0"}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: DATE & TIME */}
            {step === 2 && (
              <div className="step-content-box animate-fadeIn">
                <div className="step-header">
                  <h2>Step 2: Date & Showtime</h2>
                  <p>Choose when you and your crew want to watch.</p>
                </div>

                {/* DATE SELECTOR */}
                <div className="form-group">
                  <label className="form-label">Select Date</label>
                  <div className="date-quick-presets">
                    {[
                      { label: "Today", days: 0 },
                      { label: "Tomorrow", days: 1 },
                      { label: "This Friday", days: (5 - new Date().getDay() + 7) % 7 || 7 },
                      { label: "Saturday", days: (6 - new Date().getDay() + 7) % 7 || 7 },
                      { label: "Sunday", days: (0 - new Date().getDay() + 7) % 7 || 7 },
                    ].map((p, idx) => {
                      const d = new Date();
                      d.setDate(d.getDate() + p.days);
                      const dStr = d.toISOString().split("T")[0];
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setDraftDateTime(dStr, draft.time, draft.slotName)}
                          className={`preset-btn ${draft.date === dStr ? "active" : ""}`}
                        >
                          {p.label} <small>({d.toLocaleDateString("en-US", { month: "short", day: "numeric" })})</small>
                        </button>
                      );
                    })}
                  </div>
                  <input
                    type="date"
                    value={draft.date}
                    onChange={(e) => setDraftDateTime(e.target.value, draft.time, draft.slotName)}
                    className="step-input date-input"
                    style={{ marginTop: "12px", width: "100%", maxWidth: "300px" }}
                  />
                </div>

                {/* TIME SLOTS */}
                <div className="form-group" style={{ marginTop: "24px" }}>
                  <label className="form-label">Select Showtime Slot</label>
                  <div className="time-slots-grid">
                    {TIME_SLOTS.map((ts, idx) => (
                      <div
                        key={idx}
                        onClick={() => setDraftDateTime(draft.date, ts.time, ts.label)}
                        className={`time-slot-card ${draft.time === ts.time ? "selected" : ""}`}
                      >
                        <span className="slot-icon">{ts.icon}</span>
                        <div className="slot-info">
                          <span className="slot-time">{ts.period}</span>
                          <span className="slot-name">{ts.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="step-actions-row">
                  <button onClick={() => setStep(1)} className="btn-secondary">
                    Back
                  </button>
                  <button onClick={() => setStep(3)} className="btn-primary">
                    Next: Cinema Selection <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CINEMA & LOCATION */}
            {step === 3 && (
              <div className="step-content-box animate-fadeIn">
                <div className="step-header">
                  <h2>Step 3: Cinema & Location</h2>
                  <p>Select your favorite theater chain or enter a custom cinema.</p>
                </div>

                {/* CITY FILTER */}
                <div className="form-group">
                  <label className="form-label">City / Region</label>
                  <div className="city-pill-row">
                    {Object.keys(POPULAR_CINEMAS).map((cityKey) => (
                      <button
                        key={cityKey}
                        type="button"
                        onClick={() => setSelectedCity(cityKey)}
                        className={`city-pill ${selectedCity === cityKey ? "active" : ""}`}
                      >
                        <MapPin size={13} />
                        <span>{cityKey.replace("_", " ")}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* CINEMA CARDS */}
                <div className="cinema-list-grid">
                  {currentCinemas.map((c, i) => (
                    <div
                      key={i}
                      onClick={() => handleSelectCinema(c)}
                      className={`cinema-option-card ${draft.cinema?.name === c.name ? "selected" : ""}`}
                    >
                      <div className="cinema-brand-badge">{c.brand}</div>
                      <div className="cinema-info">
                        <h4>{c.name}</h4>
                        <div className="cinema-screen-format">✨ {c.screenType}</div>
                        <p className="cinema-address">{c.address}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CUSTOM CINEMA OPTION */}
                <div className="custom-cinema-box">
                  <label className="form-label">Or Custom Cinema Theater Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Cineplex Odeon / Local Landmark Cinema..."
                    value={customCinema}
                    onChange={(e) => {
                      setCustomCinema(e.target.value);
                      if (e.target.value.trim()) {
                        setDraftCinema({
                          name: e.target.value,
                          brand: "Cinema",
                          screenType: "Standard 4K",
                          address: selectedCity,
                          city: selectedCity,
                        });
                      }
                    }}
                    className="step-input"
                  />
                </div>

                <div className="step-actions-row">
                  <button onClick={() => setStep(2)} className="btn-secondary">
                    Back
                  </button>
                  <button onClick={() => setStep(4)} className="btn-primary">
                    Next: Squad & Friends <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: FRIENDS & SQUAD */}
            {step === 4 && (
              <div className="step-content-box animate-fadeIn">
                <div className="step-header">
                  <h2>Step 4: Friends & Squad</h2>
                  <p>Add friends joining this CineTrip to share digital tickets.</p>
                </div>

                {/* ADD FRIEND FORM */}
                <form onSubmit={handleAddFriend} className="add-friend-form">
                  <div className="friend-input-wrapper">
                    <select
                      value={newFriendAvatar}
                      onChange={(e) => setNewFriendAvatar(e.target.value)}
                      className="avatar-select"
                    >
                      <option value="🍿">🍿</option>
                      <option value="🚀">🚀</option>
                      <option value="✨">✨</option>
                      <option value="🥤">🥤</option>
                      <option value="😎">😎</option>
                      <option value="🎬">🎬</option>
                      <option value="👑">👑</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Friend's Name (e.g. Dev, Sarah, Maya)..."
                      value={newFriendName}
                      onChange={(e) => setNewFriendName(e.target.value)}
                      className="step-input"
                    />
                    <button type="submit" className="btn-primary" style={{ padding: "0 20px" }}>
                      <Plus size={16} /> Add
                    </button>
                  </div>
                </form>

                {/* INVITED LIST */}
                <div className="friends-tag-list">
                  {draft.friends.map((f, i) => (
                    <div key={i} className="friend-tag">
                      <span className="friend-avatar">{f.avatar}</span>
                      <span className="friend-name">{f.name}</span>
                      <span className="friend-status">({f.status})</span>
                      <button
                        type="button"
                        onClick={() => removeDraftFriend(f.name)}
                        className="remove-friend-btn"
                        aria-label="Remove friend"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* SEAT & NOTES */}
                <div className="form-group" style={{ marginTop: "24px" }}>
                  <label className="form-label">Seats / Row Preference</label>
                  <input
                    type="text"
                    placeholder="e.g. Row F, Seats 14-16 (Recliners)"
                    value={draft.seats || ""}
                    onChange={(e) => setDraftNotes(draft.notes, e.target.value, draft.bookingRef)}
                    className="step-input"
                  />
                </div>

                <div className="form-group" style={{ marginTop: "16px" }}>
                  <label className="form-label">Trip Notes / Snacks Plan</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Meeting 20 mins early in the lobby for nachos & caramel popcorn!"
                    value={draft.notes || ""}
                    onChange={(e) => setDraftNotes(e.target.value, draft.seats, draft.bookingRef)}
                    className="step-input textarea-input"
                  />
                </div>

                <div className="step-actions-row">
                  <button onClick={() => setStep(3)} className="btn-secondary">
                    Back
                  </button>
                  <button onClick={() => setStep(5)} className="btn-primary">
                    Next: Review & Generate Pass <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: CONFIRM & GENERATE */}
            {step === 5 && (
              <div className="step-content-box animate-fadeIn">
                <div className="step-header">
                  <h2>Step 5: Review CineTrip Plan</h2>
                  <p>Confirm your booking details and generate your digital pass.</p>
                </div>

                {/* SUMMARY REVIEW */}
                <div className="plan-review-summary">
                  <div className="summary-row">
                    <span className="label">Movie:</span>
                    <strong className="value">{draft.movie?.title || "No movie selected"}</strong>
                  </div>
                  <div className="summary-row">
                    <span className="label">Cinema:</span>
                    <strong className="value">{draft.cinema?.name} ({draft.cinema?.screenType})</strong>
                  </div>
                  <div className="summary-row">
                    <span className="label">Date & Time:</span>
                    <strong className="value">{draft.date} @ {draft.time} ({draft.slotName})</strong>
                  </div>
                  <div className="summary-row">
                    <span className="label">Squad ({draft.friends?.length}):</span>
                    <span className="value">
                      {draft.friends?.map(f => `${f.avatar} ${f.name}`).join(", ") || "Solo Outing"}
                    </span>
                  </div>
                  {draft.seats && (
                    <div className="summary-row">
                      <span className="label">Seats:</span>
                      <strong className="value">{draft.seats}</strong>
                    </div>
                  )}
                </div>

                <div className="step-actions-row" style={{ marginTop: "24px" }}>
                  <button onClick={() => setStep(4)} className="btn-secondary">
                    Back
                  </button>
                  <button onClick={handleSavePlan} className="btn-primary create-plan-glow-btn">
                    <Sparkles size={18} />
                    <span>Create & Save CineTrip Plan</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: LIVE DIGITAL PASS PREVIEW */}
          <div className="builder-pass-preview-card">
            <div className="preview-header">
              <span className="preview-pill">LIVE DIGITAL PASS</span>
              <span className="preview-brand">CineTrip Boarding Pass</span>
            </div>

            {/* CINEMATIC TICKET CARD */}
            <div className="cinetrip-digital-pass">
              <div className="pass-top-poster">
                {draft.movie ? (
                  <div className="pass-poster-image">
                    <Image
                      src={
                        draft.movie.backdrop_path
                          ? `https://image.tmdb.org/t/p/w780${draft.movie.backdrop_path}`
                          : draft.movie.poster_path
                          ? `https://image.tmdb.org/t/p/w500${draft.movie.poster_path}`
                          : "/default-1778606634.jpg"
                      }
                      alt={draft.movie.title}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                    <div className="pass-poster-overlay" />
                    <div className="pass-movie-details">
                      <span className="pass-format-badge">{draft.cinema?.screenType || "IMAX Laser"}</span>
                      <h3 className="pass-movie-title">{draft.movie.title}</h3>
                      <div className="pass-meta-line">
                        <span>★ {draft.movie.vote_average ? draft.movie.vote_average.toFixed(1) : "8.2"}</span>
                        <span>•</span>
                        <span>{draft.movie.release_date?.slice(0, 4)}</span>
                        <span>•</span>
                        <span>{draft.cinema?.brand || "IMAX"}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pass-empty-poster">
                    <Film size={36} />
                    <span>Select a movie to preview pass</span>
                  </div>
                )}
              </div>

              {/* TICKET PERFORATION LINE */}
              <div className="pass-perforation">
                <div className="cutout-left" />
                <div className="dashed-line" />
                <div className="cutout-right" />
              </div>

              {/* TICKET BOTTOM DETAILS */}
              <div className="pass-bottom-details">
                <div className="pass-grid-info">
                  <div className="info-block">
                    <span className="label">DATE</span>
                    <strong className="val">{draft.date}</strong>
                  </div>
                  <div className="info-block">
                    <span className="label">TIME</span>
                    <strong className="val">{draft.time}</strong>
                  </div>
                  <div className="info-block">
                    <span className="label">THEATER</span>
                    <strong className="val text-truncate">{draft.cinema?.name || "IMAX"}</strong>
                  </div>
                  <div className="info-block">
                    <span className="label">SEATS</span>
                    <strong className="val">{draft.seats || "Row F (Center)"}</strong>
                  </div>
                </div>

                {/* SQUAD AVATARS */}
                <div className="pass-squad-row">
                  <span className="squad-label">SQUAD:</span>
                  <div className="squad-chips">
                    {draft.friends.map((f, i) => (
                      <span key={i} className="squad-chip" title={f.name}>
                        {f.avatar} {f.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* BARCODE FOOTER */}
                <div className="pass-barcode-footer">
                  <div className="dummy-barcode" />
                  <span className="pass-ref">PASS-REF: {draft.bookingRef || "CIN-88429"}</span>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS ON DRAFT */}
            <div className="draft-quick-actions">
              <button
                type="button"
                onClick={() => handleShareWhatsApp({ movie: draft.movie || { title: "Movie Outing" }, cinema: draft.cinema, date: draft.date, time: draft.time, slotName: draft.slotName, seats: draft.seats, friends: draft.friends })}
                className="btn-whatsapp-share"
              >
                <Share2 size={16} /> Share on WhatsApp
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* MY SAVED PLANS TAB */
        <div className="my-plans-container animate-fadeIn">
          {plans.length === 0 ? (
            <div className="empty-plans-box">
              <Ticket size={48} className="empty-icon" />
              <h3>No CineTrips Planned Yet</h3>
              <p>Create your first movie outing with friends using the Outing Builder!</p>
              <button onClick={() => setActiveTab("builder")} className="btn-primary" style={{ marginTop: "16px" }}>
                <Plus size={16} /> Start Planning
              </button>
            </div>
          ) : (
            <div className="plans-cards-grid">
              {plans.map((plan) => (
                <div key={plan._id} className="saved-plan-card">
                  <div className="plan-card-header">
                    <div className="plan-card-poster">
                      <Image
                        src={
                          plan.movie?.poster_path
                            ? `https://image.tmdb.org/t/p/w185${plan.movie.poster_path}`
                            : "/default-1778606634.jpg"
                        }
                        alt={plan.movie?.title || "Movie"}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className="plan-card-main-info">
                      <div className="plan-status-pill">
                        <span className={`status-dot ${plan.status}`} />
                        <span>{plan.status.toUpperCase()}</span>
                      </div>
                      <h3 className="plan-movie-title">{plan.movie?.title}</h3>
                      <div className="plan-cinema-line">
                        <MapPin size={14} />
                        <span>{plan.cinema?.name}</span>
                      </div>
                      <div className="plan-datetime-badge">
                        <CalendarIcon size={14} />
                        <span>{plan.date} @ {plan.time}</span>
                        <span className="slot-badge">{plan.slotName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="plan-card-body">
                    {plan.seats && (
                      <div className="plan-seat-pill">
                        <Ticket size={13} />
                        <span>Seats: {plan.seats}</span>
                      </div>
                    )}
                    {plan.notes && <p className="plan-notes-snippet">"{plan.notes}"</p>}

                    {/* SQUAD CHIPS */}
                    {plan.friends?.length > 0 && (
                      <div className="plan-squad-list">
                        <span className="squad-heading">Squad:</span>
                        {plan.friends.map((f, i) => (
                          <span key={i} className="squad-member-pill">
                            {f.avatar} {f.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="plan-card-footer">
                    <div className="footer-action-group">
                      <button
                        onClick={() => handleShareWhatsApp(plan)}
                        className="plan-action-btn share-btn"
                        title="Share on WhatsApp"
                      >
                        <Share2 size={15} /> WhatsApp
                      </button>
                      <button
                        onClick={() => handleExportCalendar(plan)}
                        className="plan-action-btn cal-btn"
                        title="Add to Google Calendar"
                      >
                        <CalendarDays size={15} /> Calendar
                      </button>
                    </div>

                    <div className="footer-manage-group">
                      <Link href={`/movie/${plan.movie?.id}`} className="plan-icon-btn" title="View Movie Details">
                        <Eye size={16} />
                      </Link>
                      <button
                        onClick={() => deletePlan(plan._id)}
                        className="plan-icon-btn delete-btn"
                        title="Delete Plan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
