"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MovieCard from "@/components/MovieCard";
import SeriesCard from "@/components/SeriesCard";
import { Search, Film, Loader2, Filter, SlidersHorizontal } from "lucide-react";

const GENRE_PILLS = [
  { id: null, name: "All Genres" },
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" },
  { id: 27, name: "Horror" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
  { id: 10749, name: "Romance" },
];

export default function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(q);
  const [activeTab, setActiveTab] = useState("all"); // all, movie, tv
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [sortBy, setSortBy] = useState("popularity"); // popularity, rating, date
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (q) {
      setQuery(q);
      performSearch(q);
    } else {
      performSearch("Action");
    }
  }, [q]);

  async function performSearch(searchTerm) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(searchTerm)}`);
      if (!res.ok) throw new Error("Search failed");
      const json = await res.json();
      setResults(json.data?.results || []);
    } catch (err) {
      setError("Failed to fetch search results.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  // Filter and Sort Results
  const filteredResults = results
    .filter((item) => {
      if (activeTab === "movie") return item.media_type === "movie" || item.title;
      if (activeTab === "tv") return item.media_type === "tv" || item.name;
      return true;
    })
    .filter((item) => {
      if (!selectedGenre) return true;
      return item.genre_ids?.includes(selectedGenre);
    })
    .sort((a, b) => {
      if (sortBy === "rating") return (b.vote_average || 0) - (a.vote_average || 0);
      if (sortBy === "date") {
        const dateA = a.release_date || a.first_air_date || "";
        const dateB = b.release_date || b.first_air_date || "";
        return dateB.localeCompare(dateA);
      }
      return (b.popularity || 0) - (a.popularity || 0);
    });

  return (
    <div className="container animate-in pt-28 pb-16 min-h-screen space-y-8">
      {/* HEADER & SEARCH INPUT */}
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--color-text-primary)]">
          Search Cinematic Universe
        </h1>

        <form onSubmit={handleSearch}>
          <div className="relative flex items-center">
            <Search className="absolute left-5 w-5 h-5 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search movies, TV series, actors, directors..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm md:text-base text-[var(--color-text-primary)] outline-none shadow-2xl focus:border-[var(--color-accent)] transition-all"
            />
          </div>
        </form>
      </div>

      {/* FILTER & SORT TOOLBAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
        {/* Media Type Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "all"
                ? "bg-[var(--color-accent)] text-white shadow-md"
                : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-white"
            }`}
          >
            All Results
          </button>
          <button
            onClick={() => setActiveTab("movie")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "movie"
                ? "bg-[var(--color-accent)] text-white shadow-md"
                : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-white"
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => setActiveTab("tv")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "tv"
                ? "bg-[var(--color-accent)] text-white shadow-md"
                : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-white"
            }`}
          >
            TV Series
          </button>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[var(--color-text-muted)]" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] text-xs font-semibold text-[var(--color-text-primary)] outline-none cursor-pointer"
          >
            <option value="popularity">Sort by Popularity</option>
            <option value="rating">Sort by Rating</option>
            <option value="date">Sort by Release Date</option>
          </select>
        </div>
      </div>

      {/* GENRE PILLS BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {GENRE_PILLS.map((genre) => (
          <button
            key={genre.id ?? "all"}
            onClick={() => setSelectedGenre(genre.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedGenre === genre.id
                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                : "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]"
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>

      {/* RESULTS DISPLAY */}
      {loading && (
        <div className="py-20 text-center text-xs text-[var(--color-text-muted)] space-y-3">
          <Loader2 className="w-8 h-8 text-[var(--color-accent)] animate-spin mx-auto" />
          <p>Searching titles across global databases...</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
          {error}
        </div>
      )}

      {!loading && filteredResults.length === 0 && (
        <div className="py-20 text-center max-w-md mx-auto space-y-3">
          <Film className="w-12 h-12 text-[var(--color-text-muted)] mx-auto opacity-50" />
          <h3 className="text-lg font-bold text-[var(--color-text-primary)]">No Matches Found</h3>
          <p className="text-xs text-[var(--color-text-secondary)]">
            We couldn't find any results matching your search or active filters. Try clearing genre filters or using alternative titles.
          </p>
        </div>
      )}

      {!loading && filteredResults.length > 0 && (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-[var(--color-text-muted)]">
            Showing {filteredResults.length} matching titles
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredResults.map((item) => (
              item.media_type === "tv" || item.first_air_date ? (
                <SeriesCard key={item.id} series={item} />
              ) : (
                <MovieCard key={item.id} movie={item} />
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
