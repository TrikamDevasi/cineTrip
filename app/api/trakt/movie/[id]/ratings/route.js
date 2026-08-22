import { getTraktRatings, getTraktStats } from "@/lib/trakt";
import { NextResponse } from "next/server";
export async function GET(_, { params }) {
  const [ratings, stats] = await Promise.all([
    getTraktRatings(params.id),
    getTraktStats(params.id),
  ]);
  return NextResponse.json({ ratings, stats });
}
