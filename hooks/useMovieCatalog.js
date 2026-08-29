import { useCallback, useEffect, useState } from 'react';
import {
  ensureNowPlayingLoaded,
  getNowPlayingSnapshot,
  getMovieAvailability,
  isMovieNowPlaying,
} from '../services/movieCatalog';

/**
 * React binding for the verifiable "currently in theatres" movie catalog.
 * Exposes the snapshot (movies, LIVE/CACHED source, freshness, error) plus
 * helpers that decide whether a movie is bookable.
 */
export const useMovieCatalog = () => {
  const [snapshot, setSnapshot] = useState(() => getNowPlayingSnapshot());

  useEffect(() => {
    let mounted = true;
    ensureNowPlayingLoaded()
      .then((next) => {
        if (mounted) setSnapshot(next);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    const next = await ensureNowPlayingLoaded({ forceRefresh: true });
    setSnapshot(next);
  }, []);

  const canBook = useCallback((movie) => isMovieNowPlaying(movie), []);
  const getAvailability = useCallback((movie) => getMovieAvailability(movie), []);

  return { snapshot, canBook, getAvailability, refresh };
};