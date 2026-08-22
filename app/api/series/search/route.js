import { NextResponse } from "next/server";
import { searchSeries } from "@/lib/tmdb/series";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const query = request.nextUrl.searchParams.get("query");

    if (!query || query.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Search query missing" },
        { status: 400 }
      );
    }

    const data = await searchSeries(query);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("API Series Search Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server Error" },
      { status: 500 }
    );
  }
}
