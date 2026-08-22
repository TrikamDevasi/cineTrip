"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  History, 
  Sparkles, 
  Calendar, 
  Plus, 
  Star, 
  MapPin, 
  Users, 
  Camera, 
  Heart, 
  Trash2, 
  Film, 
  Clock, 
  Eye, 
  X,
  Popcorn,
  Ticket
} from "lucide-react";
import { useMemoryStore } from "@/store/useMemoryStore";
import { usePlannerStore } from "@/store/usePlannerStore";

export default function HistoryPage() {
  const { memories, addMemory, deleteMemory } = useMemoryStore();
  const { plans } = usePlannerStore();

  const [activeTab, setActiveTab] = useState("memories"); // 'memories' | 'nights'
  const [modalOpen, setModalOpen] = useState(false);

  // New Memory Form State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [watchedDate, setWatchedDate] = useState(new Date().toISOString().split("T")[0]);
  const [experienceType, setExperienceType] = useState("theatrical");
  const [cinemaName, setCinemaName] = useState("IMAX with Laser");
  const [rating, setRating] = useState(5);
  const [story, setStory] = useState("");
  const [favoriteMoment, setFavoriteMoment] = useState("");
  const [snackHighlight, setSnackHighlight] = useState("");
  const [companionName, setCompanionName] = useState("");
  const [companionsList, setCompanionsList] = useState([]);

  // Search TMDB for movie to log
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tmdb/search?query=${encodeURIComponent(searchQuery)}&page=1`);
        const data = await res.json();
        setSearchResults((data.results || []).slice(0, 5));
      } catch (e) {
        setSearchResults([]);
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddCompanion = (e) => {
    e.preventDefault();
    if (!companionName.trim()) return;
    setCompanionsList([...companionsList, { name: companionName.trim(), avatar: "🍿" }]);
    setCompanionName("");
  };

  const handleSaveMemory = (e) => {
    e.preventDefault();
    if (!selectedMovie) {
      alert("Please select a movie first!");
      return;
    }

    const newMem = {
      movie: {
        id: selectedMovie.id,
        title: selectedMovie.title || selectedMovie.name,
        poster_path: selectedMovie.poster_path,
        backdrop_path: selectedMovie.backdrop_path,
        release_date: selectedMovie.release_date || selectedMovie.first_air_date,
      },
      watchedDate,
      experienceType,
      cinemaName,
      rating,
      story,
      favoriteMoment,
      snackHighlight,
      companions: companionsList,
    };

    addMemory(newMem);
    setModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedMovie(null);
    setSearchQuery("");
    setStory("");
    setFavoriteMoment("");
    setSnackHighlight("");
    setCompanionsList([]);
  };

  return (
    <div className="history-page container" style={{ paddingBottom: "100px" }}>
      {/* HEADER */}
      <div className="history-hero-header">
        <div className="history-badge">
          <History size={16} />
          <span>Movie Log & Memories Scrapbook</span>
        </div>
        <h1 className="history-title">
          Relive Your <span className="text-gradient">Movie Memories</span>
        </h1>
        <p className="history-subtitle">
          A dedicated journal of your cinema trips, premiere nights, companion squads, and favorite on-screen moments.
        </p>

        {/* TABS & ACTION */}
        <div className="history-controls-row">
          <div className="history-tabs-bar">
            <button
              onClick={() => setActiveTab("memories")}
              className={`history-tab-btn ${activeTab === "memories" ? "active" : ""}`}
            >
              <Camera size={16} />
              <span>Memories Scrapbook ({memories.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("nights")}
              className={`history-tab-btn ${activeTab === "nights" ? "active" : ""}`}
            >
              <Calendar size={16} />
              <span>Movie Nights Timeline ({plans.length})</span>
            </button>
          </div>

          <button onClick={() => setModalOpen(true)} className="btn-primary add-memory-btn">
            <Plus size={16} />
            <span>Log a Movie Memory</span>
          </button>
        </div>
      </div>

      {/* MEMORIES SCRAPBOOK TAB */}
      {activeTab === "memories" && (
        <div className="memories-grid-container animate-fadeIn">
          {memories.length === 0 ? (
            <div className="empty-history-box">
              <Camera size={48} className="empty-icon" />
              <h3>No Movie Memories Logged Yet</h3>
              <p>Capture your cinema experiences, unforgettable scenes, and theater snacks!</p>
              <button onClick={() => setModalOpen(true)} className="btn-primary" style={{ marginTop: "16px" }}>
                <Plus size={16} /> Log First Memory
              </button>
            </div>
          ) : (
            <div className="memories-cards-grid">
              {memories.map((mem) => (
                <div key={mem._id} className="memory-card">
                  {/* BACKDROP POSTER */}
                  <div className="memory-poster-header">
                    <Image
                      src={
                        mem.movie.backdrop_path
                          ? `https://image.tmdb.org/t/p/w780${mem.movie.backdrop_path}`
                          : mem.movie.poster_path
                          ? `https://image.tmdb.org/t/p/w500${mem.movie.poster_path}`
                          : "/default-1778606634.jpg"
                      }
                      alt={mem.movie.title}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                    <div className="memory-header-overlay" />
                    
                    <div className="memory-meta-badges">
                      <span className="memory-date-pill">
                        <Calendar size={12} />
                        {new Date(mem.watchedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span className="memory-stars">
                        {[...Array(mem.rating)].map((_, i) => (
                          <Star key={i} size={14} fill="#f5c518" color="#f5c518" />
                        ))}
                      </span>
                    </div>

                    <div className="memory-movie-title-box">
                      <h3>{mem.movie.title}</h3>
                      <div className="memory-venue-line">
                        <MapPin size={13} />
                        <span>{mem.cinemaName || "Theatrical Experience"}</span>
                      </div>
                    </div>
                  </div>

                  {/* MEMORY BODY / NOTES */}
                  <div className="memory-card-body">
                    {mem.story && (
                      <p className="memory-story-text">
                        "{mem.story}"
                      </p>
                    )}

                    {mem.favoriteMoment && (
                      <div className="memory-highlight-block">
                        <span className="highlight-tag">✨ Favorite Moment:</span>
                        <p>{mem.favoriteMoment}</p>
                      </div>
                    )}

                    {mem.snackHighlight && (
                      <div className="memory-snack-line">
                        <span>🍿 Snacks:</span> <strong>{mem.snackHighlight}</strong>
                      </div>
                    )}

                    {/* SQUAD AVATARS */}
                    {mem.companions?.length > 0 && (
                      <div className="memory-squad-row">
                        <span className="squad-label">Squad:</span>
                        <div className="squad-chips">
                          {mem.companions.map((c, i) => (
                            <span key={i} className="squad-chip">
                              {c.avatar || "🍿"} {c.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CARD FOOTER */}
                  <div className="memory-card-footer">
                    <Link href={`/movie/${mem.movie.id}`} className="memory-action-btn">
                      <Eye size={14} /> Film Details
                    </Link>
                    <button
                      onClick={() => deleteMemory(mem._id)}
                      className="memory-delete-btn"
                      title="Delete Memory"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MOVIE NIGHTS TIMELINE TAB */}
      {activeTab === "nights" && (
        <div className="timeline-container animate-fadeIn">
          {plans.length === 0 ? (
            <div className="empty-history-box">
              <Calendar size={48} className="empty-icon" />
              <h3>No Movie Nights in History</h3>
              <p>Use the Trip Planner to schedule your upcoming movie outings!</p>
              <Link href="/planner" className="btn-primary" style={{ marginTop: "16px", display: "inline-flex" }}>
                Go to Planner
              </Link>
            </div>
          ) : (
            <div className="timeline-vertical-flow">
              {plans.map((plan, idx) => (
                <div key={plan._id || idx} className="timeline-item">
                  <div className="timeline-marker">
                    <div className="timeline-dot" />
                    {idx < plans.length - 1 && <div className="timeline-connector" />}
                  </div>

                  <div className="timeline-card">
                    <div className="timeline-card-header">
                      <span className="timeline-date">{plan.date} • {plan.time}</span>
                      <span className="timeline-status-badge">{plan.status?.toUpperCase()}</span>
                    </div>

                    <div className="timeline-movie-row">
                      <div className="timeline-poster">
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
                      <div className="timeline-info">
                        <h4>{plan.movie?.title}</h4>
                        <p className="timeline-cinema-info">
                          <MapPin size={14} /> {plan.cinema?.name} ({plan.cinema?.screenType})
                        </p>
                        {plan.seats && (
                          <p className="timeline-seats">
                            <Ticket size={13} /> {plan.seats}
                          </p>
                        )}
                        {plan.friends?.length > 0 && (
                          <div className="timeline-squad">
                            <span>Squad: </span>
                            {plan.friends.map((f, i) => (
                              <span key={i} className="squad-mini-tag">
                                {f.avatar} {f.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ADD MEMORY MODAL */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card animate-scaleUp">
            <div className="modal-header">
              <h2>Log a Movie Memory</h2>
              <button onClick={() => setModalOpen(false)} className="close-btn" aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveMemory} className="modal-form">
              {/* SELECT MOVIE */}
              <div className="form-group">
                <label className="form-label">Movie</label>
                {selectedMovie ? (
                  <div className="selected-movie-preview">
                    <span>🎬 <strong>{selectedMovie.title || selectedMovie.name}</strong></span>
                    <button type="button" onClick={() => setSelectedMovie(null)} className="btn-text-action">Change</button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      placeholder="Search movie title to log..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="step-input"
                    />
                    {searchResults.length > 0 && (
                      <div className="modal-search-results">
                        {searchResults.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => {
                              setSelectedMovie(m);
                              setSearchResults([]);
                              setSearchQuery("");
                            }}
                            className="modal-search-item"
                          >
                            <span>{m.title || m.name} ({(m.release_date || m.first_air_date)?.slice(0, 4)})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* DATE & VENUE */}
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Watched Date</label>
                  <input
                    type="date"
                    value={watchedDate}
                    onChange={(e) => setWatchedDate(e.target.value)}
                    className="step-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Rating (1-5 Stars)</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="step-input"
                  >
                    <option value={5}>★★★★★ (5/5) Masterpiece</option>
                    <option value={4}>★★★★☆ (4/5) Great</option>
                    <option value={3}>★★★☆☆ (3/5) Good</option>
                    <option value={2}>★★☆☆☆ (2/5) Mediocre</option>
                    <option value={1}>★☆☆☆☆ (1/5) Disappointing</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Cinema / Theater Name</label>
                <input
                  type="text"
                  placeholder="e.g. IMAX Laser Lower Parel, Home Theater, etc."
                  value={cinemaName}
                  onChange={(e) => setCinemaName(e.target.value)}
                  className="step-input"
                />
              </div>

              {/* STORY / MEMORY */}
              <div className="form-group">
                <label className="form-label">The Experience & Story</label>
                <textarea
                  rows={2}
                  placeholder="How was the crowd? What made this screening memorable?"
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  className="step-input textarea-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Favorite Moment / Quote</label>
                <input
                  type="text"
                  placeholder="e.g. The climactic interstellar wormhole sequence"
                  value={favoriteMoment}
                  onChange={(e) => setFavoriteMoment(e.target.value)}
                  className="step-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Snacks & Concessions</label>
                <input
                  type="text"
                  placeholder="e.g. Large Caramel Popcorn, Nachos & Cold Brew"
                  value={snackHighlight}
                  onChange={(e) => setSnackHighlight(e.target.value)}
                  className="step-input"
                />
              </div>

              {/* COMPANIONS */}
              <div className="form-group">
                <label className="form-label">Who watched with you?</label>
                <div className="companion-input-row">
                  <input
                    type="text"
                    placeholder="Friend's name..."
                    value={companionName}
                    onChange={(e) => setCompanionName(e.target.value)}
                    className="step-input"
                  />
                  <button type="button" onClick={handleAddCompanion} className="btn-secondary">
                    Add
                  </button>
                </div>
                {companionsList.length > 0 && (
                  <div className="companions-chip-list">
                    {companionsList.map((c, i) => (
                      <span key={i} className="squad-chip">
                        {c.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Memory Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
