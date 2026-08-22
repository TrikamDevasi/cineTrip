/**
 * Centralized fetcher for OMDB API calls.
 * Used to get extra ratings (Rotten Tomatoes, Metascore).
 */
export async function fetchOMDB(imdbId) {
  const API_KEY = process.env.OMDB_API_KEY;
  
  if (!API_KEY || !imdbId) return null;

  try {
    const res = await fetch(`http://www.omdbapi.com/?i=${imdbId}&apikey=${API_KEY}`, {
      next: { revalidate: 86400 }, // Cache for 24 hours as ratings don't change often
    });

    if (!res.ok) return null;
    const data = await res.json();
    
    if (data.Response === "False") return null;

    return {
      imdbRating: data.imdbRating,
      metascore: data.Metascore,
      rottenTomatoes: data.Ratings?.find(r => r.Source === "Rotten Tomatoes")?.Value,
      awards: data.Awards,
      rated: data.Rated,
    };
  } catch (err) {
    console.error("OMDB Fetch Error:", err);
    return null;
  }
}
