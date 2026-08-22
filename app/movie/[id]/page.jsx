import { fetchTMDB } from "@/lib/tmdb";
import MovieDetails from "@/components/MovieDetails";
import NotifyButton from "@/components/NotifyButton";
import TraktRow from "@/components/TraktRow";
import SimilarMovies from "@/components/SimilarMovies";
import { fetchOMDB } from "@/lib/omdb";
import { getTraktIdFromTMDB, getTraktRatings, getTraktStats, getTraktRelated } from "@/lib/trakt";

/* =======================
   METADATA
======================= */
export async function generateMetadata({ params }) {
  try {
    const movie = await fetchTMDB(`/movie/${params.id}`);
    const title = `${movie.title} — Cinephiles Watch`;
    const description = movie.overview?.slice(0, 155);

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: movie.backdrop_path ? [`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`] : [],
      }
    };
  } catch {
    // Fallback metadata if TMDB is unreachable
    return {
      title: "Movie Details — Cinephiles Watch",
      description: "Discover movies on Cinephiles Watch.",
    };
  }
}

import { notFound } from "next/navigation";

export default async function MoviePage({ params }) {
  const { id } = params;

  if (!id || isNaN(Number(id))) notFound();

  let movie = null;
  let similar = [];

  try {
    movie = await fetchTMDB(`/movie/${id}`, { append_to_response: "videos,images,credits" });
    console.log(`[MoviePage] TMDB fetch success for ${id}`);
  } catch (err) {
    console.error("[MoviePage] Fetch threw:", err.message);
    if (err.message.includes("404")) notFound();
    throw err; // Let error.jsx catch this
  }

  // Fetch similar movies (non-fatal if fails)
  try {
    const simData = await fetchTMDB(`/movie/${id}/similar`);
    similar = simData.results || [];
  } catch (e) {
    console.warn("[MoviePage] Similar fetch failed:", e.message);
  }

  // Trakt Enrichment (non-fatal)
  let traktIds = null;
  try {
    traktIds = await getTraktIdFromTMDB(id);
  } catch (e) {
    console.warn("[MoviePage] Trakt lookup failed:", e.message);
  }
  
  const traktSlug = traktIds?.slug ?? null;

  const [omdbData, traktRes] = await Promise.all([
    movie.imdb_id ? fetchOMDB(movie.imdb_id).catch(() => null) : Promise.resolve(null),
    traktSlug ? Promise.allSettled([
      getTraktRatings(traktSlug),
      getTraktStats(traktSlug),
      getTraktRelated(traktSlug),
    ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : null)) : Promise.resolve([null, null, null])
  ]);

  const [traktRatings, traktStats, traktRelated] = traktRes;

  return (
    <div className="animate-in">
      <MovieDetails
        movie={movie}
        similar={similar}
        omdb={omdbData}
        traktRatings={traktRatings}
        traktStats={traktStats}
        traktRelated={traktRelated}
      />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem 60px" }}>
        {traktRelated && traktRelated.length > 0 && (
          <TraktRow 
            title="Related by Trakt" 
            subtitle="Community-linked recommendations"
            items={traktRelated} 
            showWatchers={false} 
          />
        )}
        {similar.length > 0 && <SimilarMovies movies={similar} />}
      </div>
    </div>
  );
}
