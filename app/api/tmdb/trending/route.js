import { NextResponse } from "next/server";
import { fetchTMDB } from "@/lib/tmdb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeWindow = searchParams.get("time_window") || "week";
    const data = await fetchTMDB(`/trending/movie/${timeWindow}`);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[API/tmdb/trending]", error.message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trending movies" },
      { status: 500 }
    );
  }
}
