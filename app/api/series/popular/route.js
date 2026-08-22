import { NextResponse } from "next/server";
import { getPopularSeries } from "@/lib/tmdb/series";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getPopularSeries();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
