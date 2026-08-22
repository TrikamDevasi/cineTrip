import { getSeriesDetails } from "@/lib/tmdb/series";
import SeriesDetails from "@/components/SeriesDetails";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  try {
    const series = await getSeriesDetails(params.id);
    const title = `${series.name} — Cinephiles Watch`;
    const description = series.overview?.slice(0, 155);

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: series.backdrop_path
          ? [`https://image.tmdb.org/t/p/w1280${series.backdrop_path}`]
          : [],
      },
    };
  } catch {
    return {
      title: "Series Details — Cinephiles Watch",
      description: "Discover series on Cinephiles Watch.",
    };
  }
}

export default async function SeriesDetailPage({ params }) {
  const { id } = params;

  if (!id || isNaN(Number(id))) notFound();

  let series = null;

  try {
    series = await getSeriesDetails(id);
  } catch (err) {
    console.error("[SeriesPage] Fetch threw:", err.message);
    if (err.message.includes("404")) notFound();
    throw err;
  }

  return (
    <div className="animate-in">
      <SeriesDetails series={series} />
    </div>
  );
}
