"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, BookmarkPlus, Check, Trash, Clock, Calendar, ExternalLink } from "lucide-react";
import CastGrid from "./CastGrid";
import Screenshots from "./Screenshots";
import useSeriesStore from "@/store/seriesStore";
import { useRegion } from "@/context/RegionContext";
import dynamic from "next/dynamic";



export default function SeriesDetails({ series }) {
  const { seriesList, addSeries, removeSeries, updateSeriesProgress } = useSeriesStore();
  const { region } = useRegion();

  const savedSeries = seriesList.find((s) => s.tmdbId === series.id);
  const isInList = !!savedSeries;

  const [expandedSeason, setExpandedSeason] = useState(null);
  const [episodes, setEpisodes] = useState({}); // { seasonNumber: [episodes] }
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);


  const fetchEpisodes = async (seasonNumber) => {
    if (episodes[seasonNumber]) return;

    setLoadingEpisodes(true);
    try {
      const res = await fetch(
        `/api/series/${series.id}/season/${seasonNumber}`
      );
      const data = await res.json();
      if (data.success) {
        setEpisodes((prev) => ({
          ...prev,
          [seasonNumber]: data.data.episodes,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch episodes:", err);
    } finally {
      setLoadingEpisodes(false);
    }
  };

  const toggleSeason = (seasonNumber) => {
    if (expandedSeason === seasonNumber) {
      setExpandedSeason(null);
    } else {
      setExpandedSeason(seasonNumber);
      fetchEpisodes(seasonNumber);
    }
  };

  const handleAddToList = () => {
    addSeries({
      tmdbId: series.id,
      title: series.name,
      posterPath: series.poster_path,
      backdropPath: series.backdrop_path,
      overview: series.overview,
      firstAirDate: series.first_air_date,
      status: series.status,
      totalSeasons: series.number_of_seasons,
      totalEpisodes: series.number_of_episodes,
      genres: series.genres?.map((g) => g.name),
    });
  };

  const handleStatusChange = (status) => {
    if (isInList) {
      updateSeriesProgress(series.id, { watchStatus: status });
    }
  };

  const handleEpisodeCheck = (seasonNumber, episodeNumber) => {
    if (isInList) {
      updateSeriesProgress(series.id, {
        currentSeason: seasonNumber,
        currentEpisode: episodeNumber,
      });
    }
  };

  const isEpisodeWatched = (seasonNum, epNum) => {
    if (!savedSeries) return false;
    const curSeason = savedSeries.currentSeason || 1;
    const curEp = savedSeries.currentEpisode || 0;

    if (seasonNum < curSeason) return true;
    if (seasonNum === curSeason && epNum <= curEp) return true;
    return false;
  };

  const backdrop = `https://image.tmdb.org/t/p/original${series.backdrop_path}`;
  const poster = `https://image.tmdb.org/t/p/w780${series.poster_path}`;

  const video =
    series?.videos?.results?.find(
      (v) => v.type === "Trailer" && v.site === "YouTube"
    ) || null;

  const isReleased = series?.first_air_date && new Date(series.first_air_date) <= new Date();



  return (
    <div className="movie-details-page animate-in">
      {/* HERO SECTION */}
      <div className="movie-hero">
        <div className="movie-hero-backdrop">
          <Image
            src={backdrop}
            alt={series.name}
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
              <span>{series?.vote_average?.toFixed(1) || "N/A"}</span>
            </div>
            <div className="meta-pill">
              <Calendar size={16} />
              <span>{series?.first_air_date?.slice(0, 4) || "????"}</span>
            </div>
            <div className="meta-pill">
              <span>{series?.number_of_seasons} Seasons</span>
            </div>
            <div className="meta-pill">
              <span>{series?.status}</span>
            </div>
          </div>

          <h1 className="movie-hero-title">{series?.name}</h1>
          <p className="movie-hero-overview">{series?.overview}</p>

          <div className="movie-hero-actions">

            {!isInList ? (
              <button onClick={handleAddToList} className="btn-primary">
                <BookmarkPlus size={20} />
                <span>Add to Watchlist</span>
              </button>
            ) : (
              <>
                <button onClick={() => removeSeries(series.id)} className="btn-secondary text-red-500">
                  <Trash size={20} />
                  <span>Remove</span>
                </button>
                <select
                  value={savedSeries.watchStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="bg-[#18181f] border border-white/10 rounded-md px-4 py-2 text-white"
                  style={{ minHeight: "44px" }}
                >
                  <option value="to_watch">Plan to Watch</option>
                  <option value="watching">Watching</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="dropped">Dropped</option>
                </select>
              </>
            )}

            {series?.external_ids?.imdb_id && (
              <a 
                href={`https://www.imdb.com/title/${series.external_ids.imdb_id}`} 
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

      {/* MAIN CONTENT */}
      <div className="container movie-main-grid">
        {/* POSTER SIDEBAR */}
        <div className="movie-sidebar">
          <div className="movie-poster-card">
            <Image
              src={poster}
              alt={series?.name || "Series Poster"}
              width={300}
              height={450}
              priority
              className="movie-poster-img"
            />
          </div>


        </div>

        {/* DETAILS CONTENT */}
        <div className="movie-content">
          <div className="genre-list">
            {series?.genres?.map((g) => (
              <span key={g.id} className="genre-pill">{g.name}</span>
            ))}
          </div>

          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Status</span>
              <span className="info-value">{series?.status}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Seasons</span>
              <span className="info-value">{series?.number_of_seasons}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Episodes</span>
              <span className="info-value">{series?.number_of_episodes}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Language</span>
              <span className="info-value uppercase">{series?.original_language}</span>
            </div>
          </div>

          {/* SEASONS ACCORDION */}
          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-bold mb-4">Seasons</h2>
            {series.seasons?.map((season) => (
              <div
                key={season.id}
                className="bg-[#111118] border border-white/5 rounded-lg overflow-hidden"
                style={{ marginBottom: "10px" }}
              >
                <button
                  onClick={() => toggleSeason(season.season_number)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#18181f] transition-colors"
                  style={{ minHeight: "44px", background: "none", border: "none", color: "inherit", textAlign: "left", cursor: "pointer" }}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">{season.name}</span>
                    <span className="text-sm text-gray-500">
                      {season.episode_count} Episodes
                    </span>
                  </div>
                  <span>
                    {expandedSeason === season.season_number ? "−" : "+"}
                  </span>
                </button>

                {expandedSeason === season.season_number && (
                  <div className="px-6 py-4 border-t border-white/5 space-y-3">
                    {loadingEpisodes ? (
                      <p className="text-gray-500 text-sm">
                        Loading episodes...
                      </p>
                    ) : (
                      episodes[season.season_number]?.map((ep) => (
                        <div
                          key={ep.id}
                          className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isEpisodeWatched(
                                season.season_number,
                                ep.episode_number
                              )}
                              onChange={() =>
                                handleEpisodeCheck(
                                  season.season_number,
                                  ep.episode_number
                                )
                              }
                              disabled={!isInList}
                              className="w-4 h-4 rounded border-gray-600 text-[#e50914] focus:ring-[#e50914] bg-transparent"
                            />
                            <span className="text-sm font-medium">
                              Ep {ep.episode_number}: {ep.name}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {ep.air_date}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="cast-section" style={{ marginTop: "40px" }}>
            <CastGrid cast={series?.credits?.cast || []} />
          </div>
          
          <div style={{ marginTop: "40px" }}>
            <Screenshots images={series?.images?.backdrops || []} />
          </div>
        </div>
      </div>



      <style jsx>{`
        .movie-hero {
          position: relative;
          height: 80vh;
          min-height: 700px;
          display: flex;
          align-items: flex-end;
          padding-bottom: 100px;
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
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 800;
          margin-bottom: 20px;
          line-height: 1.1;
        }
        .movie-hero-overview {
          max-width: 700px;
          font-size: 1.1rem;
          color: var(--color-text-secondary);
          margin-bottom: 40px;
          line-height: 1.6;
        }
        .movie-hero-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .imdb-link {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
          color: var(--color-gold);
          font-size: 0.9rem;
          padding: 10px 16px;
        }
        .movie-main-grid {
          display: grid;
          grid-template-columns: 300px minmax(0, 1fr);
          gap: 60px;
          margin-top: -100px;
          position: relative;
          z-index: 20;
        }
        .movie-content {
          min-width: 0;
        }
        .movie-poster-card {
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(0,0,0,0.8);
          margin-bottom: 32px;
        }
        .movie-poster-img {
          width: 100%;
          height: auto;
          display: block;
        }
        .movie-info-block {
          background: var(--color-surface);
          padding: 24px;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          margin-bottom: 20px;
        }
        .block-title {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-text-muted);
          margin-bottom: 16px;
        }
        .provider-logo {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          margin-right: 8px;
        }
        .no-data {
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }
        .genre-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 32px;
        }
        .genre-pill {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--color-border);
          padding: 6px 16px;
          border-radius: var(--radius-pill);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-text-secondary);
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
          background: var(--color-surface);
          padding: 24px;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
        }
        .info-item { display: flex; flex-direction: column; gap: 4px; }
        .info-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted); }
        .info-value { font-size: 1.1rem; font-weight: 600; color: var(--color-text-primary); }

        @media (max-width: 1024px) {
          .movie-main-grid {
            grid-template-columns: 1fr;
            margin-top: 40px;
          }
          .movie-poster-card {
            max-width: 300px;
            margin: 0 auto 32px;
          }
        }

        @media (max-width: 640px) {
          .movie-hero {
            height: auto;
            min-height: 80vh;
            padding-bottom: 60px;
            padding-top: 100px;
          }
          .movie-hero-actions {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          .movie-hero-actions button, .movie-hero-actions a {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
