import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";
import { sanitize } from "@/lib/validators";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get("mediaId");
    const mediaType = searchParams.get("mediaType") || "movie";

    if (!mediaId) {
      return NextResponse.json(
        { success: false, error: "mediaId is required" },
        { status: 400 }
      );
    }

    await dbConnect();
    const reviews = await Review.find({ mediaId: Number(mediaId), mediaType })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error("[API/reviews GET]", error.message);
    return NextResponse.json({ success: false, reviews: [] });
  }
}

export async function POST(request) {
  // Require authentication to post a review
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "You must be signed in to post a review." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { mediaId, mediaType = "movie", rating, content, spoilers } = body;

    if (!mediaId || !content || !rating) {
      return NextResponse.json(
        { success: false, error: "Missing required review fields" },
        { status: 400 }
      );
    }

    await dbConnect();
    const newReview = await Review.create({
      mediaId: Number(mediaId),
      mediaType,
      userId: session.user.id,           // Real authenticated user ID
      userName: sanitize(session.user.name || "Cinephile Critic", 50),
      rating: Math.min(10, Math.max(1, Number(rating))),
      content: sanitize(content, 2000),
      spoilers: Boolean(spoilers),
    });

    return NextResponse.json({ success: true, review: newReview });
  } catch (error) {
    console.error("[API/reviews POST]", error.message);
    return NextResponse.json(
      { success: false, error: "Failed to post review" },
      { status: 500 }
    );
  }
}
