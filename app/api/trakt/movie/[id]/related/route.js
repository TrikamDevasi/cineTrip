import { getTraktRelated } from "@/lib/trakt";
import { NextResponse } from "next/server";
export async function GET(_, { params }) {
  const data = await getTraktRelated(params.id);
  return NextResponse.json(data ?? []);
}
