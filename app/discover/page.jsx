"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Compass, 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  Star, 
  Calendar, 
  Flame, 
  Film, 
  Heart, 
  CalendarDays, 
  X,
  ChevronDown
} from "lucide-react";
import useWatchlistStore from "@/store/useWatchlistStore";

const GENRES = [
  { id: 28, name: "Action", icon: "💥", color: "linear-gradient(135deg, #ef4444, #991b1b)" },
  { id: 878, name: "Sci-Fi", icon: "🚀", color: "linear-gradient(135deg, #3b82f6, #1d4ed8)" },
  { id: 53, name: "Thriller", icon: "⚡", color: "linear-gradient(135deg, #f97316, #c2410c)" },
  { id: 27, name: "Horror", icon: "👻", color: "linear-gradient(135deg, #dc2626, #7f1d1d)" },
  { id: 35, name: "Comedy", icon: "😂", color: "linear-gradient(135deg, #eab308, #a16207)" },
  { id: 10749, name: "Romance", icon: "💖", color: "linear-gradient(135deg, #ec4899, #be185d)" },
  { id: 18, name: "Drama", icon: "🎭", color: "linear-gradient(135deg, #8b5cf6, #6d28d9)" },
  { id: 16, name: "Animation", icon: "🎨", color: "linear-gradient(135deg, #06b6d4, #0e7490)" },
  { id: 12, name: "Adventure", icon: "🧭", color: "linear-gradient(135deg, #10b981, #047857)" },
  { id: 80, name: "Crime", icon: "🕵️", color: "linear-gradient(135deg, #64748b, #334155)" },
  { id: 14, name: "Fantasy", icon: "🔮", color: "linear-gradient(135deg, #a855f7, #7e22ce)" },
  { id: 9648, name: "Mystery", icon: "🔍", color: "linear-gradient(135deg, #6366f1, #4338ca)" },
];

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "🔥 Most Popular" },
  { value: "vote_average.desc", label: "★ Highest Rated" },
  { value: "primary_release_date.desc", label: "📅 Newest Releases" },
  { value: "revenue.desc", label: "💰 Box Office Gross" },
];

export default function DiscoverPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialGenre = searchParams.get("genre") ? Number(searchParams.get("genre")) : null;

  const [query, setQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [minRating, setMinRating] = useState(0);
  const [selectedYear, setSelectedYear] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlistStore();

  useEffect(() => {
    fetchMovies(1, true);
  }, [query, selectedGenre, sortBy, minRating, selectedYear]);

  const fetchMovies = async (pageNum = 1, reset = false) => {
    setLoading(true);
    try {
      let url = "";
      if (query.trim()) {
        url = `/api/tmdb/search?query=${encodeURIComponent(query)}&page=${pageNum}`;
      } else {
        const params = new URLSearchParams({
          page: String(pageNum),
          sortBy: sortBy,
        });
        if (selectedGenre) params.append("genreId", String(selectedGenre));
        if (minRating > 0) params.append("minRating", String(minRating));
        if (selectedYear) params.append("year", selectedYear);
        url = `/api/tmdb/genres?${params.toString()}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      const results = data.results || [];

      if (reset) {
        setMovies(results);
      } else {
        setMovies((prev) => [...prev, ...results]);
      }
      setHasMore(results.length >= 15);
      setPage(pageNum);
    } catch (err) {
      console.error("Discover fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenreToggle = (genreId) => {
    if (selectedGenre === genreId) {
      setSelectedGenre(null);
    } else {
      setSelectedGenre(genreId);
      setQuery(""); // Clear text search when browsing by genre
    }
  };

  const isMovieInWatchlist = (id) => watchlist.some((item) => item.id === id);

  const toggleWatchlist = (movie, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isMovieInWatchlist(movie.id)) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist({
        id: movie.id,
        title: movie.title || movie.name,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date || movie.first_air_date,
        media_type: "movie",
      });
    }
  };

  const handlePlanOuting = (movie, e) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/planner?movieId=${movie.id}&title=${encodeURIComponent(movie.title || movie.name)}`);
  };

  return (
    <div className="discover-page container" style={{ paddingBottom: "100px" }}>
      {/* DISCOVER HERO HEADER */}
      <div className="discover-hero-header">
        <div className="discover-badge">
          <Compass size={16} />
          <span>Catalog Explorer & Filter Suite</span>
        </div>
        <h1 className="discover-title">
          Discover <span className="text-gradient">Cinematic Worlds</span>
        </h1>
        <p className="discover-subtitle">
          Browse by genres, filter by ratings & box office records, search thousands of titles, and plan your next cinema trip.
        </p>

        {/* SEARCH INPUT */}
        <div className="discover-search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search any movie title, director, or franchise..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value) setSelectedGenre(null);
            }}
            className="discover-search-input"
          />
          {query && (
            <button onClick={() => setQuery("")} className="clear-search-btn" aria-label="Clear search">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* GENRES PILL BAR */}
      <div className="discover-genre-section">
        <div className="genre-section-header">
          <h3>Browse by Genre</h3>
          {selectedGenre && (
            <button onClick={() => setSelectedGenre(null)} className="clear-genre-btn">
              Reset Genre Filter
            </button>
          )}
        </div>
        <div className="genre-pills-row">
          {GENRES.map((g) => {
            const isSelected = selectedGenre === g.id;
            return (
              <button
                key={g.id}
                onClick={() => handleGenreToggle(g.id)}
                className={`genre-bubble-card ${isSelected ? "active" : ""}`}
                style={{
                  background: isSelected ? g.color : "var(--color-surface-2)",
                  borderColor: isSelected ? "transparent" : "var(--color-border)",
                }}
              >
                <span className="genre-icon">{g.icon}</span>
                <span className="genre-label">{g.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="discover-filter-bar">
        <div className="filter-item">
          <label className="filter-label">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label className="filter-label">Min Rating</label>
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="filter-select"
          >
            <option value="0">All Ratings</option>
            <option value="7">★ 7.0+ Excellent</option>
            <option value="8">★ 8.0+ Masterpiece</option>
            <option value="8.5">★ 8.5+ All-Time Greats</option>
          </select>
        </div>

        <div className="filter-item">
          <label className="filter-label">Release Era</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="filter-select"
          >
            <option value="">All Time</option>
            <option value="2026">2026 Releases</option>
            <option value="2025">2025 Blockbusters</option>
            <option value="2024">2024 Highlights</option>
            <option value="2023">2023 Hits</option>
            <option value="2020">2020s Era</option>
            <option value="2010">2010s Decade</option>
            <option value="2000">2000s Classics</option>
          </select>
        </div>
      </div>

      {/* MOVIE GRID */}
      {loading && movies.length === 0 ? (
        <div className="discover-loading-grid">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="discover-empty-state">
          <Film size={48} className="empty-icon" />
          <h3>No Movies Found</h3>
          <p>Try clearing your search query or picking another genre.</p>
          <button
            onClick={() => {
              setQuery("");
              setSelectedGenre(null);
              setMinRating(0);
              setSelectedYear("");
            }}
            className="btn-primary"
            style={{ marginTop: "16px" }}
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="discover-movies-grid">
            {movies.map((movie) => {
              const inWatchlist = isMovieInWatchlist(movie.id);
              return (
                <div key={movie.id} className="discover-card group">
                  <Link href={`/movie/${movie.id}`} className="discover-card-inner">
                    <div className="discover-poster-container">
                      <Image
                        src={
                          movie.poster_path
                            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                            : "/default-1778606634.jpg"
                        }
                        alt={movie.title || movie.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 20vw"
                        style={{ objectFit: "cover" }}
                        className="discover-poster-img"
                      />
                      
                      {/* OVERLAY RATING BADGE */}
                      <div className="discover-rating-badge">
                        <Star size={12} className="star-icon" />
                        <span>{movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}</span>
                      </div>

                      {/* HOVER QUICK ACTIONS */}
                      <div className="discover-hover-actions">
                        <button
                          onClick={(e) => toggleWatchlist(movie, e)}
                          className={`hover-action-btn ${inWatchlist ? "active" : ""}`}
                          title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                        >
                          <Heart size={16} fill={inWatchlist ? "currentColor" : "none"} />
                        </button>
                        <button
                          onClick={(e) => handlePlanOuting(movie, e)}
                          className="hover-action-btn plan-btn"
                          title="Plan CineTrip Outing"
                        >
                          <CalendarDays size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="discover-card-info">
                      <h4 className="discover-movie-title">{movie.title || movie.name}</h4>
                      <div className="discover-movie-meta">
                        <span>{(movie.release_date || movie.first_air_date)?.slice(0, 4) || "Movie"}</span>
                        <span>•</span>
                        <span className="popularity-num">★ {movie.vote_average ? movie.vote_average.toFixed(1) : "8.0"}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* LOAD MORE BUTTON */}
          {hasMore && (
            <div className="load-more-wrapper" style={{ textAlign: "center", marginTop: "40px" }}>
              <button
                onClick={() => fetchMovies(page + 1, false)}
                disabled={loading}
                className="btn-secondary load-more-btn"
              >
                {loading ? "Loading more films..." : "Load More Movies"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
