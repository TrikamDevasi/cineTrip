"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Users, TrendingUp } from "lucide-react";

// Trakt gives us TMDB IDs — we use those to get TMDB poster images
const TMDB_IMG = "https://image.tmdb.org/t/p/w300";
const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY; // read-only poster use is acceptable

export default function TraktRow({ title, subtitle, items = [], showWatchers }) {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    async function enrichWithPosters() {
      const enriched = await Promise.all(
        items.slice(0, 20).map(async (item) => {
          const movie = item.movie ?? item; // box office shape differs slightly
          const tmdbId = movie.ids?.tmdb;
          if (!tmdbId) return null;

          try {
            const res = await fetch(
              `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_KEY}`
            );
            const tmdbData = await res.json();
            return {
              id: tmdbId,
              title: movie.title,
              year: movie.year,
              poster_path: tmdbData.poster_path,
              vote_average: tmdbData.vote_average,
              watchers: item.watchers ?? null,
            };
          } catch {
            return null;
          }
        })
      );
      setMovies(enriched.filter(Boolean));
    }

    if (items.length > 0) enrichWithPosters();
  }, [items]);

  if (movies.length === 0) return null;

  return (
    <section className="trakt-row">
      <div className="row-header">
        <div className="row-title-group">
          <TrendingUp size={16} className="row-icon" />
          <div>
            <h2 className="row-title">{title}</h2>
            {subtitle && <p className="row-subtitle">{subtitle}</p>}
          </div>
        </div>
        <span className="row-count">{movies.length}</span>
      </div>

      <div className="trakt-scroll-row">
        {movies.map((movie, index) => (
          <Link key={movie.id} href={`/movie/${movie.id}`} className="trakt-card">
            <div className="trakt-card-inner">
              {/* Rank number */}
              <span className="rank-badge">#{index + 1}</span>

              {/* Poster */}
              {movie.poster_path ? (
                <Image
                  src={`${TMDB_IMG}${movie.poster_path}`}
                  alt={movie.title}
                  width={150}
                  height={225}
                  className="trakt-poster"
                />
              ) : (
                <div className="trakt-poster-placeholder">
                  <span>{movie.title[0]}</span>
                </div>
              )}

              {/* Overlay */}
              <div className="trakt-overlay">
                <p className="trakt-movie-title">{movie.title}</p>
                <p className="trakt-movie-year">{movie.year}</p>
                {showWatchers && movie.watchers && (
                  <span className="watchers-badge">
                    <Users size={11} />
                    {movie.watchers.toLocaleString()} watching
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
