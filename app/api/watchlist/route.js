import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Watchlist from "@/models/Watchlist";

// GET /api/watchlist — fetch all watchlist items for the authenticated user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
  }

  try {
    await dbConnect();
    const items = await Watchlist.find({ userId: session.user.id })
      .sort({ addedAt: -1 })
      .lean();
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("[API/watchlist GET]", error.message);
    return NextResponse.json({ success: false, error: "Failed to fetch watchlist" }, { status: 500 });
  }
}

// POST /api/watchlist — add or update a watchlist entry
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { mediaId, mediaType = "movie", title, posterPath, backdropPath, voteAverage, releaseDate, genres } = body;

    if (!mediaId || !title) {
      return NextResponse.json({ success: false, error: "mediaId and title are required" }, { status: 400 });
    }

    await dbConnect();

    // Upsert — if user already has this item, update it rather than duplicating
    const item = await Watchlist.findOneAndUpdate(
      { userId: session.user.id, mediaId: Number(mediaId), mediaType },
      {
        userId: session.user.id,
        mediaId: Number(mediaId),
        mediaType,
        title,
        posterPath,
        backdropPath,
        voteAverage,
        releaseDate,
        genres: genres || [],
        addedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("[API/watchlist POST]", error.message);
    return NextResponse.json({ success: false, error: "Failed to add to watchlist" }, { status: 500 });
  }
}

// DELETE /api/watchlist — remove an item by mediaId + mediaType
export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get("mediaId");
    const mediaType = searchParams.get("mediaType") || "movie";

    if (!mediaId) {
      return NextResponse.json({ success: false, error: "mediaId is required" }, { status: 400 });
    }

    await dbConnect();
    await Watchlist.deleteOne({
      userId: session.user.id,
      mediaId: Number(mediaId),
      mediaType,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API/watchlist DELETE]", error.message);
    return NextResponse.json({ success: false, error: "Failed to remove from watchlist" }, { status: 500 });
  }
}
