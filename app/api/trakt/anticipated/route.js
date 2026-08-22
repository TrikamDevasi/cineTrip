import { getTraktAnticipated } from "@/lib/trakt";
import { NextResponse } from "next/server";
export async function GET() {
  const data = await getTraktAnticipated();
  return NextResponse.json(data ?? []);
}
