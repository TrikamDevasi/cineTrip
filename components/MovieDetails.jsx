"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, Bookmark, BookmarkPlus, ExternalLink, Clock, Calendar, Sparkles, Scale, DollarSign, MessageSquare } from "lucide-react";
import CastGrid from "./CastGrid";
import SimilarMovies from "./SimilarMovies";
import Screenshots from "./Screenshots";
import TrailerModal from "./TrailerModal";
import useWatchlistStore from "@/store/useWatchlistStore";
import dynamic from "next/dynamic";
import FinancialChart from "./FinancialChart";
import ReviewsSection from "./ReviewsSection";

const MovieComparisonModal = dynamic(() => import("./MovieComparisonModal"), { ssr: false });

export default function MovieDetails({ 
  movie, 
  similar, 
  omdb,
  traktRatings,
  traktStats,
  traktRelated
}) {
  const [trailer, setTrailer] = useState(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [activeAiTab, setActiveAiTab] = useState("overview"); // overview, ending, character
  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState(null);

  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlistStore();

  const isSaved = watchlist.some((m) => m.id === movie?.id);

  const toggleWatchlist = () => {
    if (!movie) return;
    if (isSaved) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
    }
  };

  const video =
    movie?.videos?.results?.find(
      (v) => v.type === "Trailer" && v.site === "YouTube"
    ) || null;

  const backdrop = movie?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : "/default-1778606634.jpg";

  const poster = movie?.poster_path
    ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
    : "/default-1778606634.jpg";

  async function fetchAiInsight(type) {
    setActiveAiTab(type);
    if (!movie?.title) return;
    setAiLoading(true);
    try {
      const endpoint =
        type === "ending"
          ? "/api/ai/explain"
          : type === "character"
          ? "/api/ai/character"
          : "/api/ai/analyze";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movie: movie.title }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAiData(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="movie-details-page animate-in">
      {/* HERO SECTION */}
      <div className="movie-hero">
        <div className="movie-hero-backdrop">
          <Image
            src={backdrop}
            alt={movie?.title || "Backdrop"}
            fill
            priority
            style={{ objectFit: "cover" }}
          />
          <div className="movie-hero-overlay" />
        </div>

        <div className="movie-hero-content container">
          <div className="movie-hero-meta">
            <div className="meta-pill rating">
              <Star size={16} fill="var(--color-gold)" stroke="none" />
              <span>{movie?.vote_average?.toFixed(1) || "N/A"}</span>
            </div>
            <div className="meta-pill">
              <Clock size={16} />
              <span>{movie?.runtime || "??"} min</span>
            </div>
            <div className="meta-pill">
              <Calendar size={16} />
              <span>{movie?.release_date?.slice(0, 4) || "????"}</span>
            </div>
            {omdb?.rottenTomatoes && (
              <div className="meta-pill rt">
                <span>Rotten Tomatoes: {omdb.rottenTomatoes}</span>
              </div>
            )}
          </div>

          <h1 className="movie-hero-title">{movie?.title}</h1>
          <p className="movie-hero-overview">{movie?.overview}</p>

          <div className="movie-hero-actions">

            {video && (
              <button onClick={() => setTrailer(video.key)} className="btn-primary">
                <span>Trailer</span>
              </button>
            )}

            <button onClick={toggleWatchlist} className={isSaved ? "btn-secondary saved" : "btn-secondary"}>
              {isSaved ? <Bookmark size={20} fill="white" /> : <BookmarkPlus size={20} />}
              <span>{isSaved ? "Saved" : "Watchlist"}</span>
            </button>

            <button onClick={() => setCompareOpen(true)} className="btn-secondary">
              <Scale size={18} />
              <span>Compare</span>
            </button>

            {movie?.imdb_id && (
              <a 
                href={`https://www.imdb.com/title/${movie?.imdb_id}`} 
                target="_blank" 
                rel="noreferrer"
                className="imdb-link"
              >
                <span>IMDb</span>
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="container movie-main-grid">
        {/* POSTER & WATCH PROVIDERS SIDEBAR */}
        <div className="movie-sidebar space-y-6">
          <div className="movie-poster-card shadow-2xl rounded-2xl overflow-hidden border border-[var(--color-border)]">
            <Image
              src={poster}
              alt={movie?.title || "Poster"}
              width={320}
              height={480}
              priority
              className="w-full h-auto object-cover"
            />
          </div>

        </div>

        {/* DETAILS CONTENT */}
        <div className="movie-content space-y-8">
          <div className="genre-list">
            {movie?.genres?.map((g) => (
              <span key={g.id} className="genre-pill">{g.name}</span>
            ))}
          </div>

          {/* AI ASSISTANT TABS */}
          <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>AI Film Analyst</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchAiInsight("overview")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeAiTab === "overview"
                      ? "bg-indigo-600 text-white"
                      : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-white"
                  }`}
                >
                  Overview Analysis
                </button>
                <button
                  onClick={() => fetchAiInsight("ending")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeAiTab === "ending"
                      ? "bg-indigo-600 text-white"
                      : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-white"
                  }`}
                >
                  Ending Explained
                </button>
                <button
                  onClick={() => fetchAiInsight("character")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeAiTab === "character"
                      ? "bg-indigo-600 text-white"
                      : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-white"
                  }`}
                >
                  Character Study
                </button>
              </div>
            </div>

            {aiLoading ? (
              <div className="py-8 text-center text-xs text-[var(--color-text-muted)] animate-pulse">
                Consulting AI Provider for deep film analysis...
              </div>
            ) : aiData ? (
              <div className="space-y-3 text-xs text-[var(--color-text-secondary)] leading-relaxed">
                {aiData.ending && (
                  <div>
                    <h4 className="font-bold text-[var(--color-text-primary)] mb-1">Ending Explanation</h4>
                    <p>{aiData.ending}</p>
                  </div>
                )}
                {aiData.deeperMeaning && (
                  <div>
                    <h4 className="font-bold text-[var(--color-text-primary)] mb-1">Deeper Meaning & Themes</h4>
                    <p>{aiData.deeperMeaning}</p>
                  </div>
                )}
                {aiData.summary && (
                  <div>
                    <h4 className="font-bold text-[var(--color-text-primary)] mb-1">Character Archetype Summary</h4>
                    <p>{aiData.summary}</p>
                  </div>
                )}
                {aiData.themes && Array.isArray(aiData.themes) && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {aiData.themes.map((t, idx) => (
                      <span key={idx} className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-300 font-medium">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-[var(--color-text-muted)]">
                Click any AI tab above to generate real-time AI movie breakdowns, ending analysis, or character studies.
              </p>
            )}
          </div>

          <FinancialChart budget={movie?.budget} revenue={movie?.revenue} />

          <div className="cast-section">
            <CastGrid cast={movie?.credits?.cast || []} />
          </div>

          <Screenshots images={movie?.images?.backdrops || []} />

          <ReviewsSection mediaId={movie?.id} mediaType="movie" />
        </div>
      </div>

      <div className="container" style={{ marginTop: "60px" }}>
        <SimilarMovies movies={similar} />
      </div>

      {trailer && (
        <TrailerModal
          videoKey={trailer}
          onClose={() => setTrailer(null)}
        />
      )}


      {compareOpen && (
        <MovieComparisonModal
          isOpen={compareOpen}
          onClose={() => setCompareOpen(false)}
          currentMovie={movie}
        />
      )}

      <style jsx>{`
        .movie-hero {
          position: relative;
          height: 80vh;
          min-height: 600px;
          display: flex;
          align-items: flex-end;
          padding-bottom: 80px;
          overflow: hidden;
        }
        .movie-hero-backdrop {
          position: absolute;
          inset: 0;
          z-index: -1;
        }
        .movie-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, var(--color-bg) 0%, rgba(10,10,15,0.4) 50%, transparent 100%),
                      linear-gradient(to right, var(--color-bg) 20%, transparent 80%);
        }
        .movie-hero-meta {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .movie-hero-title {
          font-size: clamp(2.2rem, 5vw, 4rem);
          font-weight: 800;
          margin-bottom: 16px;
          line-height: 1.1;
        }
        .movie-hero-overview {
          max-width: 700px;
          font-size: 1rem;
          color: var(--color-text-secondary);
          margin-bottom: 32px;
          line-height: 1.6;
        }
        .movie-hero-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .movie-main-grid {
          display: grid;
          grid-template-columns: 320px minmax(0, 1fr);
          gap: 40px;
          margin-top: -60px;
          position: relative;
          z-index: 20;
        }
        .genre-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .genre-pill {
          background: var(--color-surface-2);
          border: 1px solid var(--color-border);
          padding: 4px 14px;
          border-radius: var(--radius-pill);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-text-secondary);
        }
        @media (max-width: 1024px) {
          .movie-main-grid {
            grid-template-columns: 1fr;
            margin-top: 20px;
          }
        }
      `}</style>
    </div>
  );
}

