import { NextResponse } from "next/server";
import { fetchTMDB } from "@/lib/tmdb";
import { isValidId } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !isValidId(id)) {
      return NextResponse.json(
        { success: false, error: "Valid movie ID required" },
        { status: 400 }
      );
    }

    const data = await fetchTMDB(`/movie/${id}`, {
      append_to_response: "credits,images,external_ids,videos",
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[API/tmdb/movie]", error.message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch movie details" },
      { status: 500 }
    );
  }
}
