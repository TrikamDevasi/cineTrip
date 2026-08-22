import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Memory from "@/models/Memory";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "guest";

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ success: true, memories: [], fallback: true });
    }

    await dbConnect();
    const memories = await Memory.find({ userId }).sort({ watchedDate: -1 }).lean();
    return NextResponse.json({ success: true, memories });
  } catch (error) {
    console.error("GET /api/history/memories error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch memories", memories: [] },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body.movie || !body.movie.title) {
      return NextResponse.json(
        { success: false, error: "Movie details are required" },
        { status: 400 }
      );
    }

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        success: true,
        memory: {
          _id: `mem-${Date.now()}`,
          ...body,
          createdAt: new Date().toISOString(),
        },
      });
    }

    await dbConnect();
    const newMemory = await Memory.create(body);
    return NextResponse.json({ success: true, memory: newMemory }, { status: 201 });
  } catch (error) {
    console.error("POST /api/history/memories error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create memory" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing memory ID" }, { status: 400 });
    }

    if (process.env.MONGODB_URI) {
      await dbConnect();
      await Memory.findByIdAndDelete(id);
    }

    return NextResponse.json({ success: true, message: "Memory deleted" });
  } catch (error) {
    console.error("DELETE /api/history/memories error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete memory" },
      { status: 500 }
    );
  }
}
