import { NextResponse } from "next/server";
import { fetchTMDB } from "@/lib/tmdb";

export async function GET() {
  try {
    const data = await fetchTMDB("/movie/top_rated");
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[API/tmdb/top]", error.message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch top rated movies" },
      { status: 500 }
    );
  }
}
