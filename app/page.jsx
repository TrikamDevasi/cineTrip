import { fetchTMDB } from "@/lib/tmdb";
import Row from "@/components/Row";
import RegionSwitcher from "@/components/RegionSwitcher";
import TraktRow from "@/components/TraktRow";
import HeroBanner from "@/components/HeroBanner";
import InfiniteTrending from "@/components/InfiniteTrending";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Globe } from "lucide-react";
import { getTraktTrending, getTraktAnticipated, getTraktBoxOffice } from "@/lib/trakt";


// Valid TMDB region codes — must stay in sync with RegionSwitcher.jsx
const VALID_REGIONS = new Set(["IN", "US", "GB", "AU", "CA", "DE", "FR", "JP", "KR", "SG", "AE", "BR", "MX"]);

export default async function HomePage({ searchParams }) {
  // Validate the region param — unknown codes fall back to IN
  const reqRegion = searchParams?.region;
  const region = reqRegion && VALID_REGIONS.has(reqRegion) ? reqRegion : "IN";

  /* =======================
     DATE HELPERS
  ======================= */
  const today = new Date();
  const formatDate = (d) => d.toISOString().split("T")[0];
  const todayStr = formatDate(today);

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  let data = {
    trending: [],
    topRated: [],
    comingThisWeek: [],
    comingThisMonth: [],
    ottThisMonth: [],
  };

  try {
    const [
      trending,
      topRated,
      comingThisWeek,
      comingThisMonth,
      ottThisMonth,
    ] = await Promise.all([
      fetchTMDB("/trending/movie/week").then(d => d.results || []),
      fetchTMDB("/movie/top_rated").then(d => d.results || []),

      // Theatrical – coming this week
      fetchTMDB("/discover/movie", {
        region,
        with_release_type: "2|3",
        "release_date.gte": formatDate(startOfWeek),
        "release_date.lte": formatDate(endOfWeek),
        sort_by: "popularity.desc"
      }).then(d => d.results || []),

      // Theatrical – coming this month
      fetchTMDB("/discover/movie", {
        region,
        with_release_type: "2|3",
        "release_date.gte": formatDate(startOfMonth),
        "release_date.lte": formatDate(endOfMonth),
        sort_by: "popularity.desc"
      }).then(d => d.results || []),

      // OTT releases this month
      fetchTMDB("/discover/movie", {
        region,
        with_release_type: 4,
        "release_date.gte": formatDate(startOfMonth),
        "release_date.lte": formatDate(endOfMonth),
        sort_by: "popularity.desc"
      }).then(d => d.results || []),
    ]);

    data = { trending, topRated, comingThisWeek, comingThisMonth, ottThisMonth };
  } catch (err) {
    console.error("Home page fetch error:", err);
  }

  /* =======================
     TRAKT FETCH
  ======================= */
  const [traktTrendingRes, anticipatedRes, boxOfficeRes] = await Promise.allSettled([
    getTraktTrending(),
    getTraktAnticipated(),
    getTraktBoxOffice(),
  ]);

  const traktTrending = traktTrendingRes.status === "fulfilled" ? traktTrendingRes.value : [];
  const anticipated = anticipatedRes.status === "fulfilled" ? anticipatedRes.value : [];
  const boxOffice = boxOfficeRes.status === "fulfilled" ? boxOfficeRes.value : [];

  const { trending, topRated, comingThisWeek, comingThisMonth, ottThisMonth } = data;


  /* =======================
     RELEASING TODAY
  ======================= */
  const releasingToday = comingThisWeek.filter(
    (m) => m.release_date === todayStr
  );

  const heroMovie =
    trending.length > 0
      ? trending[new Date().getDay() % trending.length]
      : null;

  let heroTrailerKey = null;
  let fullHeroMovie = heroMovie;

  if (heroMovie) {
    try {
      // Fetch full details to get imdb_id and videos
      const fullData = await fetchTMDB(`/movie/${heroMovie.id}`, { append_to_response: "videos" });
      fullHeroMovie = fullData;
      
      const video = fullData.videos?.results?.find(
        (v) => v.type === "Trailer" && v.site === "YouTube"
      );
      heroTrailerKey = video?.key || null;
    } catch (err) {
      console.error("Hero movie detail fetch error:", err);
      heroTrailerKey = null;
    }
  }

  /* =======================
     SEO STRUCTURED DATA
  ======================= */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Cinephiles Watch",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://cinephiles-watch-react-js.onrender.com",
    potentialAction: {
      "@type": "SearchAction",
      target:
        `${process.env.NEXT_PUBLIC_BASE_URL || "https://cinephiles-watch-react-js.onrender.com"}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="animate-in">
      {/* SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ErrorBoundary label="Hero Banner">
        <HeroBanner movie={fullHeroMovie} trailerKey={heroTrailerKey} />
      </ErrorBoundary>

      <div className="container" style={{ paddingBottom: "100px", marginTop: "-40px", position: "relative", zIndex: 10 }}>
        {/* REGION SWITCHER */}
        <div className="region-switcher-container">
          <RegionSwitcher />
        </div>

        {/* RELEASING TODAY */}
        {releasingToday.length > 0 && (
          <ErrorBoundary label="Releasing Today">
            <Row title="Releasing Today" movies={releasingToday} />
          </ErrorBoundary>
        )}

        <ErrorBoundary label="Trending Now">
          <Row title="Trending Now" movies={trending} />
        </ErrorBoundary>

        <ErrorBoundary label="Top Rated">
          <Row title="Top Rated Movies" movies={topRated} />
        </ErrorBoundary>

        {/* COMING THIS WEEK */}
        {comingThisWeek.length > 0 && (
          <ErrorBoundary label="Theatrical Releases: This Week">
            <Row title="Theatrical Releases: This Week" movies={comingThisWeek} />
          </ErrorBoundary>
        )}

        {/* COMING THIS MONTH */}
        {comingThisMonth.length > 0 && (
          <ErrorBoundary label="Theatrical Releases: This Month">
            <Row title="Theatrical Releases: This Month" movies={comingThisMonth} />
          </ErrorBoundary>
        )}

        {/* OTT THIS MONTH */}
        {ottThisMonth.length > 0 && (
          <ErrorBoundary label="OTT Releases">
            <Row title="OTT Releases: This Month" movies={ottThisMonth} />
          </ErrorBoundary>
        )}

        {/* TRAKT SECTION */}
        <div style={{ marginTop: "4rem", paddingTop: "4rem", borderTop: "1px solid var(--color-border)" }}>
          <ErrorBoundary label="Trakt Live Trending">
            <TraktRow
              title="Trakt Live Trending"
              subtitle="Movies being watched right now"
              items={traktTrending}
              showWatchers={true}
            />
          </ErrorBoundary>

          <ErrorBoundary label="Most Anticipated">
            <TraktRow
              title="Most Anticipated"
              subtitle="Community hype leaderboard"
              items={anticipated}
              showWatchers={false}
            />
          </ErrorBoundary>

          <ErrorBoundary label="US Box Office">
            <TraktRow
              title="US Box Office"
              subtitle="Top theatrical performers this weekend"
              items={boxOffice}
              showWatchers={false}
            />
          </ErrorBoundary>
        </div>

        {/* INFINITE TRENDING DISCOVERY FEED */}
        <div style={{ marginTop: "4rem", paddingTop: "4rem", borderTop: "1px solid var(--color-border)" }}>
          <ErrorBoundary label="Discovery Feed">
            <InfiniteTrending />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

