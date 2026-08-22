import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Series from "@/models/Series";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const { id } = params; // We will treat this as the TMDb ID for consistency

    const body = await request.json();

    // Use findOneAndUpdate with tmdbId
    const updated = await Series.findOneAndUpdate(
      { tmdbId: Number(id) },
      body,
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Series not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = params; // We will treat this as the TMDb ID

    const deleted = await Series.findOneAndUpdate(
      { tmdbId: Number(id) },
      { $set: { watchStatus: "dropped" } }, // Or should we actually delete it?
      // The prompt says "remove from list". Let's delete it.
    );

    const result = await Series.findOneAndDelete({ tmdbId: Number(id) });

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Series not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Series removed from list",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
