import { NextResponse } from "next/server";
import { getSeriesSeasons } from "@/lib/tmdb/series";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { id, seasonNumber } = params;
    const data = await getSeriesSeasons(id, seasonNumber);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
