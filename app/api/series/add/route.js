import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Series from "@/models/Series";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Validate required fields
    if (!body.tmdbId || !body.title) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if already exists for this user (if userId is provided)
    const query = { tmdbId: body.tmdbId };
    if (body.userId) query.userId = body.userId;

    const existing = await Series.findOne(query);
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Series already in list" },
        { status: 400 }
      );
    }

    const series = await Series.create(body);
    return NextResponse.json({ success: true, data: series });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
