import { NextResponse } from "next/server";
import { fetchTMDB } from "@/lib/tmdb";

const GENRE_MAP = [
  { id: 28, name: "Action", icon: "💥", color: "linear-gradient(135deg, #ef4444, #b91c1c)" },
  { id: 12, name: "Adventure", icon: "🧭", color: "linear-gradient(135deg, #f59e0b, #d97706)" },
  { id: 16, name: "Animation", icon: "🎨", color: "linear-gradient(135deg, #ec4899, #db2777)" },
  { id: 35, name: "Comedy", icon: "😂", color: "linear-gradient(135deg, #eab308, #ca8a04)" },
  { id: 80, name: "Crime", icon: "🕵️", color: "linear-gradient(135deg, #64748b, #475569)" },
  { id: 99, name: "Documentary", icon: "📽️", color: "linear-gradient(135deg, #14b8a6, #0d9488)" },
  { id: 18, name: "Drama", icon: "🎭", color: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
  { id: 10751, name: "Family", icon: "🍿", color: "linear-gradient(135deg, #06b6d4, #0891b2)" },
  { id: 14, name: "Fantasy", icon: "🔮", color: "linear-gradient(135deg, #a855f7, #9333ea)" },
  { id: 36, name: "History", icon: "📜", color: "linear-gradient(135deg, #d97706, #b45309)" },
  { id: 27, name: "Horror", icon: "👻", color: "linear-gradient(135deg, #dc2626, #991b1b)" },
  { id: 10402, name: "Music", icon: "🎵", color: "linear-gradient(135deg, #f43f5e, #e11d48)" },
  { id: 9648, name: "Mystery", icon: "🔍", color: "linear-gradient(135deg, #6366f1, #4f46e5)" },
  { id: 10749, name: "Romance", icon: "💖", color: "linear-gradient(135deg, #f472b6, #e11d48)" },
  { id: 878, name: "Sci-Fi", icon: "🚀", color: "linear-gradient(135deg, #3b82f6, #2563eb)" },
  { id: 53, name: "Thriller", icon: "⚡", color: "linear-gradient(135deg, #f97316, #ea580c)" },
  { id: 10752, name: "War", icon: "🎖️", color: "linear-gradient(135deg, #78716c, #57534e)" },
  { id: 37, name: "Western", icon: "🤠", color: "linear-gradient(135deg, #ca8a04, #a16207)" },
];

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const genreId = searchParams.get("genreId");
    const sortBy = searchParams.get("sortBy") || "popularity.desc";
    const page = searchParams.get("page") || "1";

    if (genreId) {
      const data = await fetchTMDB("/discover/movie", {
        with_genres: genreId,
        sort_by: sortBy,
        page,
        "vote_count.gte": "100",
      });
      return NextResponse.json({ success: true, ...data, genres: GENRE_MAP });
    }

    return NextResponse.json({ success: true, genres: GENRE_MAP });
  } catch (error) {
    console.error("GET /api/tmdb/genres error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch genres", genres: GENRE_MAP },
      { status: 500 }
    );
  }
}
