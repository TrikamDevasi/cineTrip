import { NextResponse } from "next/server";
import { fetchTMDB } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Search query missing" },
        { status: 400 }
      );
    }

    const data = await fetchTMDB("/search/multi", { query });
    
    // Filter out people, keep only movies and tv
    const filteredResults = data.results?.filter(
      (item) => item.media_type === "movie" || item.media_type === "tv"
    ) || [];

    return NextResponse.json({ 
      success: true, 
      data: { ...data, results: filteredResults } 
    });
  } catch (error) {
    console.error("API Search Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server Error" },
      { status: 500 }
    );
  }
}
