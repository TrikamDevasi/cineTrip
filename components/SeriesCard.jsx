"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, BookmarkPlus, Check } from "lucide-react";
import useSeriesStore from "@/store/seriesStore";


export default function SeriesCard({ series }) {
  const { seriesList, addSeries, removeSeries } = useSeriesStore();



  const tmdbId = series.id || series.tmdbId;
  const isInList = seriesList.some((s) => s.tmdbId === tmdbId);
  const savedSeries = seriesList.find((s) => s.tmdbId === tmdbId);

  const img =
    series.poster_path || series.posterPath
      ? `https://image.tmdb.org/t/p/w342${series.poster_path || series.posterPath}`
      : "/placeholder.png";

  const rating = series.vote_average?.toFixed(1) || series.userRating;
  const year = (series.first_air_date || series.firstAirDate)?.slice(0, 4);

  const handleWatchlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInList) {
      removeSeries(tmdbId);
    } else {
      addSeries({
        tmdbId: series.id,
        title: series.name || series.title,
        posterPath: series.poster_path,
        backdropPath: series.backdrop_path,
        overview: series.overview,
        firstAirDate: series.first_air_date,
        genres: series.genre_ids?.map((id) => id.toString()), // Fallback if genres not full
      });
    }
  };





  const statusColors = {
    to_watch: "bg-gray-600",
    watching: "bg-blue-600",
    completed: "bg-green-600",
    on_hold: "bg-yellow-600",
    dropped: "bg-red-600",
  };

  const currentSeason = savedSeries?.currentSeason || 1;
  const currentEpisode = savedSeries?.currentEpisode || 0;
  const totalEpisodes =
    series.number_of_episodes || savedSeries?.totalEpisodes || 0;

  return (
    <Link href={`/series/${tmdbId}`} className="movie-card-container">
      <div className="movie-card">
        {/* RATING BADGE */}
        {rating && rating > 0 && (
          <div className="rating-badge">
            <Star size={10} fill="currentColor" stroke="none" />
            <span>{rating}</span>
          </div>
        )}

        {/* PROGRESS BADGE */}
        {savedSeries && (
          <div
            className="absolute top-2 left-2 bg-black/75 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded-md text-white z-10"
            style={{ minHeight: "auto", minWidth: "auto" }}
          >
            S{currentSeason}E{currentEpisode}
          </div>
        )}

        {/* WATCH STATUS CHIP */}
        {savedSeries && (
          <div
            className={`absolute bottom-2 left-2 ${statusColors[savedSeries.watchStatus]} text-xs font-bold px-2 py-1 rounded-md text-white z-10`}
            style={{ minHeight: "auto", minWidth: "auto" }}
          >
            {savedSeries.watchStatus.replace("_", " ")}
          </div>
        )}

        {/* POSTER */}
        <div className="poster-wrapper">
          <Image
            src={img}
            alt={series.name || series.title}
            fill
            sizes="(max-width: 480px) 120px, (max-width: 768px) 160px, 200px"
            style={{ objectFit: "cover" }}
            loading="lazy"
          />
        </div>

        <div className="card-hover-overlay" style={{ display: "flex", gap: "8px" }}>
          <button
            className={`card-add-btn ${isInList ? "active" : ""}`}
            onClick={handleWatchlist}
            title={isInList ? "Remove from List" : "Add to List"}
            style={{ minHeight: "44px", minWidth: "44px" }}
          >
            {isInList ? <Check size={18} /> : <BookmarkPlus size={18} />}
          </button>
        </div>
      </div>





      <div className="movie-card-info">
        <h3 className="movie-card-title">{series.name || series.title}</h3>
        <div className="flex items-center justify-between mt-1">
          {year && <span className="movie-card-year">{year}</span>}
          {savedSeries && totalEpisodes > 0 && (
            <span className="text-xs text-gray-400">
              {currentEpisode}/{totalEpisodes} Ep
            </span>
          )}
        </div>

        {/* EPISODE PROGRESS BAR */}
        {savedSeries && totalEpisodes > 0 && (
          <div className="w-full bg-gray-700 h-1 rounded-full mt-1 overflow-hidden">
            <div
              className="bg-blue-600 h-full"
              style={{ width: `${(currentEpisode / totalEpisodes) * 100}%` }}
            />
          </div>
        )}
      </div>
    </Link>
  );
}
