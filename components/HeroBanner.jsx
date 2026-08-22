"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ChevronRight, Play, BookmarkPlus, Check } from "lucide-react";
import TrailerModal from "./TrailerModal";
import dynamic from "next/dynamic";
import useWatchlistStore from "@/store/useWatchlistStore";



const GENRE_MAP = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

export default function HeroBanner({ movie, trailerKey, contentType = "movie" }) {
  const [showTrailer, setShowTrailer] = useState(false);

  const [scrollProgress, setScrollProgress] = useState(0);

  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlistStore();
  const isInWatchlist = movie ? watchlist.some((m) => m.id === movie.id) : false;

  const handleWatchlist = () => {
    if (isInWatchlist) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      setScrollProgress((currentScroll / totalScroll) * 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!movie) {
    return <div className="hero skeleton" />;
  }

  const rating = movie.vote_average?.toFixed(1);
  const genres = movie.genre_ids?.slice(0, 1).map(id => GENRE_MAP[id]).join(", ");
  const year = movie.release_date?.slice(0, 4);

  const releaseDate = movie.release_date ? new Date(movie.release_date) : null;
  const isComingSoon = releaseDate ? releaseDate > new Date() : false;

  return (
    <>
      <section className="hero">
        <Image
          src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`}
          alt={movie.title}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />

        <div className="hero-overlay" />

        <div className="hero-content">
          <div className="hero-meta">
            {rating && (
              <div className="meta-pill rating">
                <Star size={14} fill="var(--color-gold)" />
                <span>{rating}</span>
              </div>
            )}
            {year && (
              <div className="meta-pill">
                <span>{year}</span>
              </div>
            )}
            {genres && (
              <div className="meta-pill">
                <span>{genres}</span>
              </div>
            )}
            <div className="meta-pill">
              <span>HD</span>
            </div>
          </div>

          <h1 className="hero-title">{movie.title}</h1>

          <p className="hero-overview">
            {movie.overview}
          </p>

          <div className="hero-btns">


            <Link href={`/${contentType}/${movie.id}`} className="btn-primary cta">
              <span>View Details</span>
              <ChevronRight size={18} />
            </Link>

            <button 
              className={`btn-secondary cta ${isInWatchlist ? 'active' : ''}`}
              onClick={handleWatchlist}
            >
              {isInWatchlist ? <Check size={18} /> : <BookmarkPlus size={18} />}
              <span>{isInWatchlist ? "In Watchlist" : "Add to Watchlist"}</span>
            </button>
            
            {trailerKey && (
              <button onClick={() => setShowTrailer(true)} className="btn-secondary">
                <Play size={18} fill="currentColor" />
                <span>Trailer</span>
              </button>
            )}
          </div>
        </div>

        <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />
      </section>

      {showTrailer && <TrailerModal videoKey={trailerKey} onClose={() => setShowTrailer(false)} />}




    </>
  );
}
