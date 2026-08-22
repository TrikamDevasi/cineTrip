import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Series from "@/models/Series";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const query = {};
    if (userId) query.userId = userId;

    const series = await Series.find(query).sort({ addedAt: -1 });
    return NextResponse.json({ success: true, data: series });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
