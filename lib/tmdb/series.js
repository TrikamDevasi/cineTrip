import { fetchTMDB } from "../tmdb";

export const searchSeries = (query) => fetchTMDB("/search/tv", { query });

export const getSeriesDetails = (tvId) =>
  fetchTMDB(`/tv/${tvId}`, {
    append_to_response: "videos,images,credits,external_ids,aggregate_credits,similar,recommendations,watch/providers",
  });

export const getSeriesSeasons = (tvId, seasonNumber) =>
  fetchTMDB(`/tv/${tvId}/season/${seasonNumber}`);

export const getSeriesEpisodes = (tvId, seasonNumber, episodeNumber) =>
  fetchTMDB(`/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`);

export const getPopularSeries = () => fetchTMDB("/tv/popular");

export const getTrendingSeries = () => fetchTMDB("/trending/tv/week");

export const getTopRatedSeries = () => fetchTMDB("/tv/top_rated");

