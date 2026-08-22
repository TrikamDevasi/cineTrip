import { NextResponse } from "next/server";
import { fetchTMDB } from "@/lib/tmdb";
import { isValidId } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { id } = params;

  if (!id || !isValidId(id)) {
    return NextResponse.json({ results: {} });
  }

  try {
    const data = await fetchTMDB(`/movie/${id}/watch/providers`);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API/tmdb/movie/watch-providers]", error.message);
    return NextResponse.json({ results: {} });
  }
}
