import { NextResponse } from "next/server";
import { fetchTMDB } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const data = await fetchTMDB(`/tv/${id}/watch/providers`);
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Series Providers Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server Error" },
      { status: 500 }
    );
  }
}
