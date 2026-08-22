import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import TripPlan from "@/models/TripPlan";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "guest";

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ success: true, plans: [], fallback: true });
    }

    await dbConnect();
    const plans = await TripPlan.find({ userId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, plans });
  } catch (error) {
    console.error("GET /api/planner error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch plans", plans: [] },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body.movie || !body.cinema || !body.date || !body.time) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: movie, cinema, date, time" },
        { status: 400 }
      );
    }

    if (!process.env.MONGODB_URI) {
      // Return optimistic saved plan with mock ID
      return NextResponse.json({
        success: true,
        plan: {
          _id: `plan-${Date.now()}`,
          ...body,
          status: "upcoming",
          createdAt: new Date().toISOString(),
        },
      });
    }

    await dbConnect();
    const newPlan = await TripPlan.create(body);
    return NextResponse.json({ success: true, plan: newPlan }, { status: 201 });
  } catch (error) {
    console.error("POST /api/planner error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create plan" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing plan ID" }, { status: 400 });
    }

    if (process.env.MONGODB_URI) {
      await dbConnect();
      await TripPlan.findByIdAndDelete(id);
    }

    return NextResponse.json({ success: true, message: "Plan deleted" });
  } catch (error) {
    console.error("DELETE /api/planner error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete plan" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, status, notes, seats } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing plan ID" }, { status: 400 });
    }

    if (process.env.MONGODB_URI) {
      await dbConnect();
      const updated = await TripPlan.findByIdAndUpdate(
        id,
        { $set: { ...(status && { status }), ...(notes && { notes }), ...(seats && { seats }) } },
        { new: true }
      );
      return NextResponse.json({ success: true, plan: updated });
    }

    return NextResponse.json({ success: true, message: "Updated" });
  } catch (error) {
    console.error("PUT /api/planner error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update plan" },
      { status: 500 }
    );
  }
}
