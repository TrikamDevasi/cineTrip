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
        { success: false, error: "Valid series ID required" },
        { status: 400 }
      );
    }

    const data = await fetchTMDB(`/tv/${id}`, {
      append_to_response: "external_ids,credits,images,videos",
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[API/tmdb/series]", error.message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch series details" },
      { status: 500 }
    );
  }
}
