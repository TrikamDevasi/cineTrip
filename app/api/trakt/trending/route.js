import { getTraktTrending } from "@/lib/trakt";
import { NextResponse } from "next/server";
export async function GET() {
  const data = await getTraktTrending();
  return NextResponse.json(data ?? []);
}
