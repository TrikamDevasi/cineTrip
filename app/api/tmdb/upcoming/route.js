import { NextResponse } from "next/server";
import { fetchTMDB } from "@/lib/tmdb";

export async function GET() {
  try {
    const data = await fetchTMDB("/movie/upcoming");
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[API/tmdb/upcoming]", error.message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch upcoming movies" },
      { status: 500 }
    );
  }
}
