"use client";


import Link from "next/link";
import Image from "next/image";
import { Star, BookmarkPlus, Check } from "lucide-react";
import useWatchlistStore from "@/store/useWatchlistStore";


export default function MovieCard({ movie }) {
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlistStore();
  

  
  const isInWatchlist = watchlist.some((m) => m.id === movie.id);
  
  const img = movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : "/placeholder.png";

  const rating = movie.vote_average?.toFixed(1);
  const year = movie.release_date?.slice(0, 4);

  const handleWatchlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWatchlist) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
    }
  };



  return (
    <Link href={`/movie/${movie.id}`} className="movie-card-container">
      <div className="movie-card">
        {/* RATING BADGE (Visible always on small mobile if needed, but here as standard) */}
        {rating && rating > 0 && (
          <div className="rating-badge">
            <Star size={10} fill="currentColor" stroke="none" />
            <span>{rating}</span>
          </div>
        )}

        {/* POSTER */}
        <div className="poster-wrapper">
          <Image
            src={img}
            alt={movie.title}
            fill
            sizes="(max-width: 480px) 120px, (max-width: 768px) 160px, 200px"
            style={{ objectFit: "cover" }}
            loading="lazy"
          />
        </div>

        <div className="card-hover-overlay" style={{ display: "flex", gap: "8px" }}>
          <button 
            className={`card-add-btn ${isInWatchlist ? 'active' : ''}`}
            onClick={handleWatchlist}
            title={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
          >
            {isInWatchlist ? <Check size={18} /> : <BookmarkPlus size={18} />}
          </button>
        </div>
      </div>

      
      <div className="movie-card-info">
        <h3 className="movie-card-title">{movie.title}</h3>
        {year && <span className="movie-card-year">{year}</span>}
      </div>
    </Link>
  );
}
