import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Review from "@/models/Review";
import Watchlist from "@/models/Watchlist";

export async function GET(request) {
  // ── Auth gate ─────────────────────────────────────────────────────────────
  let session;
  try {
    session = await requireAdmin();
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.status || 403 }
    );
  }

  // ── Real DB aggregations ───────────────────────────────────────────────────
  try {
    await dbConnect();

    const [totalUsers, totalReviews, watchlistSaved] = await Promise.all([
      User.countDocuments(),
      Review.countDocuments(),
      Watchlist.countDocuments(),
    ]);

    // Most recent 10 reviews as the activity stream
    const recentReviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("userName mediaId mediaType rating createdAt")
      .lean();

    const recentActivities = recentReviews.map((r, i) => ({
      id: i + 1,
      type: "review",
      text: `${r.userName} rated a ${r.mediaType} ${r.rating}/10`,
      time: new Date(r.createdAt).toLocaleString("en-IN", {
        dateStyle: "short",
        timeStyle: "short",
      }),
    }));

    const stats = {
      overview: {
        totalUsers,
        totalReviews,
        watchlistSaved,
        // These require external telemetry (not yet tracked) — clearly labelled
        apiRequestsToday: null,
        aiTokenUsageToday: null,
      },
      recentActivities,
      // AI provider and search analytics require dedicated telemetry collection.
      // Not yet implemented — will be null until an analytics layer is added.
      aiProviderStats: null,
      popularSearches: null,
    };

    return NextResponse.json({
      success: true,
      stats,
      adminEmail: session.user.email,
    });
  } catch (error) {
    console.error("[API/admin/stats]", error.message);
    return NextResponse.json(
      { success: false, error: "Failed to load admin telemetry" },
      { status: 500 }
    );
  }
}
