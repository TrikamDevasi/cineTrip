import { getPopularSeries, getTrendingSeries } from "@/lib/tmdb/series";
import SeriesRow from "@/components/SeriesRow";
import HeroBanner from "@/components/HeroBanner";
import SeriesSearch from "@/components/SeriesSearch";

export default async function SeriesPage({ searchParams }) {
  const query = searchParams?.q;

  let popular = [];
  let trending = [];
  let featured = null;

  try {
    const [popularRes, trendingRes] = await Promise.all([
      getPopularSeries(),
      getTrendingSeries(),
    ]);

    popular = popularRes.results || [];
    trending = trendingRes.results || [];
    featured = trending[0] || popular[0];
  } catch (err) {
    console.error("Failed to fetch series:", err);
  }

  return (
    <div className="animate-in">
      {!query && featured && (
        <HeroBanner
          movie={{ ...featured, title: featured.name }}
          trailerKey={null}
          contentType="series"
        />
      )}

      <div
        className="container"
        style={{
          paddingBottom: "100px",
          marginTop: featured ? "-40px" : "40px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <SeriesRow title="Trending Series" series={trending} />
        <SeriesRow title="Popular Series" series={popular} />
      </div>
    </div>
  );
}
