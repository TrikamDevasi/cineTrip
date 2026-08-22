"use client";

import { useEffect, useState, useRef } from "react";
import MovieCard from "./MovieCard";
import { Loader2, Flame } from "lucide-react";

export default function InfiniteTrending() {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);

  async function loadMoreMovies(pageNum) {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tmdb/trending?page=${pageNum}`);
      const data = await res.json();
      const newMovies = data?.data?.results || [];
      if (newMovies.length === 0) {
        setHasMore(false);
      } else {
        setMovies((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const filtered = newMovies.filter((m) => !existingIds.has(m.id));
          return [...prev, ...filtered];
        });
      }
    } catch (error) {
      console.error("Error fetching infinite trending movies:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMoreMovies(1);
  }, []);

  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            loadMoreMovies(nextPage);
            return nextPage;
          });
        }
      },
      { threshold: 0.5 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading]);

  return (
    <div className="space-y-6 pt-8">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-orange-600 to-red-600 text-white shadow-lg">
          <Flame className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
            Infinite Trending Discovery Feed
          </h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            Explore continuous real-time movie trends worldwide
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      <div ref={observerRef} className="py-8 text-center">
        {loading && (
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[var(--color-accent)] animate-pulse">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading more cinematic titles...</span>
          </div>
        )}
        {!hasMore && (
          <p className="text-xs text-[var(--color-text-muted)]">You've reached the end of trending movies.</p>
        )}
      </div>
    </div>
  );
}
